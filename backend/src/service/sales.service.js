import { db } from '../database/client.js';
import crypto from 'crypto';

export class SalesService {
  /**
   * 1. Get comprehensive Sales & Profit Analytics
   * Daily & Monthly totals, most selling & less selling medicines
   */
  async getAnalytics() {
    // A. Daily & Monthly totals and profits
    const totalsRes = await db.query(`
      SELECT
        -- Daily totals
        COALESCE(SUM(CASE WHEN DATE(s."createdAt") = CURRENT_DATE THEN s.total ELSE 0 END), 0)::numeric as "dailySell",
        COALESCE(COUNT(CASE WHEN DATE(s."createdAt") = CURRENT_DATE THEN 1 END), 0)::int as "dailyTransactions",
        COALESCE(SUM(CASE WHEN DATE(s."createdAt") = CURRENT_DATE THEN si.quantity * (si."unitPrice" - si."purchaseCost") ELSE 0 END), 0)::numeric as "dailyProfit",
        COALESCE(SUM(CASE WHEN DATE(s."createdAt") = CURRENT_DATE THEN si.quantity ELSE 0 END), 0)::int as "dailyUnitsSold",

        -- Monthly totals
        COALESCE(SUM(CASE WHEN DATE_TRUNC('month', s."createdAt") = DATE_TRUNC('month', CURRENT_DATE) THEN s.total ELSE 0 END), 0)::numeric as "monthlySell",
        COALESCE(COUNT(DISTINCT CASE WHEN DATE_TRUNC('month', s."createdAt") = DATE_TRUNC('month', CURRENT_DATE) THEN s.id END), 0)::int as "monthlyTransactions",
        COALESCE(SUM(CASE WHEN DATE_TRUNC('month', s."createdAt") = DATE_TRUNC('month', CURRENT_DATE) THEN si.quantity * (si."unitPrice" - si."purchaseCost") ELSE 0 END), 0)::numeric as "monthlyProfit",
        COALESCE(SUM(CASE WHEN DATE_TRUNC('month', s."createdAt") = DATE_TRUNC('month', CURRENT_DATE) THEN si.quantity ELSE 0 END), 0)::int as "monthlyUnitsSold"
      FROM "Sale" s
      LEFT JOIN "SaleItem" si ON s.id = si."saleId"
    `);

    const summaryRow = totalsRes.rows[0] || {};
    const dailySell = parseFloat(summaryRow.dailySell || 0);
    const monthlySell = parseFloat(summaryRow.monthlySell || 0);
    const dailyProfit = parseFloat(summaryRow.dailyProfit || 0);
    const monthlyProfit = parseFloat(summaryRow.monthlyProfit || 0);
    const dailyTransactions = parseInt(summaryRow.dailyTransactions || 0, 10);
    const monthlyTransactions = parseInt(summaryRow.monthlyTransactions || 0, 10);
    const dailyUnitsSold = parseInt(summaryRow.dailyUnitsSold || 0, 10);
    const monthlyUnitsSold = parseInt(summaryRow.monthlyUnitsSold || 0, 10);

    // B. Most Selling Medicine Daily (Ranked by quantity sold)
    const mostDailyRes = await db.query(`
      SELECT 
        m.id as "medicineId",
        m.name as "medicineName",
        m.quantity as "currentStock",
        COALESCE(m."purchaseCost", 0)::numeric as "purchasePrice",
        COALESCE(m."sellingPrice", m.price, 0)::numeric as "sellingPrice",
        SUM(si.quantity)::int as "quantitySold",
        SUM(si.quantity * si."unitPrice")::numeric as "totalRevenue",
        SUM(si.quantity * (si."unitPrice" - si."purchaseCost"))::numeric as "totalProfit"
      FROM "SaleItem" si
      JOIN "Sale" s ON si."saleId" = s.id
      JOIN "Medicine" m ON si."medicineId" = m.id
      WHERE DATE(s."createdAt") = CURRENT_DATE
      GROUP BY m.id, m.name, m.quantity, m."purchaseCost", m."sellingPrice", m.price
      ORDER BY "quantitySold" DESC, "totalRevenue" DESC
      LIMIT 100
    `);

    // C. Most Selling Medicine Monthly (Ranked by quantity sold)
    const mostMonthlyRes = await db.query(`
      SELECT 
        m.id as "medicineId",
        m.name as "medicineName",
        m.quantity as "currentStock",
        COALESCE(m."purchaseCost", 0)::numeric as "purchasePrice",
        COALESCE(m."sellingPrice", m.price, 0)::numeric as "sellingPrice",
        SUM(si.quantity)::int as "quantitySold",
        SUM(si.quantity * si."unitPrice")::numeric as "totalRevenue",
        SUM(si.quantity * (si."unitPrice" - si."purchaseCost"))::numeric as "totalProfit"
      FROM "SaleItem" si
      JOIN "Sale" s ON si."saleId" = s.id
      JOIN "Medicine" m ON si."medicineId" = m.id
      WHERE DATE_TRUNC('month', s."createdAt") = DATE_TRUNC('month', CURRENT_DATE)
      GROUP BY m.id, m.name, m.quantity, m."purchaseCost", m."sellingPrice", m.price
      ORDER BY "quantitySold" DESC, "totalRevenue" DESC
      LIMIT 100
    `);

    // D. Less Selling Medicine Daily (Least sold medicines that had sales today, plus low turnover)
    const lessDailyRes = await db.query(`
      SELECT 
        m.id as "medicineId",
        m.name as "medicineName",
        m.quantity as "currentStock",
        COALESCE(m."purchaseCost", 0)::numeric as "purchasePrice",
        COALESCE(m."sellingPrice", m.price, 0)::numeric as "sellingPrice",
        COALESCE(SUM(si.quantity), 0)::int as "quantitySold",
        COALESCE(SUM(si.quantity * si."unitPrice"), 0)::numeric as "totalRevenue",
        COALESCE(SUM(si.quantity * (si."unitPrice" - si."purchaseCost")), 0)::numeric as "totalProfit"
      FROM "SaleItem" si
      JOIN "Sale" s ON si."saleId" = s.id
      JOIN "Medicine" m ON si."medicineId" = m.id
      WHERE DATE(s."createdAt") = CURRENT_DATE
      GROUP BY m.id, m.name, m.quantity, m."purchaseCost", m."sellingPrice", m.price
      ORDER BY "quantitySold" ASC, "totalRevenue" ASC
      LIMIT 5
    `);

    // E. Less Selling Medicine Monthly
    const lessMonthlyRes = await db.query(`
      SELECT 
        m.id as "medicineId",
        m.name as "medicineName",
        m.quantity as "currentStock",
        COALESCE(m."purchaseCost", 0)::numeric as "purchasePrice",
        COALESCE(m."sellingPrice", m.price, 0)::numeric as "sellingPrice",
        COALESCE(SUM(si.quantity), 0)::int as "quantitySold",
        COALESCE(SUM(si.quantity * si."unitPrice"), 0)::numeric as "totalRevenue",
        COALESCE(SUM(si.quantity * (si."unitPrice" - si."purchaseCost")), 0)::numeric as "totalProfit"
      FROM "SaleItem" si
      JOIN "Sale" s ON si."saleId" = s.id
      JOIN "Medicine" m ON si."medicineId" = m.id
      WHERE DATE_TRUNC('month', s."createdAt") = DATE_TRUNC('month', CURRENT_DATE)
      GROUP BY m.id, m.name, m.quantity, m."purchaseCost", m."sellingPrice", m.price
      ORDER BY "quantitySold" ASC, "totalRevenue" ASC
      LIMIT 5
    `);

    const formatList = (rows) =>
      rows.map((r) => ({
        medicineId: r.medicineId,
        medicineName: r.medicineName,
        currentStock: parseInt(r.currentStock, 10) || 0,
        purchasePrice: parseFloat(r.purchasePrice || 0),
        sellingPrice: parseFloat(r.sellingPrice || 0),
        unitProfit: parseFloat((parseFloat(r.sellingPrice || 0) - parseFloat(r.purchasePrice || 0)).toFixed(2)),
        quantitySold: parseInt(r.quantitySold, 10) || 0,
        totalRevenue: parseFloat(r.totalRevenue || 0),
        totalProfit: parseFloat(r.totalProfit || 0),
      }));

    return {
      daily: {
        totalSell: dailySell,
        totalProfit: dailyProfit,
        transactions: dailyTransactions,
        unitsSold: dailyUnitsSold,
        mostSelling: formatList(mostDailyRes.rows),
        lessSelling: formatList(lessDailyRes.rows),
      },
      monthly: {
        totalSell: monthlySell,
        totalProfit: monthlyProfit,
        transactions: monthlyTransactions,
        unitsSold: monthlyUnitsSold,
        mostSelling: formatList(mostMonthlyRes.rows),
        lessSelling: formatList(lessMonthlyRes.rows),
      },
    };
  }

