import { db } from '../database/client.js';

export class ReportsService {
  /**
   * Helper to normalize date ranges from presets or custom inputs
   * @param {Object} params - { period, startDate, endDate }
   * @returns {Object} { start, end, label, preset }
   */
  resolveDateRange({ period = 'month', startDate = '', endDate = '' } = {}) {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const toYmd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    const todayStr = toYmd(now);

    // If explicit custom dates are provided, prioritize custom
    if (startDate && endDate) {
      return {
        startDate,
        endDate,
        preset: 'custom',
        label: `${startDate} to ${endDate}`,
      };
    }

    if (startDate && !endDate) {
      return {
        startDate,
        endDate: todayStr,
        preset: 'custom',
        label: `From ${startDate}`,
      };
    }

    switch (period) {
      case 'today':
        return {
          startDate: todayStr,
          endDate: todayStr,
          preset: 'today',
          label: 'Today',
        };

      case 'week': {
        // Last 7 days including today
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 6);
        return {
          startDate: toYmd(weekAgo),
          endDate: todayStr,
          preset: 'week',
          label: 'This Week (Last 7 Days)',
        };
      }

      case 'year': {
        const yearStart = `${now.getFullYear()}-01-01`;
        return {
          startDate: yearStart,
          endDate: todayStr,
          preset: 'year',
          label: `This Year (${now.getFullYear()})`,
        };
      }

      case 'month':
      default: {
        const monthStart = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;
        return {
          startDate: monthStart,
          endDate: todayStr,
          preset: 'month',
          label: `This Month (${now.toLocaleString('default', { month: 'long', year: 'numeric' })})`,
        };
      }
    }
  }

  /**
   * 1. Overview KPIs across the entire pharmacy system
   */
  async getOverview() {
    // Read user notification threshold settings
    const settingRes = await db.query(
      'SELECT "expiryThresholdDays", "lowStockThreshold" FROM "PharmacySetting" WHERE id = $1',
      ['default']
    );
    const expiryDays = Math.max(1, parseInt(settingRes.rows[0]?.expiryThresholdDays, 10) || 90);
    const lowStockThreshold = Math.max(1, parseInt(settingRes.rows[0]?.lowStockThreshold, 10) || 10);

    const [salesRes, inventoryRes, purchasesRes, expensesRes] = await Promise.all([
      // Sales & Profit for current month & today
      db.query(`
        SELECT
          COALESCE(SUM(CASE WHEN DATE(s."createdAt") = CURRENT_DATE THEN s.total ELSE 0 END), 0)::numeric as "todaySales",
          COALESCE(SUM(CASE WHEN DATE_TRUNC('month', s."createdAt") = DATE_TRUNC('month', CURRENT_DATE) THEN s.total ELSE 0 END), 0)::numeric as "monthSales",
          COALESCE(COUNT(CASE WHEN DATE_TRUNC('month', s."createdAt") = DATE_TRUNC('month', CURRENT_DATE) THEN s.id END), 0)::int as "monthTransactions",
          COALESCE(SUM(CASE WHEN DATE_TRUNC('month', s."createdAt") = DATE_TRUNC('month', CURRENT_DATE) THEN si.quantity * (si."unitPrice" - si."purchaseCost") ELSE 0 END), 0)::numeric as "monthGrossProfit"
        FROM "Sale" s
        LEFT JOIN "SaleItem" si ON s.id = si."saleId"
      `),

      // Inventory valuation & health
      db.query(`
        SELECT
          COUNT(*)::int as "totalMedicines",
          COALESCE(SUM(quantity), 0)::int as "totalUnitsInStock",
          COALESCE(SUM(quantity * "purchaseCost"), 0)::numeric as "stockCostValue",
          COALESCE(SUM(quantity * "sellingPrice"), 0)::numeric as "stockRetailValue",
          COALESCE(SUM(CASE WHEN quantity <= $1 THEN 1 ELSE 0 END), 0)::int as "lowStockCount",
          COALESCE(SUM(CASE WHEN "expiryDate" IS NOT NULL AND "expiryDate" < CURRENT_DATE THEN 1 ELSE 0 END), 0)::int as "expiredCount",
          COALESCE(SUM(CASE WHEN "expiryDate" IS NOT NULL AND "expiryDate" >= CURRENT_DATE AND "expiryDate" <= CURRENT_DATE + ($2 || ' days')::interval THEN 1 ELSE 0 END), 0)::int as "soonExpiringCount"
        FROM "Medicine"
      `, [lowStockThreshold, expiryDays]),

      // Purchases & outstanding debts
      db.query(`
        SELECT
          COALESCE(SUM("totalCost"), 0)::numeric as "allTimePurchaseCost",
          COALESCE(SUM("amountDue"), 0)::numeric as "totalSupplierDebt",
          COALESCE(COUNT(CASE WHEN "amountDue" > 0 THEN 1 END), 0)::int as "unpaidPurchasesCount"
        FROM "Purchase"
      `),

      // Operating expenses for this month
      db.query(`
        SELECT
          COALESCE(SUM(CASE WHEN "isVoided" = FALSE AND DATE_TRUNC('month', "expenseDate") = DATE_TRUNC('month', CURRENT_DATE) THEN amount ELSE 0 END), 0)::numeric as "monthExpenses",
          COALESCE(SUM(CASE WHEN "isVoided" = FALSE THEN "amountDue" ELSE 0 END), 0)::numeric as "totalUnpaidExpenses"
        FROM "Expense"
      `),
    ]);

    const s = salesRes.rows[0] || {};
    const inv = inventoryRes.rows[0] || {};
    const p = purchasesRes.rows[0] || {};
    const exp = expensesRes.rows[0] || {};

    const monthSales = parseFloat(Number(s.monthSales || 0).toFixed(2));
    const monthGrossProfit = parseFloat(Number(s.monthGrossProfit || 0).toFixed(2));
    const monthExpenses = parseFloat(Number(exp.monthExpenses || 0).toFixed(2));
    const monthEstimatedNetProfit = parseFloat((monthGrossProfit - monthExpenses).toFixed(2));

    return {
      todaySales: parseFloat(Number(s.todaySales || 0).toFixed(2)),
      monthSales,
      monthTransactions: parseInt(s.monthTransactions || 0, 10),
      monthGrossProfit,
      monthExpenses,
      monthEstimatedNetProfit,
      totalMedicines: parseInt(inv.totalMedicines || 0, 10),
      totalUnitsInStock: parseInt(inv.totalUnitsInStock || 0, 10),
      stockCostValue: parseFloat(Number(inv.stockCostValue || 0).toFixed(2)),
      stockRetailValue: parseFloat(Number(inv.stockRetailValue || 0).toFixed(2)),
      lowStockCount: parseInt(inv.lowStockCount || 0, 10),
      expiredCount: parseInt(inv.expiredCount || 0, 10),
      soonExpiringCount: parseInt(inv.soonExpiringCount || 0, 10),
      expiryThresholdDays: expiryDays,
      lowStockThreshold,
      totalSupplierDebt: parseFloat(Number(p.totalSupplierDebt || 0).toFixed(2)),
      unpaidPurchasesCount: parseInt(p.unpaidPurchasesCount || 0, 10),
      totalUnpaidExpenses: parseFloat(Number(exp.totalUnpaidExpenses || 0).toFixed(2)),
    };
  }

  /**
   * 2. Sales Reports
   * - Total sales revenue, transactions count, units sold
   * - Sales history by date
   * - Breakdown by payment method
   * - List of sales transactions in period
   */
  async getSalesReports(params = {}) {
    const range = this.resolveDateRange(params);

    // Summary totals for selected period
    const summarySql = `
      SELECT
        COALESCE(COUNT(DISTINCT s.id), 0)::int as "totalTransactions",
        COALESCE(SUM(s.total), 0)::numeric as "totalRevenue",
        COALESCE(SUM(si.quantity), 0)::int as "totalUnitsSold",
        COALESCE(AVG(s.total), 0)::numeric as "averageTransactionValue"
      FROM "Sale" s
      LEFT JOIN "SaleItem" si ON s.id = si."saleId"
      WHERE DATE(s."createdAt") >= $1::date AND DATE(s."createdAt") <= $2::date
    `;
    const summaryRes = await db.query(summarySql, [range.startDate, range.endDate]);
    const summary = summaryRes.rows[0] || {};

    // Sales history grouped by date
    const historySql = `
      SELECT
        TO_CHAR(s."createdAt", 'YYYY-MM-DD') as date,
        COUNT(DISTINCT s.id)::int as "transactionsCount",
        COALESCE(SUM(si.quantity), 0)::int as "unitsSold",
        COALESCE(SUM(s.total), 0)::numeric as revenue
      FROM "Sale" s
      LEFT JOIN "SaleItem" si ON s.id = si."saleId"
      WHERE DATE(s."createdAt") >= $1::date AND DATE(s."createdAt") <= $2::date
      GROUP BY TO_CHAR(s."createdAt", 'YYYY-MM-DD')
      ORDER BY date DESC
    `;
    const historyRes = await db.query(historySql, [range.startDate, range.endDate]);

    // Top recent sales in the period (up to 50)
    const transactionsSql = `
      SELECT
        s.id,
        ('SALE-' || UPPER(SUBSTRING(s.id::text, 1, 8))) as "saleNumber",
        s.total,
        s."createdAt",
        COALESCE(u.name, 'Staff') as "cashierName",
        COALESCE(p.name, 'Walk-in Customer') as "customerName",
        (SELECT COUNT(*)::int FROM "SaleItem" si WHERE si."saleId" = s.id) as "itemsCount"
      FROM "Sale" s
      LEFT JOIN "User" u ON s."userId" = u.id
      LEFT JOIN "Patient" p ON s."patientId" = p.id
      WHERE DATE(s."createdAt") >= $1::date AND DATE(s."createdAt") <= $2::date
      ORDER BY s."createdAt" DESC
      LIMIT 50
    `;
    const transRes = await db.query(transactionsSql, [range.startDate, range.endDate]);

    return {
      period: range,
      summary: {
        totalRevenue: parseFloat(Number(summary.totalRevenue || 0).toFixed(2)),
        totalTransactions: parseInt(summary.totalTransactions || 0, 10),
        totalUnitsSold: parseInt(summary.totalUnitsSold || 0, 10),
        averageTransactionValue: parseFloat(Number(summary.averageTransactionValue || 0).toFixed(2)),
      },
      salesByDate: historyRes.rows.map((r) => ({
        date: r.date,
        transactionsCount: parseInt(r.transactionsCount || 0, 10),
        unitsSold: parseInt(r.unitsSold || 0, 10),
        revenue: parseFloat(Number(r.revenue || 0).toFixed(2)),
      })),
      transactions: transRes.rows.map((r) => ({
        id: r.id,
        saleNumber: r.saleNumber,
        total: parseFloat(Number(r.total || 0).toFixed(2)),
        cashierName: r.cashierName,
        customerName: r.customerName,
        itemsCount: parseInt(r.itemsCount || 0, 10),
        createdAt: r.createdAt,
      })),
    };
  }

  /**
   * 3. Profit and Financial Reports
   * - Total revenue
   * - Cost of goods sold (COGS)
   * - Gross profit & margin
   * - Operating expenses
   * - Estimated net profit & margin
   * - Financial breakdown by date
   * - Daily, weekly, monthly, and custom comparisons
   */
  async getFinancialReports(params = {}) {
    const range = this.resolveDateRange(params);

    // Sales Revenue and COGS in selected period
    const salesSql = `
      SELECT
        COALESCE(SUM(s.total), 0)::numeric as revenue,
        COALESCE(SUM(si.quantity * si."purchaseCost"), 0)::numeric as "cogs"
      FROM "Sale" s
      LEFT JOIN "SaleItem" si ON s.id = si."saleId"
      WHERE DATE(s."createdAt") >= $1::date AND DATE(s."createdAt") <= $2::date
    `;
    const salesRes = await db.query(salesSql, [range.startDate, range.endDate]);
    const revenue = parseFloat(Number(salesRes.rows[0]?.revenue || 0).toFixed(2));
    const cogs = parseFloat(Number(salesRes.rows[0]?.cogs || 0).toFixed(2));
    const grossProfit = parseFloat((revenue - cogs).toFixed(2));
    const grossMargin = revenue > 0 ? parseFloat(((grossProfit / revenue) * 100).toFixed(1)) : 0;

    // Operating expenses in selected period
    const expSql = `
      SELECT
        COALESCE(SUM(amount), 0)::numeric as "totalExpenses",
        COALESCE(SUM("amountPaid"), 0)::numeric as "expensesPaid",
        COALESCE(SUM("amountDue"), 0)::numeric as "expensesDue"
      FROM "Expense"
      WHERE "isVoided" = FALSE
        AND "expenseDate" >= $1::date AND "expenseDate" <= $2::date
    `;
    const expRes = await db.query(expSql, [range.startDate, range.endDate]);
    const operatingExpenses = parseFloat(Number(expRes.rows[0]?.totalExpenses || 0).toFixed(2));
    const expensesPaid = parseFloat(Number(expRes.rows[0]?.expensesPaid || 0).toFixed(2));
    const expensesDue = parseFloat(Number(expRes.rows[0]?.expensesDue || 0).toFixed(2));

    const estimatedNetProfit = parseFloat((grossProfit - operatingExpenses).toFixed(2));
    const netMargin = revenue > 0 ? parseFloat(((estimatedNetProfit / revenue) * 100).toFixed(1)) : 0;

    // Quick comparisons: Today, This Week (Last 7 Days), This Month, This Year
    const comparisonsSql = `
      SELECT
        -- Today
        COALESCE(SUM(CASE WHEN DATE(s."createdAt") = CURRENT_DATE THEN s.total ELSE 0 END), 0)::numeric as "todayRevenue",
        COALESCE(SUM(CASE WHEN DATE(s."createdAt") = CURRENT_DATE THEN si.quantity * (si."unitPrice" - si."purchaseCost") ELSE 0 END), 0)::numeric as "todayGrossProfit",
        (SELECT COALESCE(SUM(amount), 0)::numeric FROM "Expense" WHERE "isVoided" = FALSE AND "expenseDate" = CURRENT_DATE) as "todayExpenses",

        -- This Week (last 7 days)
        COALESCE(SUM(CASE WHEN DATE(s."createdAt") >= CURRENT_DATE - INTERVAL '6 days' THEN s.total ELSE 0 END), 0)::numeric as "weekRevenue",
        COALESCE(SUM(CASE WHEN DATE(s."createdAt") >= CURRENT_DATE - INTERVAL '6 days' THEN si.quantity * (si."unitPrice" - si."purchaseCost") ELSE 0 END), 0)::numeric as "weekGrossProfit",
        (SELECT COALESCE(SUM(amount), 0)::numeric FROM "Expense" WHERE "isVoided" = FALSE AND "expenseDate" >= CURRENT_DATE - INTERVAL '6 days') as "weekExpenses",

        -- This Month
        COALESCE(SUM(CASE WHEN DATE_TRUNC('month', s."createdAt") = DATE_TRUNC('month', CURRENT_DATE) THEN s.total ELSE 0 END), 0)::numeric as "monthRevenue",
        COALESCE(SUM(CASE WHEN DATE_TRUNC('month', s."createdAt") = DATE_TRUNC('month', CURRENT_DATE) THEN si.quantity * (si."unitPrice" - si."purchaseCost") ELSE 0 END), 0)::numeric as "monthGrossProfit",
        (SELECT COALESCE(SUM(amount), 0)::numeric FROM "Expense" WHERE "isVoided" = FALSE AND DATE_TRUNC('month', "expenseDate") = DATE_TRUNC('month', CURRENT_DATE)) as "monthExpenses"
      FROM "Sale" s
      LEFT JOIN "SaleItem" si ON s.id = si."saleId"
    `;
    const compRes = await db.query(comparisonsSql);
    const cr = compRes.rows[0] || {};

    const todayGross = parseFloat(Number(cr.todayGrossProfit || 0).toFixed(2));
    const todayExp = parseFloat(Number(cr.todayExpenses || 0).toFixed(2));
    const weekGross = parseFloat(Number(cr.weekGrossProfit || 0).toFixed(2));
    const weekExp = parseFloat(Number(cr.weekExpenses || 0).toFixed(2));
    const monthGross = parseFloat(Number(cr.monthGrossProfit || 0).toFixed(2));
    const monthExp = parseFloat(Number(cr.monthExpenses || 0).toFixed(2));

    const comparisons = {
      today: {
        revenue: parseFloat(Number(cr.todayRevenue || 0).toFixed(2)),
        grossProfit: todayGross,
        expenses: todayExp,
        netProfit: parseFloat((todayGross - todayExp).toFixed(2)),
      },
      thisWeek: {
        revenue: parseFloat(Number(cr.weekRevenue || 0).toFixed(2)),
        grossProfit: weekGross,
        expenses: weekExp,
        netProfit: parseFloat((weekGross - weekExp).toFixed(2)),
      },
      thisMonth: {
        revenue: parseFloat(Number(cr.monthRevenue || 0).toFixed(2)),
        grossProfit: monthGross,
        expenses: monthExp,
        netProfit: parseFloat((monthGross - monthExp).toFixed(2)),
      },
      selectedPeriod: {
        revenue,
        grossProfit,
        expenses: operatingExpenses,
        netProfit: estimatedNetProfit,
      },
    };

    // Financial performance daily breakdown for the selected period
    const dailyBreakdownSql = `
      WITH sales_by_day AS (
        SELECT
          TO_CHAR(s."createdAt", 'YYYY-MM-DD') as day,
          COALESCE(SUM(s.total), 0)::numeric as day_revenue,
          COALESCE(SUM(si.quantity * si."purchaseCost"), 0)::numeric as day_cogs,
          COALESCE(SUM(si.quantity * (si."unitPrice" - si."purchaseCost")), 0)::numeric as day_gross
        FROM "Sale" s
        LEFT JOIN "SaleItem" si ON s.id = si."saleId"
        WHERE DATE(s."createdAt") >= $1::date AND DATE(s."createdAt") <= $2::date
        GROUP BY TO_CHAR(s."createdAt", 'YYYY-MM-DD')
      ),
      expenses_by_day AS (
        SELECT
          TO_CHAR("expenseDate", 'YYYY-MM-DD') as day,
          COALESCE(SUM(amount), 0)::numeric as day_expenses
        FROM "Expense"
        WHERE "isVoided" = FALSE
          AND "expenseDate" >= $1::date AND "expenseDate" <= $2::date
        GROUP BY TO_CHAR("expenseDate", 'YYYY-MM-DD')
      ),
      all_days AS (
        SELECT day FROM sales_by_day
        UNION
        SELECT day FROM expenses_by_day
      )
      SELECT
        d.day as date,
        COALESCE(s.day_revenue, 0)::numeric as revenue,
        COALESCE(s.day_cogs, 0)::numeric as cogs,
        COALESCE(s.day_gross, 0)::numeric as "grossProfit",
        COALESCE(e.day_expenses, 0)::numeric as expenses,
        (COALESCE(s.day_gross, 0) - COALESCE(e.day_expenses, 0))::numeric as "netProfit"
      FROM all_days d
      LEFT JOIN sales_by_day s ON d.day = s.day
      LEFT JOIN expenses_by_day e ON d.day = e.day
      ORDER BY d.day DESC
    `;
    const dailyRes = await db.query(dailyBreakdownSql, [range.startDate, range.endDate]);

    return {
      period: range,
      summary: {
        totalRevenue: revenue,
        cogs,
        grossProfit,
        grossMargin,
        operatingExpenses,
        expensesPaid,
        expensesDue,
        estimatedNetProfit,
        netMargin,
      },
      comparisons,
      dailyBreakdown: dailyRes.rows.map((r) => ({
        date: r.date,
        revenue: parseFloat(Number(r.revenue || 0).toFixed(2)),
        cogs: parseFloat(Number(r.cogs || 0).toFixed(2)),
        grossProfit: parseFloat(Number(r.grossProfit || 0).toFixed(2)),
        expenses: parseFloat(Number(r.expenses || 0).toFixed(2)),
        netProfit: parseFloat(Number(r.netProfit || 0).toFixed(2)),
      })),
    };
  }

  /**
   * 4. Inventory Reports
   * - Stock quantities and valuation
   * - Low-stock medicines
   * - Expired and soon-to-expire medicines
   * - Stock adjustments and damaged medicines
   */
  async getInventoryReports(params = {}) {
    const range = this.resolveDateRange(params);

    // Read user notification threshold settings
    const settingRes = await db.query(
      'SELECT "expiryThresholdDays", "lowStockThreshold" FROM "PharmacySetting" WHERE id = $1',
      ['default']
    );
    const expiryDays = Math.max(1, parseInt(settingRes.rows[0]?.expiryThresholdDays, 10) || 90);
    const lowStockThreshold = Math.max(1, parseInt(settingRes.rows[0]?.lowStockThreshold, 10) || 10);

    // Current stock snapshot
    const snapshotSql = `
      SELECT
        COUNT(*)::int as "totalMedicines",
        COALESCE(SUM(quantity), 0)::int as "totalUnitsInStock",
        COALESCE(SUM(quantity * "purchaseCost"), 0)::numeric as "totalCostValue",
        COALESCE(SUM(quantity * "sellingPrice"), 0)::numeric as "totalRetailValue",
        COALESCE(SUM(CASE WHEN quantity = 0 THEN 1 ELSE 0 END), 0)::int as "outOfStockCount",
        COALESCE(SUM(CASE WHEN quantity > 0 AND quantity <= $1 THEN 1 ELSE 0 END), 0)::int as "lowStockCount",
        COALESCE(SUM(CASE WHEN "expiryDate" IS NOT NULL AND "expiryDate" < CURRENT_DATE THEN 1 ELSE 0 END), 0)::int as "expiredCount",
        COALESCE(SUM(CASE WHEN "expiryDate" IS NOT NULL AND "expiryDate" >= CURRENT_DATE AND "expiryDate" <= CURRENT_DATE + ($2 || ' days')::interval THEN 1 ELSE 0 END), 0)::int as "soonExpiringCount"
      FROM "Medicine"
    `;
    const snapshotRes = await db.query(snapshotSql, [lowStockThreshold, expiryDays]);
    const snap = snapshotRes.rows[0] || {};
    const totalCostValue = parseFloat(Number(snap.totalCostValue || 0).toFixed(2));
    const totalRetailValue = parseFloat(Number(snap.totalRetailValue || 0).toFixed(2));
    const potentialProfit = parseFloat((totalRetailValue - totalCostValue).toFixed(2));

    // Low stock medicines (quantity <= lowStockThreshold)
    const lowStockSql = `
      SELECT
        id,
        name,
        quantity,
        COALESCE("purchaseCost", 0)::numeric as "purchaseCost",
        COALESCE("sellingPrice", price, 0)::numeric as "sellingPrice",
        "expiryDate",
        CASE WHEN quantity = 0 THEN 'OUT_OF_STOCK' ELSE 'LOW_STOCK' END as status
      FROM "Medicine"
      WHERE quantity <= $1
      ORDER BY quantity ASC, name ASC
    `;
    const lowStockRes = await db.query(lowStockSql, [lowStockThreshold]);

    // Expired medicines
    const expiredSql = `
      SELECT
        id,
        name,
        quantity,
        COALESCE("purchaseCost", 0)::numeric as "purchaseCost",
        (quantity * COALESCE("purchaseCost", 0))::numeric as "lossValue",
        "expiryDate"
      FROM "Medicine"
      WHERE "expiryDate" IS NOT NULL AND "expiryDate" < CURRENT_DATE
      ORDER BY "expiryDate" ASC
    `;
    const expiredRes = await db.query(expiredSql);

    // Soon-to-expire medicines based on user-configured expiryThresholdDays
    const soonExpiringSql = `
      SELECT
        id,
        name,
        quantity,
        COALESCE("purchaseCost", 0)::numeric as "purchaseCost",
        COALESCE("sellingPrice", price, 0)::numeric as "sellingPrice",
        (quantity * COALESCE("purchaseCost", 0))::numeric as "costAtRisk",
        "expiryDate",
        (DATE("expiryDate") - CURRENT_DATE) as "daysUntilExpiry"
      FROM "Medicine"
      WHERE "expiryDate" IS NOT NULL
        AND "expiryDate" >= CURRENT_DATE
        AND "expiryDate" <= CURRENT_DATE + ($1 || ' days')::interval
      ORDER BY "expiryDate" ASC
    `;
    const soonExpiringRes = await db.query(soonExpiringSql, [expiryDays]);

    // Stock adjustments and damaged medicines in date range
    const adjustmentsSql = `
      SELECT
        it.id,
        it.type,
        it."medicineId",
        m.name as "medicineName",
        it.quantity,
        it."previousQuantity",
        it."newQuantity",
        it."purchaseCost",
        it.reason,
        it."userName",
        it."createdAt"
      FROM "InventoryTransaction" it
      JOIN "Medicine" m ON it."medicineId" = m.id
      WHERE DATE(it."createdAt") >= $1::date AND DATE(it."createdAt") <= $2::date
        AND it.type IN ('ADJUSTMENT', 'DAMAGE', 'EXPIRY', 'CORRECTION')
      ORDER BY it."createdAt" DESC
      LIMIT 100
    `;
    const adjRes = await db.query(adjustmentsSql, [range.startDate, range.endDate]);

    return {
      period: range,
      summary: {
        totalMedicines: parseInt(snap.totalMedicines || 0, 10),
        totalUnitsInStock: parseInt(snap.totalUnitsInStock || 0, 10),
        totalCostValue,
        totalRetailValue,
        potentialProfit,
        outOfStockCount: parseInt(snap.outOfStockCount || 0, 10),
        lowStockCount: parseInt(snap.lowStockCount || 0, 10),
        expiredCount: parseInt(snap.expiredCount || 0, 10),
        soonExpiringCount: parseInt(snap.soonExpiringCount || 0, 10),
        expiryThresholdDays: expiryDays,
        lowStockThreshold,
      },
      lowStockList: lowStockRes.rows.map((r) => ({
        id: r.id,
        name: r.name,
        quantity: parseInt(r.quantity, 10) || 0,
        purchaseCost: parseFloat(r.purchaseCost || 0),
        sellingPrice: parseFloat(r.sellingPrice || 0),
        expiryDate: r.expiryDate ? String(r.expiryDate).split('T')[0] : null,
        status: r.status,
      })),
      expiredList: expiredRes.rows.map((r) => ({
        id: r.id,
        name: r.name,
        quantity: parseInt(r.quantity, 10) || 0,
        purchaseCost: parseFloat(r.purchaseCost || 0),
        lossValue: parseFloat(Number(r.lossValue || 0).toFixed(2)),
        expiryDate: r.expiryDate ? String(r.expiryDate).split('T')[0] : null,
      })),
      soonExpiringList: soonExpiringRes.rows.map((r) => ({
        id: r.id,
        name: r.name,
        quantity: parseInt(r.quantity, 10) || 0,
        purchaseCost: parseFloat(r.purchaseCost || 0),
        sellingPrice: parseFloat(r.sellingPrice || 0),
        costAtRisk: parseFloat(Number(r.costAtRisk || 0).toFixed(2)),
        expiryDate: r.expiryDate ? String(r.expiryDate).split('T')[0] : null,
        daysUntilExpiry: parseInt(r.daysUntilExpiry, 10) || 0,
      })),
      adjustments: adjRes.rows.map((r) => ({
        id: r.id,
        type: r.type,
        medicineName: r.medicineName,
        quantity: parseInt(r.quantity, 10) || 0,
        previousQuantity: parseInt(r.previousQuantity, 10) || 0,
        newQuantity: parseInt(r.newQuantity, 10) || 0,
        purchaseCost: parseFloat(r.purchaseCost || 0),
        reason: r.reason || 'Manual inventory adjustment',
        userName: r.userName || 'System',
        createdAt: r.createdAt,
      })),
    };
  }

  /**
   * 5. Purchase Reports
   * - Total purchase cost by date
   * - Medicines purchased and quantities received
   * - Purchases by supplier
   * - Fully paid and unpaid purchases
   * - Outstanding supplier balances
   */
  async getPurchaseReports(params = {}) {
    const range = this.resolveDateRange(params);

    // Period summary
    const summarySql = `
      SELECT
        COUNT(*)::int as "totalOrders",
        COALESCE(SUM("totalCost"), 0)::numeric as "totalPurchaseCost",
        COALESCE(SUM("amountPaid"), 0)::numeric as "totalAmountPaid",
        COALESCE(SUM("amountDue"), 0)::numeric as "totalAmountDue",
        COALESCE(SUM(CASE WHEN "paymentStatus" = 'PAID' THEN 1 ELSE 0 END), 0)::int as "fullyPaidCount",
        COALESCE(SUM(CASE WHEN "paymentStatus" = 'PARTIALLY_PAID' THEN 1 ELSE 0 END), 0)::int as "partiallyPaidCount",
        COALESCE(SUM(CASE WHEN "paymentStatus" = 'UNPAID' THEN 1 ELSE 0 END), 0)::int as "unpaidCount"
      FROM "Purchase"
      WHERE DATE("orderDate") >= $1::date AND DATE("orderDate") <= $2::date
    `;
    const summaryRes = await db.query(summarySql, [range.startDate, range.endDate]);
    const summary = summaryRes.rows[0] || {};

    // Purchases by supplier
    const supplierSpendSql = `
      SELECT
        s.id as "supplierId",
        s.name as "supplierName",
        s.phone as "supplierPhone",
        COUNT(p.id)::int as "ordersCount",
        COALESCE(SUM(p."totalCost"), 0)::numeric as "totalCost",
        COALESCE(SUM(p."amountPaid"), 0)::numeric as "amountPaid",
        COALESCE(SUM(p."amountDue"), 0)::numeric as "outstandingBalance"
      FROM "Supplier" s
      JOIN "Purchase" p ON s.id = p."supplierId"
      WHERE DATE(p."orderDate") >= $1::date AND DATE(p."orderDate") <= $2::date
      GROUP BY s.id, s.name, s.phone
      ORDER BY "totalCost" DESC
    `;
    const supplierRes = await db.query(supplierSpendSql, [range.startDate, range.endDate]);

    // Medicines purchased and received in this period
    const medicinesSql = `
      SELECT
        pi."medicineName",
        COUNT(DISTINCT pi."purchaseId")::int as "ordersCount",
        COALESCE(SUM(pi.quantity), 0)::int as "orderedQuantity",
        COALESCE(SUM(COALESCE(pi."quantityReceived", pi.quantity)), 0)::int as "receivedQuantity",
        COALESCE(SUM(pi."totalCost"), 0)::numeric as "totalCost",
        COALESCE(AVG(pi."unitCost"), 0)::numeric as "avgUnitCost"
      FROM "PurchaseItem" pi
      JOIN "Purchase" p ON pi."purchaseId" = p.id
      WHERE DATE(p."orderDate") >= $1::date AND DATE(p."orderDate") <= $2::date
      GROUP BY pi."medicineName"
      ORDER BY "totalCost" DESC
      LIMIT 100
    `;
    const medRes = await db.query(medicinesSql, [range.startDate, range.endDate]);

    // Purchases list in date range
    const ordersSql = `
      SELECT
        p.id,
        p."purchaseOrderNo",
        p."orderDate",
        p."totalCost",
        p."amountPaid",
        p."amountDue",
        p."status" as "deliveryStatus",
        p."paymentStatus",
        s.name as "supplierName"
      FROM "Purchase" p
      JOIN "Supplier" s ON p."supplierId" = s.id
      WHERE DATE(p."orderDate") >= $1::date AND DATE(p."orderDate") <= $2::date
      ORDER BY p."orderDate" DESC
      LIMIT 50
    `;
    const ordersRes = await db.query(ordersSql, [range.startDate, range.endDate]);

    return {
      period: range,
      summary: {
        totalOrders: parseInt(summary.totalOrders || 0, 10),
        totalPurchaseCost: parseFloat(Number(summary.totalPurchaseCost || 0).toFixed(2)),
        totalAmountPaid: parseFloat(Number(summary.totalAmountPaid || 0).toFixed(2)),
        totalAmountDue: parseFloat(Number(summary.totalAmountDue || 0).toFixed(2)),
        fullyPaidCount: parseInt(summary.fullyPaidCount || 0, 10),
        partiallyPaidCount: parseInt(summary.partiallyPaidCount || 0, 10),
        unpaidCount: parseInt(summary.unpaidCount || 0, 10),
      },
      suppliers: supplierRes.rows.map((r) => ({
        supplierId: r.supplierId,
        supplierName: r.supplierName,
        supplierPhone: r.supplierPhone,
        ordersCount: parseInt(r.ordersCount, 10) || 0,
        totalCost: parseFloat(Number(r.totalCost || 0).toFixed(2)),
        amountPaid: parseFloat(Number(r.amountPaid || 0).toFixed(2)),
        outstandingBalance: parseFloat(Number(r.outstandingBalance || 0).toFixed(2)),
      })),
      medicinesPurchased: medRes.rows.map((r) => ({
        medicineName: r.medicineName,
        ordersCount: parseInt(r.ordersCount, 10) || 0,
        orderedQuantity: parseInt(r.orderedQuantity, 10) || 0,
        receivedQuantity: parseInt(r.receivedQuantity, 10) || 0,
        totalCost: parseFloat(Number(r.totalCost || 0).toFixed(2)),
        avgUnitCost: parseFloat(Number(r.avgUnitCost || 0).toFixed(2)),
      })),
      orders: ordersRes.rows.map((r) => ({
        id: r.id,
        purchaseOrderNo: r.purchaseOrderNo,
        orderDate: r.orderDate ? String(r.orderDate).split('T')[0] : null,
        totalCost: parseFloat(Number(r.totalCost || 0).toFixed(2)),
        amountPaid: parseFloat(Number(r.amountPaid || 0).toFixed(2)),
        amountDue: parseFloat(Number(r.amountDue || 0).toFixed(2)),
        deliveryStatus: r.deliveryStatus,
        paymentStatus: r.paymentStatus,
        supplierName: r.supplierName,
      })),
    };
  }

  /**
   * 6. Expense Reports
   * - Total expenses by date and category
   * - Paid, unpaid, and partially paid expenses
   */
  async getExpenseReports(params = {}) {
    const range = this.resolveDateRange(params);

    // Summary
    const summarySql = `
      SELECT
        COUNT(*)::int as "totalRecords",
        COALESCE(SUM(amount), 0)::numeric as "totalAmount",
        COALESCE(SUM("amountPaid"), 0)::numeric as "totalPaid",
        COALESCE(SUM("amountDue"), 0)::numeric as "totalDue",
        COALESCE(SUM(CASE WHEN "paymentStatus" = 'PAID' THEN 1 ELSE 0 END), 0)::int as "paidCount",
        COALESCE(SUM(CASE WHEN "paymentStatus" = 'PARTIALLY_PAID' THEN 1 ELSE 0 END), 0)::int as "partiallyPaidCount",
        COALESCE(SUM(CASE WHEN "paymentStatus" = 'UNPAID' THEN 1 ELSE 0 END), 0)::int as "unpaidCount"
      FROM "Expense"
      WHERE "isVoided" = FALSE
        AND "expenseDate" >= $1::date AND "expenseDate" <= $2::date
    `;
    const summaryRes = await db.query(summarySql, [range.startDate, range.endDate]);
    const summary = summaryRes.rows[0] || {};
    const totalAmount = parseFloat(Number(summary.totalAmount || 0).toFixed(2));
    const totalPaid = parseFloat(Number(summary.totalPaid || 0).toFixed(2));
    const totalDue = parseFloat(Number(summary.totalDue || 0).toFixed(2));

    // Category breakdown
    const catSql = `
      SELECT
        category,
        COUNT(*)::int as count,
        COALESCE(SUM(amount), 0)::numeric as total,
        COALESCE(SUM("amountPaid"), 0)::numeric as "paidTotal",
        COALESCE(SUM("amountDue"), 0)::numeric as "dueTotal"
      FROM "Expense"
      WHERE "isVoided" = FALSE
        AND "expenseDate" >= $1::date AND "expenseDate" <= $2::date
      GROUP BY category
      ORDER BY total DESC
    `;
    const catRes = await db.query(catSql, [range.startDate, range.endDate]);

    // Detailed expenses in date range
    const listSql = `
      SELECT
        id,
        "expenseNumber",
        title,
        category,
        amount,
        "amountPaid",
        "amountDue",
        "paymentStatus",
        payee,
        "expenseDate",
        "createdAt"
      FROM "Expense"
      WHERE "isVoided" = FALSE
        AND "expenseDate" >= $1::date AND "expenseDate" <= $2::date
      ORDER BY "expenseDate" DESC, "createdAt" DESC
      LIMIT 100
    `;
    const listRes = await db.query(listSql, [range.startDate, range.endDate]);

    return {
      period: range,
      summary: {
        totalRecords: parseInt(summary.totalRecords || 0, 10),
        totalAmount,
        totalPaid,
        totalDue,
        paidCount: parseInt(summary.paidCount || 0, 10),
        partiallyPaidCount: parseInt(summary.partiallyPaidCount || 0, 10),
        unpaidCount: parseInt(summary.unpaidCount || 0, 10),
      },
      byCategory: catRes.rows.map((r) => {
        const catTotal = parseFloat(Number(r.total || 0).toFixed(2));
        const pct = totalAmount > 0 ? Math.round((catTotal / totalAmount) * 100) : 0;
        return {
          category: r.category,
          count: parseInt(r.count, 10) || 0,
          total: catTotal,
          paidTotal: parseFloat(Number(r.paidTotal || 0).toFixed(2)),
          dueTotal: parseFloat(Number(r.dueTotal || 0).toFixed(2)),
          percentage: pct,
        };
      }),
      expenses: listRes.rows.map((r) => ({
        id: r.id,
        expenseNumber: r.expenseNumber,
        title: r.title,
        category: r.category,
        amount: parseFloat(Number(r.amount || 0).toFixed(2)),
        amountPaid: parseFloat(Number(r.amountPaid || 0).toFixed(2)),
        amountDue: parseFloat(Number(r.amountDue || 0).toFixed(2)),
        paymentStatus: r.paymentStatus,
        payee: r.payee,
        expenseDate: r.expenseDate ? String(r.expenseDate).split('T')[0] : null,
      })),
    };
  }

  /**
   * 7. Medicine Sales Performance Reports
   * - Best-selling medicines (quantity and revenue)
   * - Slow-moving medicines (low units or zero sales)
   * - Complete performance table per medicine
   */
  async getMedicinePerformanceReports(params = {}) {
    const range = this.resolveDateRange(params);

    // All medicines performance in the period
    const perfSql = `
      SELECT
        m.id as "medicineId",
        m.name as "medicineName",
        m.quantity as "currentStock",
        COALESCE(m."purchaseCost", 0)::numeric as "purchasePrice",
        COALESCE(m."sellingPrice", m.price, 0)::numeric as "sellingPrice",
        COALESCE(SUM(si.quantity), 0)::int as "quantitySold",
        COALESCE(SUM(si.quantity * si."unitPrice"), 0)::numeric as "totalRevenue",
        COALESCE(SUM(si.quantity * si."purchaseCost"), 0)::numeric as "totalCost",
        COALESCE(SUM(si.quantity * (si."unitPrice" - si."purchaseCost")), 0)::numeric as "totalProfit"
      FROM "Medicine" m
      LEFT JOIN "SaleItem" si ON m.id = si."medicineId"
      LEFT JOIN "Sale" s ON si."saleId" = s.id AND DATE(s."createdAt") >= $1::date AND DATE(s."createdAt") <= $2::date
      GROUP BY m.id, m.name, m.quantity, m."purchaseCost", m."sellingPrice", m.price
      ORDER BY "quantitySold" DESC, "totalRevenue" DESC
    `;
    const perfRes = await db.query(perfSql, [range.startDate, range.endDate]);

    const allItems = perfRes.rows.map((r) => {
      const revenue = parseFloat(Number(r.totalRevenue || 0).toFixed(2));
      const cost = parseFloat(Number(r.totalCost || 0).toFixed(2));
      const profit = parseFloat(Number(r.totalProfit || 0).toFixed(2));
      const margin = revenue > 0 ? parseFloat(((profit / revenue) * 100).toFixed(1)) : 0;

      return {
        medicineId: r.medicineId,
        medicineName: r.medicineName,
        currentStock: parseInt(r.currentStock, 10) || 0,
        purchasePrice: parseFloat(r.purchasePrice || 0),
        sellingPrice: parseFloat(r.sellingPrice || 0),
        quantitySold: parseInt(r.quantitySold, 10) || 0,
        totalRevenue: revenue,
        totalCost: cost,
        totalProfit: profit,
        profitMargin: margin,
      };
    });

    // Best-sellers (medicines that actually sold, sorted descending)
    const bestSelling = allItems
      .filter((m) => m.quantitySold > 0)
      .slice(0, 15);

    // Slow-moving medicines (zero or very low sales, but stock is in hand)
    const slowMoving = allItems
      .filter((m) => m.currentStock > 0 && m.quantitySold <= 3)
      .sort((a, b) => a.quantitySold - b.quantitySold || b.currentStock - a.currentStock)
      .slice(0, 15);

    // Aggregate totals for the performance summary
    const totalSoldUnits = allItems.reduce((acc, i) => acc + i.quantitySold, 0);
    const totalRevenueGenerated = parseFloat(allItems.reduce((acc, i) => acc + i.totalRevenue, 0).toFixed(2));
    const totalProfitGenerated = parseFloat(allItems.reduce((acc, i) => acc + i.totalProfit, 0).toFixed(2));
    const activeSellingMedicinesCount = allItems.filter((i) => i.quantitySold > 0).length;

    return {
      period: range,
      summary: {
        totalSoldUnits,
        totalRevenueGenerated,
        totalProfitGenerated,
        activeSellingMedicinesCount,
        totalCatalogMedicines: allItems.length,
      },
      bestSelling,
      slowMoving,
      allMedicines: allItems,
    };
  }
}

export const reportsService = new ReportsService();
