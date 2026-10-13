import { db } from '../database/client.js';
import crypto from 'crypto';

export class InventoryService {
  /**
   * Determine stock status based on quantity:
   * - 0: OUT_OF_STOCK
   * - 1 - 10: LOW_STOCK
   * - >= 100: EXCESS_STOCK
   * - 11 - 99: NORMAL
   */
  getStockStatus(quantity) {
    if (quantity <= 0) return 'OUT_OF_STOCK';
    if (quantity <= 10) return 'LOW_STOCK';
    if (quantity >= 100) return 'EXCESS_STOCK';
    return 'NORMAL';
  }

  /**
   * Format individual medicine record with computed individual total cost
   */
  formatItem(row) {
    const quantity = parseInt(row.quantity, 10) || 0;
    const purchaseCost = parseFloat(row.purchaseCost || 0);
    const sellingPrice = parseFloat(row.sellingPrice || 0);
    const totalCost = parseFloat((quantity * purchaseCost).toFixed(2));
    const totalSellingPrice = parseFloat((quantity * sellingPrice).toFixed(2));

    return {
      id: row.id,
      name: row.name,
      quantity,
      purchaseCost,
      sellingPrice,
      totalCost,
      totalSellingPrice,
      purchaseDate: row.purchaseDate ? row.purchaseDate.toISOString?.().split('T')[0] || String(row.purchaseDate).split('T')[0] : null,
      stockStatus: this.getStockStatus(quantity),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  /**
   * 1. Get Summary: Whole cost invested, counts, low stock, excess stock
   */
  async getSummary() {
    // Total whole investment cost: SUM(quantity * purchaseCost)
    const investmentRes = await db.query(`
      SELECT 
        COUNT(*)::int as "totalMedicines",
        COALESCE(SUM(quantity), 0)::int as "totalUnits",
        COALESCE(SUM(quantity * "purchaseCost"), 0)::numeric as "totalInventoryCost",
        COALESCE(SUM(quantity * "sellingPrice"), 0)::numeric as "totalSellingValue",
        COALESCE(SUM(CASE WHEN quantity = 0 THEN 1 ELSE 0 END), 0)::int as "outOfStockCount",
        COALESCE(SUM(CASE WHEN quantity > 0 AND quantity <= 10 THEN 1 ELSE 0 END), 0)::int as "lowStockCount",
        COALESCE(SUM(CASE WHEN quantity >= 100 THEN 1 ELSE 0 END), 0)::int as "excessStockCount"
      FROM "Medicine"
    `);

    const row = investmentRes.rows[0];
    const totalInventoryCost = parseFloat(row.totalInventoryCost || 0).toFixed(2);
    const totalSellingValue = parseFloat(row.totalSellingValue || 0).toFixed(2);
    const totalEstimatedProfit = parseFloat((Number(totalSellingValue) - Number(totalInventoryCost)).toFixed(2));

    return {
      totalMedicines: row.totalMedicines || 0,
      totalUnits: row.totalUnits || 0,
      totalInventoryCost: Number(totalInventoryCost),
      totalSellingValue: Number(totalSellingValue),
      totalEstimatedProfit,
      outOfStockCount: row.outOfStockCount || 0,
      lowStockCount: row.lowStockCount || 0,
      excessStockCount: row.excessStockCount || 0,
    };
  }

  /**
   * 2. List Inventory items with search and pagination
   */
  async getInventory({ search = '', page = 1, limit = 10 } = {}) {
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (search && search.trim() !== '') {
      conditions.push(`LOWER(name) LIKE $${paramIndex}`);
      values.push(`%${search.trim().toLowerCase()}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count
    const countSql = `SELECT COUNT(*)::int as total FROM "Medicine" ${whereClause}`;
    const countRes = await db.query(countSql, values);
    const total = countRes.rows[0].total;

    // Data
    const offset = (page - 1) * limit;
    const queryValues = [...values, limit, offset];

    const dataSql = `
      SELECT * FROM "Medicine"
      ${whereClause}
      ORDER BY LOWER(name) ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const dataRes = await db.query(dataSql, queryValues);
    const items = dataRes.rows.map((r) => this.formatItem(r));

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * 3. Add Stock (+)
   * If medicine exists: add onto the same medicine and update inventory automatically.
   * If medicine does not exist: create new medicine and set initial stock.
   */
  async addStock({ name, quantity, purchaseCost, sellingPrice, purchaseDate, user }) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      const trimmedName = name.trim();
      const pDate = purchaseDate || new Date().toISOString().split('T')[0];

      // Check if medicine exists by name (case-insensitive)
      const existingRes = await client.query(
        'SELECT * FROM "Medicine" WHERE LOWER(TRIM(name)) = LOWER($1) LIMIT 1 FOR UPDATE',
        [trimmedName]
      );

      let medicine;
      let prevQty = 0;
      let newQty = quantity;

      if (existingRes.rows.length > 0) {
        // Exists: Add to existing stock and update prices and purchase date
        const existing = existingRes.rows[0];
        prevQty = parseInt(existing.quantity, 10) || 0;
        newQty = prevQty + quantity;

        const updateRes = await client.query(
          `UPDATE "Medicine" 
           SET quantity = $1, 
               "purchaseCost" = $2, 
               "sellingPrice" = $3, 
               price = $3,
               "purchaseDate" = $4,
               "updatedAt" = NOW()
           WHERE id = $5
           RETURNING *`,
          [newQty, purchaseCost, sellingPrice, pDate, existing.id]
        );
        medicine = updateRes.rows[0];
      } else {
        // Does not exist: Create new medicine record
        const id = crypto.randomUUID();
        const insertRes = await client.query(
          `INSERT INTO "Medicine" ("id", "name", "quantity", "purchaseCost", "sellingPrice", "price", "purchaseDate", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $5, $6, NOW())
           RETURNING *`,
          [id, trimmedName, quantity, purchaseCost, sellingPrice, pDate]
        );
        medicine = insertRes.rows[0];
      }

      // Record transaction
      const transactionId = crypto.randomUUID();
      const totalPrice = parseFloat((quantity * purchaseCost).toFixed(2));

      await client.query(
        `INSERT INTO "InventoryTransaction"
         ("id", "type", "medicineId", "quantity", "previousQuantity", "newQuantity", "purchaseCost", "sellingPrice", "totalPrice", "purchaseDate", "reason", "userId", "userName", "createdAt")
         VALUES ($1, 'ADD', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())`,
        [
          transactionId,
          medicine.id,
          quantity,
          prevQty,
          newQty,
          purchaseCost,
          sellingPrice,
          totalPrice,
          pDate,
          'Stock addition',
          user?.id || null,
          user?.name || user?.email || 'Staff',
        ]
      );

      await client.query('COMMIT');
      return this.formatItem(medicine);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * 4. Reduce / Subtract Stock (-)
   * Reduce from the same medicine, preventing negative stock.
   */
  async reduceStock({ medicineId, quantity, reason, date, user }) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      const medRes = await client.query(
        'SELECT * FROM "Medicine" WHERE id = $1 FOR UPDATE',
        [medicineId]
      );

      if (medRes.rows.length === 0) {
        const error = new Error('Medicine not found in inventory');
        error.statusCode = 404;
        throw error;
      }

      const medicine = medRes.rows[0];
      const prevQty = parseInt(medicine.quantity, 10) || 0;

      // Prevent negative stock
      if (prevQty < quantity) {
        const error = new Error(`Cannot reduce stock. Current available quantity is only ${prevQty} units.`);
        error.statusCode = 400;
        throw error;
      }

      const newQty = prevQty - quantity;
      const rDate = date || new Date().toISOString().split('T')[0];

      const updateRes = await client.query(
        `UPDATE "Medicine" 
         SET quantity = $1, "updatedAt" = NOW() 
         WHERE id = $2 
         RETURNING *`,
        [newQty, medicineId]
      );

      const updatedMedicine = updateRes.rows[0];
      const purchaseCost = parseFloat(medicine.purchaseCost || 0);
      const sellingPrice = parseFloat(medicine.sellingPrice || 0);
      const totalPrice = parseFloat((quantity * purchaseCost).toFixed(2));

      // Record transaction
      const transactionId = crypto.randomUUID();
      await client.query(
        `INSERT INTO "InventoryTransaction"
         ("id", "type", "medicineId", "quantity", "previousQuantity", "newQuantity", "purchaseCost", "sellingPrice", "totalPrice", "purchaseDate", "reason", "userId", "userName", "createdAt")
         VALUES ($1, 'SUBTRACT', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())`,
        [
          transactionId,
          medicineId,
          quantity,
          prevQty,
          newQty,
          purchaseCost,
          sellingPrice,
          totalPrice,
          rDate,
          reason || 'Stock deduction',
          user?.id || null,
          user?.name || user?.email || 'Staff',
        ]
      );

      await client.query('COMMIT');
      return this.formatItem(updatedMedicine);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * 5. Edit Medicine Information
   */
  async editMedicine(id, { name, quantity, purchaseCost, sellingPrice, purchaseDate }) {
    const existing = await db.query(
      'SELECT * FROM "Medicine" WHERE id = $1 LIMIT 1',
      [id]
    );

    if (existing.rows.length === 0) {
      const error = new Error('Medicine not found');
      error.statusCode = 404;
      throw error;
    }

    const current = existing.rows[0];

    // If changing name, ensure uniqueness
    if (name && name.trim().toLowerCase() !== current.name.toLowerCase()) {
      const duplicate = await db.query(
        'SELECT id FROM "Medicine" WHERE LOWER(TRIM(name)) = LOWER($1) AND id != $2 LIMIT 1',
        [name.trim(), id]
      );
      if (duplicate.rows.length > 0) {
        const error = new Error(`A medicine with the name "${name.trim()}" already exists.`);
        error.statusCode = 409;
        throw error;
      }
    }

    const newName = name !== undefined ? name.trim() : current.name;
    const newQty = quantity !== undefined ? quantity : current.quantity;
    const newPurchaseCost = purchaseCost !== undefined ? purchaseCost : current.purchaseCost;
    const newSellingPrice = sellingPrice !== undefined ? sellingPrice : current.sellingPrice;
    const newDate = purchaseDate !== undefined ? purchaseDate : current.purchaseDate;

    const res = await db.query(
      `UPDATE "Medicine"
       SET name = $1,
           quantity = $2,
           "purchaseCost" = $3,
           "sellingPrice" = $4,
           price = $4,
           "purchaseDate" = $5,
           "updatedAt" = NOW()
       WHERE id = $6
       RETURNING *`,
      [newName, newQty, newPurchaseCost, newSellingPrice, newDate, id]
    );

    return this.formatItem(res.rows[0]);
  }

  /**
   * 6. Recent inventory movement history
   */
  async getMovements({ page = 1, limit = 20 } = {}) {
    const countRes = await db.query('SELECT COUNT(*)::int as total FROM "InventoryTransaction"');
    const total = countRes.rows[0].total;

    const offset = (page - 1) * limit;
    const sql = `
      SELECT 
        it.id,
        it.type,
        it."medicineId",
        m.name as "medicineName",
        it.quantity,
        it."previousQuantity",
        it."newQuantity",
        it."purchaseCost",
        it."sellingPrice",
        it."totalPrice",
        it."purchaseDate",
        it.reason,
        it."userName",
        it."createdAt"
      FROM "InventoryTransaction" it
      JOIN "Medicine" m ON it."medicineId" = m.id
      ORDER BY it."createdAt" DESC
      LIMIT $1 OFFSET $2
    `;

    const res = await db.query(sql, [limit, offset]);
    return {
      items: res.rows.map((row) => ({
        ...row,
        purchaseCost: parseFloat(row.purchaseCost || 0),
        sellingPrice: parseFloat(row.sellingPrice || 0),
        totalPrice: parseFloat(row.totalPrice || 0),
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }
}

export const inventoryService = new InventoryService();

