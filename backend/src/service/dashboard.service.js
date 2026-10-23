import { db } from '../database/client.js';

export class DashboardService {
  /**
   * Fetch comprehensive dashboard analytics
   * @param {Object} query - { startDate, endDate, period }
   */
  static async getSummary({ startDate, endDate, period = 'week' } = {}) {
    // 1. Resolve date filters
    let filterCondition = '';
    const filterParams = [];

    if (startDate && endDate) {
      filterParams.push(startDate, `${endDate} 23:59:59`);
      filterCondition = `s."createdAt" >= $1 AND s."createdAt" <= $2`;
    } else if (startDate && !endDate) {
      filterParams.push(startDate);
      filterCondition = `s."createdAt" >= $1`;
    } else if (!startDate && endDate) {
      filterParams.push(`${endDate} 23:59:59`);
      filterCondition = `s."createdAt" <= $1`;
    } else if (period === 'today') {
      filterCondition = `s."createdAt" >= CURRENT_DATE AND s."createdAt" < CURRENT_DATE + INTERVAL '1 day'`;
    } else if (period === 'month') {
      filterCondition = `s."createdAt" >= date_trunc('month', CURRENT_DATE) AND s."createdAt" < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'`;
    } else if (period === 'year') {
      filterCondition = `s."createdAt" >= date_trunc('year', CURRENT_DATE) AND s."createdAt" < date_trunc('year', CURRENT_DATE) + INTERVAL '1 year'`;
    } else {
      // Default: last 7 days
      filterCondition = `s."createdAt" >= (CURRENT_DATE - INTERVAL '6 days') AND s."createdAt" < CURRENT_DATE + INTERVAL '1 day'`;
    }

    // 2. Query 1: Today's real-time Stats (Today's Sales & Today's Profit)
    const todayRes = await db.query(`
      SELECT 
        COALESCE(SUM(s.total), 0)::numeric as "todaySales",
        COUNT(DISTINCT s.id)::int as "todayTransactions",
        COALESCE(SUM((si."unitPrice" - COALESCE(si."purchaseCost", 0)) * si.quantity), 0)::numeric as "todayProfit"
      FROM "Sale" s
      LEFT JOIN "SaleItem" si ON si."saleId" = s.id
      WHERE s."createdAt" >= CURRENT_DATE AND s."createdAt" < CURRENT_DATE + INTERVAL '1 day'
    `);
    const todayRow = todayRes.rows[0] || {};
    const todaySales = parseFloat(todayRow.todaySales || 0);
    const todayProfit = parseFloat(todayRow.todayProfit || 0);
    const todayMargin = todaySales > 0 ? parseFloat(((todayProfit / todaySales) * 100).toFixed(1)) : 0;
    const todayTransactions = parseInt(todayRow.todayTransactions || 0, 10);

    // 3. Query 2: Period Total Stats (Selected Range Sales & Profit)
    const periodStatsQuery = `
      SELECT 
        COALESCE(SUM(s.total), 0)::numeric as "periodSales",
        COUNT(DISTINCT s.id)::int as "periodTransactions",
        COALESCE(SUM((si."unitPrice" - COALESCE(si."purchaseCost", 0)) * si.quantity), 0)::numeric as "periodProfit"
      FROM "Sale" s
      LEFT JOIN "SaleItem" si ON si."saleId" = s.id
      WHERE ${filterCondition}
    `;
    const periodRes = await db.query(periodStatsQuery, filterParams);
    const periodRow = periodRes.rows[0] || {};
    const periodSales = parseFloat(periodRow.periodSales || 0);
    const periodProfit = parseFloat(periodRow.periodProfit || 0);
    const periodMargin = periodSales > 0 ? parseFloat(((periodProfit / periodSales) * 100).toFixed(1)) : 0;
    const periodTransactions = parseInt(periodRow.periodTransactions || 0, 10);

    // 4. Query 3: Most Sold & Most Profitable Medicines in Period (with all-time fallback if zero in period)
    const topMedsQuery = `
      SELECT 
        m.id,
        m.name,
        COALESCE(c.name, 'General') as category,
        COALESCE(SUM(si.quantity), 0)::int as "quantitySold",
        COALESCE(SUM(si.quantity * si."unitPrice"), 0)::numeric as "totalRevenue",
        COALESCE(SUM((si."unitPrice" - COALESCE(si."purchaseCost", 0)) * si.quantity), 0)::numeric as "totalProfit",
        m.quantity as "currentStock"
      FROM "SaleItem" si
      JOIN "Medicine" m ON m.id = si."medicineId"
      LEFT JOIN "Category" c ON c.id = m."categoryId"
      JOIN "Sale" s ON s.id = si."saleId"
      WHERE ${filterCondition}
      GROUP BY m.id, m.name, c.name, m.quantity
      ORDER BY "quantitySold" DESC
      LIMIT 10
    `;
    let topMedsRes = await db.query(topMedsQuery, filterParams);

    // If no sales in current period, get overall top selling for fallback context
    if (topMedsRes.rows.length === 0) {
      topMedsRes = await db.query(`
        SELECT 
          m.id,
          m.name,
          COALESCE(c.name, 'General') as category,
          COALESCE(SUM(si.quantity), 0)::int as "quantitySold",
          COALESCE(SUM(si.quantity * si."unitPrice"), 0)::numeric as "totalRevenue",
          COALESCE(SUM((si."unitPrice" - COALESCE(si."purchaseCost", 0)) * si.quantity), 0)::numeric as "totalProfit",
          m.quantity as "currentStock"
        FROM "SaleItem" si
        JOIN "Medicine" m ON m.id = si."medicineId"
        LEFT JOIN "Category" c ON c.id = m."categoryId"
        JOIN "Sale" s ON s.id = si."saleId"
        GROUP BY m.id, m.name, c.name, m.quantity
        ORDER BY "quantitySold" DESC
        LIMIT 10
      `);
    }

    const topSellingMedicines = topMedsRes.rows.map((row, idx) => ({
      rank: idx + 1,
      id: row.id,
      name: row.name,
      category: row.category,
      quantitySold: parseInt(row.quantitySold || 0, 10),
      totalRevenue: parseFloat(row.totalRevenue || 0),
      totalProfit: parseFloat(row.totalProfit || 0),
      margin: parseFloat(row.totalRevenue || 0) > 0 
        ? parseFloat(((parseFloat(row.totalProfit || 0) / parseFloat(row.totalRevenue || 0)) * 100).toFixed(1)) 
        : 0,
      currentStock: parseInt(row.currentStock || 0, 10),
    }));

    // Find most sold medicine in period/overall
    const sortedByProfit = [...topSellingMedicines].sort((a, b) => b.totalProfit - a.totalProfit);

    // Query Today's top sold & profitable medicines specifically for Today's Stats Cards
    const todayTopMedsRes = await db.query(`
      SELECT 
        m.id,
        m.name,
        COALESCE(c.name, 'General') as category,
        COALESCE(SUM(si.quantity), 0)::int as "quantitySold",
        COALESCE(SUM(si.quantity * si."unitPrice"), 0)::numeric as "totalRevenue",
        COALESCE(SUM((si."unitPrice" - COALESCE(si."purchaseCost", 0)) * si.quantity), 0)::numeric as "totalProfit",
        m.quantity as "currentStock"
      FROM "SaleItem" si
      JOIN "Medicine" m ON m.id = si."medicineId"
      LEFT JOIN "Category" c ON c.id = m."categoryId"
      JOIN "Sale" s ON s.id = si."saleId"
      WHERE s."createdAt" >= CURRENT_DATE AND s."createdAt" < CURRENT_DATE + INTERVAL '1 day'
      GROUP BY m.id, m.name, c.name, m.quantity
      ORDER BY "quantitySold" DESC
      LIMIT 10
    `);

    let todayMostSold = null;
    let todayMostProfitable = null;

    if (todayTopMedsRes.rows.length > 0) {
      const todayList = todayTopMedsRes.rows.map((row) => ({
        id: row.id,
        name: row.name,
        category: row.category,
        quantitySold: parseInt(row.quantitySold || 0, 10),
        totalRevenue: parseFloat(row.totalRevenue || 0),
        totalProfit: parseFloat(row.totalProfit || 0),
        currentStock: parseInt(row.currentStock || 0, 10),
      }));
      todayMostSold = todayList[0];
      const sortedTodayProfit = [...todayList].sort((a, b) => b.totalProfit - a.totalProfit);
      todayMostProfitable = sortedTodayProfit[0];
    } else {
      // If no sales recorded yet today, indicate 0 units and 0 profit today
      todayMostSold = topSellingMedicines.length > 0 
        ? { ...topSellingMedicines[0], quantitySold: 0, totalProfit: 0 } 
        : null;
      todayMostProfitable = sortedByProfit.length > 0 
        ? { ...sortedByProfit[0], quantitySold: 0, totalProfit: 0 } 
        : null;
    }

    const mostSoldMedicine = todayMostSold;
    const mostProfitableMedicine = todayMostProfitable;

    // 5. Query 4: Feature source Sales/POS: Daily Sales for Last 7 Days (or selected range)
    const salesTrendRes = await db.query(`
      WITH days AS (
        SELECT generate_series(
          CURRENT_DATE - INTERVAL '6 days',
          CURRENT_DATE,
          INTERVAL '1 day'
        )::date AS day
      )
      SELECT 
        d.day::text as "date",
        TO_CHAR(d.day, 'Dy') as "dayName",
        TO_CHAR(d.day, 'Mon DD') as "formattedDate",
        COALESCE(SUM(s.total), 0)::numeric as "sales",
        COUNT(DISTINCT s.id)::int as "transactions",
        COALESCE(SUM((si."unitPrice" - COALESCE(si."purchaseCost", 0)) * si.quantity), 0)::numeric as "profit"
      FROM days d
      LEFT JOIN "Sale" s ON s."createdAt"::date = d.day
      LEFT JOIN "SaleItem" si ON si."saleId" = s.id
      GROUP BY d.day
      ORDER BY d.day ASC
    `);

    const salesTrend7Days = salesTrendRes.rows.map((r) => ({
      date: r.date,
      dayName: r.dayName,
      formattedDate: r.formattedDate,
      sales: parseFloat(r.sales || 0),
      transactions: parseInt(r.transactions || 0, 10),
      profit: parseFloat(r.profit || 0),
    }));

    const total7DaySales = salesTrend7Days.reduce((acc, curr) => acc + curr.sales, 0);
    const avgDailySales = parseFloat((total7DaySales / 7).toFixed(2));
    const highestDay = salesTrend7Days.reduce((prev, curr) => (curr.sales > prev.sales ? curr : prev), salesTrend7Days[0] || { sales: 0, dayName: 'N/A' });

    // 6. Query 5: Feature source Inventory: Stock Distribution Donut (Excess, Normal, Low)
    // Matches InventoryService.getSummary() exact logic:
    // Low: quantity <= 10 (1-10 units + 0 out of stock)
    // Normal: quantity between 11 and 50 units
    // Excess: quantity > 50 units (Stock exceeds >= 50)
    const stockRes = await db.query(`
      SELECT
        COUNT(*)::int as "totalMedicines",
        COALESCE(SUM(quantity), 0)::int as "totalUnits",
        COALESCE(SUM(CASE WHEN quantity = 0 THEN 1 ELSE 0 END), 0)::int as "outOfStockCount",
        COALESCE(SUM(CASE WHEN quantity > 0 AND quantity <= 10 THEN 1 ELSE 0 END), 0)::int as "lowStockCount",
        COALESCE(SUM(CASE WHEN quantity > 50 THEN 1 ELSE 0 END), 0)::int as "excessStockCount",
        COALESCE(SUM(CASE WHEN quantity > 10 AND quantity <= 50 THEN 1 ELSE 0 END), 0)::int as "normalStockCount"
      FROM "Medicine"
    `);
    const stockRow = stockRes.rows[0] || {};
    const totalMeds = parseInt(stockRow.totalMedicines || 0, 10);
    const totalUnits = parseInt(stockRow.totalUnits || 0, 10);
    const excessCount = parseInt(stockRow.excessStockCount || 0, 10);
    const normalCount = parseInt(stockRow.normalStockCount || 0, 10);
    const lowCount = parseInt(stockRow.lowStockCount || 0, 10) + parseInt(stockRow.outOfStockCount || 0, 10);
    const outOfStockCount = parseInt(stockRow.outOfStockCount || 0, 10);

    const stockDistribution = {
      total: totalMeds,
      totalUnits,
      outOfStockCount,
      excess: {
        count: excessCount,
        percentage: totalMeds > 0 ? parseFloat(((excessCount / totalMeds) * 100).toFixed(1)) : 0,
        label: 'Excess Stock (≥ 50)',
        description: 'Stock exceeds target level (> 50 units)',
        color: '#6366f1', // indigo-500
      },
      normal: {
        count: normalCount,
        percentage: totalMeds > 0 ? parseFloat(((normalCount / totalMeds) * 100).toFixed(1)) : 0,
        label: 'Normal Stock (11-50)',
        description: 'Safe stock level (11 - 50 units)',
        color: '#10b981', // emerald-500
      },
      low: {
        count: lowCount,
        percentage: totalMeds > 0 ? parseFloat(((lowCount / totalMeds) * 100).toFixed(1)) : 0,
        label: 'Low Stock (1-10)',
        description: 'Low stock threshold (≤ 10 units)',
        color: '#f59e0b', // amber-500
      },
    };

    // 7. Query 6: Most Near to Expire Medicines (from Batches with fallback to Medicine expiryDate)
    const nearExpiryRes = await db.query(`
      SELECT 
        b.id as "batchId",
        b."batchNo",
        m.id as "medicineId",
        m.name as "medicineName",
        m."genericName",
        COALESCE(c.name, 'General') as category,
        b.quantity as "batchStock",
        m.quantity as "totalStock",
        b."expiryDate",
        ROUND(EXTRACT(EPOCH FROM (b."expiryDate" - CURRENT_TIMESTAMP)) / 86400)::int as "daysLeft"
      FROM "Batch" b
      JOIN "Medicine" m ON m.id = b."medicineId"
      LEFT JOIN "Category" c ON c.id = m."categoryId"
      WHERE b.quantity > 0 AND b.status = 'ACTIVE'
      ORDER BY b."expiryDate" ASC
      LIMIT 10
    `);

    let nearExpiryMedicines = nearExpiryRes.rows.map((row) => {
      const daysLeft = parseInt(row.daysLeft || 0, 10);
      let status = 'GOOD';
      if (daysLeft < 0) status = 'EXPIRED';
      else if (daysLeft <= 30) status = 'CRITICAL';
      else if (daysLeft <= 90) status = 'WARNING';

      return {
        id: row.batchId,
        batchNo: row.batchNo || 'N/A',
        medicineId: row.medicineId,
        medicineName: row.medicineName,
        genericName: row.genericName || '',
        category: row.category,
        batchStock: parseInt(row.batchStock || 0, 10),
        totalStock: parseInt(row.totalStock || 0, 10),
        expiryDate: row.expiryDate,
        daysLeft,
        status,
      };
    });

    // If no batches exist, check Medicine table directly
    if (nearExpiryMedicines.length === 0) {
      const medExpiryRes = await db.query(`
        SELECT 
          m.id as "medicineId",
          m.name as "medicineName",
          m."genericName",
          COALESCE(c.name, 'General') as category,
          m.quantity as "totalStock",
          m."expiryDate",
          ROUND(EXTRACT(EPOCH FROM (m."expiryDate" - CURRENT_TIMESTAMP)) / 86400)::int as "daysLeft"
        FROM "Medicine" m
        LEFT JOIN "Category" c ON c.id = m."categoryId"
        WHERE m."expiryDate" IS NOT NULL AND m.quantity > 0
        ORDER BY m."expiryDate" ASC
        LIMIT 10
      `);

      nearExpiryMedicines = medExpiryRes.rows.map((row) => {
        const daysLeft = parseInt(row.daysLeft || 0, 10);
        let status = 'GOOD';
        if (daysLeft < 0) status = 'EXPIRED';
        else if (daysLeft <= 30) status = 'CRITICAL';
        else if (daysLeft <= 90) status = 'WARNING';

        return {
          id: row.medicineId,
          batchNo: 'Standard',
          medicineId: row.medicineId,
          medicineName: row.medicineName,
          genericName: row.genericName || '',
          category: row.category,
          batchStock: parseInt(row.totalStock || 0, 10),
          totalStock: parseInt(row.totalStock || 0, 10),
          expiryDate: row.expiryDate,
          daysLeft,
          status,
        };
      });
    }

    return {
      today: {
        sales: todaySales,
        profit: todayProfit,
        margin: todayMargin,
        transactions: todayTransactions,
      },
      period: {
        sales: periodSales,
        profit: periodProfit,
        margin: periodMargin,
        transactions: periodTransactions,
        selectedPeriod: period,
        startDate: startDate || null,
        endDate: endDate || null,
      },
      mostSoldMedicine,
      mostProfitableMedicine,
      salesTrend: {
        daily: salesTrend7Days,
        total7DaySales,
        avgDailySales,
        highestDay,
      },
      stockDistribution,
      topSellingMedicines,
      nearExpiryMedicines,
    };
  }
}