  /**
   * 2. Process and complete a POS Sale
   * Validates stock, decrements medicine quantity, creates Sale and SaleItems, logs InventoryTransaction
   */
  async createSale({ items, patientId = null, user }) {
    if (!items || items.length === 0) {
      const err = new Error('No items provided in sale cart');
      err.statusCode = 400;
      throw err;
    }

    const client = await db.connect();
    try {
      await client.query('BEGIN');

      const saleId = crypto.randomUUID();
      const saleDate = new Date();
      let totalSaleAmount = 0;
      let totalProfitAmount = 0;
      const saleItemsToInsert = [];

      for (const item of items) {
        const { medicineId, quantity } = item;
        const qtyNum = parseInt(quantity, 10);
        if (isNaN(qtyNum) || qtyNum <= 0) {
          const err = new Error('Each item must have a valid quantity greater than 0');
          err.statusCode = 400;
          throw err;
        }

        // Lock medicine row to prevent race conditions & negative stock
        const medRes = await client.query(
          'SELECT * FROM "Medicine" WHERE id = $1 FOR UPDATE',
          [medicineId]
        );

        if (medRes.rows.length === 0) {
          const err = new Error(`Medicine not found for ID: ${medicineId}`);
          err.statusCode = 404;
          throw err;
        }

        const medicine = medRes.rows[0];
        const currentQty = parseInt(medicine.quantity, 10) || 0;

        if (currentQty < qtyNum) {
          const err = new Error(
            `Insufficient stock for "${medicine.name}". Available: ${currentQty} units, Requested: ${qtyNum} units.`
          );
          err.statusCode = 400;
          throw err;
        }

        const unitPrice =
          item.unitPrice !== undefined
            ? parseFloat(item.unitPrice)
            : parseFloat(medicine.sellingPrice || medicine.price || 0);

        const purchaseCost = parseFloat(medicine.purchaseCost || 0);
        const itemTotal = parseFloat((qtyNum * unitPrice).toFixed(2));
        const itemProfit = parseFloat((qtyNum * (unitPrice - purchaseCost)).toFixed(2));

        totalSaleAmount += itemTotal;
        totalProfitAmount += itemProfit;

        // Decrement stock in Medicine table
        const newQty = currentQty - qtyNum;
        await client.query(
          `UPDATE "Medicine" 
           SET quantity = $1, "updatedAt" = NOW() 
           WHERE id = $2`,
          [newQty, medicineId]
        );

        // Record in InventoryTransaction for complete audit traceability
        const itId = crypto.randomUUID();
        await client.query(
          `INSERT INTO "InventoryTransaction"
           ("id", "type", "medicineId", "quantity", "previousQuantity", "newQuantity", "purchaseCost", "sellingPrice", "totalPrice", "purchaseDate", "reason", "userId", "userName", "createdAt")
           VALUES ($1, 'SUBTRACT', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())`,
          [
            itId,
            medicineId,
            qtyNum,
            currentQty,
            newQty,
            purchaseCost,
            unitPrice,
            itemTotal,
            saleDate.toISOString().split('T')[0],
            'POS Customer Sale',
            user?.id || null,
            user?.name || user?.email || 'Cashier',
          ]
        );

        saleItemsToInsert.push({
          id: crypto.randomUUID(),
          saleId,
          medicineId,
          medicineName: medicine.name,
          quantity: qtyNum,
          unitPrice,
          purchaseCost,
          itemTotal,
          itemProfit,
        });
      }

      totalSaleAmount = parseFloat(totalSaleAmount.toFixed(2));
      totalProfitAmount = parseFloat(totalProfitAmount.toFixed(2));

      // Ensure valid userId for foreign key constraint
      let validUserId = user?.id;
      if (validUserId) {
        const uCheck = await client.query('SELECT id FROM "User" WHERE id = $1 LIMIT 1', [validUserId]);
        if (uCheck.rows.length === 0) {
          validUserId = null;
        }
      }
      if (!validUserId) {
        const fallbackUser = await client.query('SELECT id FROM "User" LIMIT 1');
        validUserId = fallbackUser.rows[0]?.id;
      }

      // Insert Sale
      await client.query(
        `INSERT INTO "Sale" ("id", "userId", "patientId", "total", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, NOW(), NOW())`,
        [saleId, validUserId, patientId || null, totalSaleAmount]
      );

      // Insert SaleItems
      for (const si of saleItemsToInsert) {
        await client.query(
          `INSERT INTO "SaleItem" ("id", "saleId", "medicineId", "quantity", "unitPrice", "purchaseCost")
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [si.id, si.saleId, si.medicineId, si.quantity, si.unitPrice, si.purchaseCost]
        );
      }

      await client.query('COMMIT');

      return {
        id: saleId,
        total: totalSaleAmount,
        totalProfit: totalProfitAmount,
        createdAt: saleDate,
        cashierName: user?.name || user?.email || 'Staff',
        items: saleItemsToInsert,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * 3. Get Sales History with pagination & filters
   */
  async getSales({ page = 1, limit = 15, search = '', startDate = '', endDate = '' } = {}) {
    const conditions = [];
    const values = [];
    let pIdx = 1;

    if (search && search.trim() !== '') {
      conditions.push(`(s.id::text ILIKE $${pIdx} OR u.name ILIKE $${pIdx} OR EXISTS (
        SELECT 1 FROM "SaleItem" si2 
        JOIN "Medicine" m2 ON si2."medicineId" = m2.id 
        WHERE si2."saleId" = s.id AND m2.name ILIKE $${pIdx}
      ))`);
      values.push(`%${search.trim()}%`);
      pIdx++;
    }

    if (startDate) {
      conditions.push(`DATE(s."createdAt") >= $${pIdx}`);
      values.push(startDate);
      pIdx++;
    }

    if (endDate) {
      conditions.push(`DATE(s."createdAt") <= $${pIdx}`);
      values.push(endDate);
      pIdx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `
      SELECT COUNT(DISTINCT s.id)::int as total
      FROM "Sale" s
      LEFT JOIN "User" u ON s."userId" = u.id
      ${whereClause}
    `;
    const countRes = await db.query(countSql, values);
    const total = countRes.rows[0]?.total || 0;

    const offset = (page - 1) * limit;
    const queryValues = [...values, limit, offset];

    const dataSql = `
      SELECT 
        s.id,
        s.total,
        s."createdAt",
        s."userId",
        u.name as "cashierName",
        COALESCE(SUM(si.quantity * (si."unitPrice" - si."purchaseCost")), 0)::numeric as "totalProfit",
        COALESCE(SUM(si.quantity), 0)::int as "totalQuantity",
        json_agg(
          json_build_object(
            'id', si.id,
            'medicineId', si."medicineId",
            'medicineName', m.name,
            'quantity', si.quantity,
            'unitPrice', si."unitPrice",
            'purchaseCost', si."purchaseCost",
            'totalPrice', (si.quantity * si."unitPrice"),
            'profit', (si.quantity * (si."unitPrice" - si."purchaseCost"))
          )
        ) as items
      FROM "Sale" s
      LEFT JOIN "User" u ON s."userId" = u.id
      LEFT JOIN "SaleItem" si ON s.id = si."saleId"
      LEFT JOIN "Medicine" m ON si."medicineId" = m.id
      ${whereClause}
      GROUP BY s.id, s.total, s."createdAt", s."userId", u.name
      ORDER BY s."createdAt" DESC
      LIMIT $${pIdx} OFFSET $${pIdx + 1}
    `;

    const dataRes = await db.query(dataSql, queryValues);

    const sales = dataRes.rows.map((row) => ({
      id: row.id,
      total: parseFloat(row.total || 0),
      totalProfit: parseFloat(row.totalProfit || 0),
      totalQuantity: parseInt(row.totalQuantity || 0, 10),
      cashierName: row.cashierName || 'Staff',
      createdAt: row.createdAt,
      items: (row.items || []).filter((i) => i.id !== null),
    }));

    return {
      sales,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * 4. List medicines for POS terminal
   */
  async getMedicinesForPOS({ search = '' } = {}) {
    const conditions = [];
    const values = [];
    let pIdx = 1;

    if (search && search.trim() !== '') {
      conditions.push(`LOWER(name) LIKE $${pIdx}`);
      values.push(`%${search.trim().toLowerCase()}%`);
      pIdx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        id,
        name,
        quantity,
        COALESCE("purchaseCost", 0)::numeric as "purchaseCost",
        COALESCE("sellingPrice", price, 0)::numeric as "sellingPrice",
        barcode,
        "purchaseDate"
      FROM "Medicine"
      ${whereClause}
      ORDER BY name ASC
      LIMIT 100
    `;

    const res = await db.query(sql, values);

    return res.rows.map((r) => {
      const quantity = parseInt(r.quantity, 10) || 0;
      const purchaseCost = parseFloat(r.purchaseCost || 0);
      const sellingPrice = parseFloat(r.sellingPrice || 0);
      const profitPerUnit = parseFloat((sellingPrice - purchaseCost).toFixed(2));

      return {
        id: r.id,
        name: r.name,
        quantity,
        purchaseCost,
        sellingPrice,
        profitPerUnit,
        barcode: r.barcode,
        purchaseDate: r.purchaseDate,
      };
    });
  }
}

export const salesService = new SalesService();
