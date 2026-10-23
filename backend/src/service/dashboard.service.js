import { db } from '../database/client.js';

export class DashboardService {
  /**
   * Helper to resolve start & end dates based on period or custom inputs
   */
  resolveDateRange({ period = '7d', startDate = '', endDate = '' } = {}) {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const toYmd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    const todayStr = toYmd(now);

    if (startDate && endDate) {
      const s = new Date(startDate);
      const e = new Date(endDate);
      const diffDays = Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1);

      // Previous period of equal duration
      const prevEnd = new Date(s);
      prevEnd.setDate(prevEnd.getDate() - 1);
      const prevStart = new Date(prevEnd);
      prevStart.setDate(prevStart.getDate() - (diffDays - 1));

      return {
        startDate,
        endDate,
        daysCount: diffDays,
        prevStartDate: toYmd(prevStart),
        prevEndDate: toYmd(prevEnd),
        preset: 'custom',
        label: `${startDate} to ${endDate}`,
      };
    }

    if (period === 'today') {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = toYmd(yesterday);
      return {
        startDate: todayStr,
        endDate: todayStr,
        daysCount: 1,
        prevStartDate: yStr,
        prevEndDate: yStr,
        preset: 'today',
        label: 'Today',
      };
    }

    if (period === '30d' || period === 'month') {
      const start = new Date(now);
      start.setDate(now.getDate() - 29);
      const prevEnd = new Date(start);
      prevEnd.setDate(prevEnd.getDate() - 1);
      const prevStart = new Date(prevEnd);
      prevStart.setDate(prevStart.getDate() - 29);

      return {
        startDate: toYmd(start),
        endDate: todayStr,
        daysCount: 30,
        prevStartDate: toYmd(prevStart),
        prevEndDate: toYmd(prevEnd),
        preset: '30d',
        label: 'Last 30 Days',
      };
    }

    // Default: 7 days
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    const prevEnd = new Date(start);
    prevEnd.setDate(prevEnd.getDate() - 1);
    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevStart.getDate() - 6);

    return {
      startDate: toYmd(start),
      endDate: todayStr,
      daysCount: 7,
      prevStartDate: toYmd(prevStart),
      prevEndDate: toYmd(prevEnd),
      preset: '7d',
      label: 'Last 7 Days',
    };
  }

  /**
   * Main Dashboard Data Aggregator
   */
  async getDashboardData(params = {}) {
    const range = this.resolveDateRange(params);

    // 1. Fetch Pharmacy Setting for alert thresholds
    const settingRes = await db.query(
      'SELECT "lowStockThreshold", "expiryThresholdDays", "currencySymbol", "currency" FROM "PharmacySetting" WHERE id = $1',
      ['default']
    );
    const settings = settingRes.rows[0] || {};
    const defaultLowStock = Math.max(1, parseInt(settings.lowStockThreshold, 10) || 10);
    const defaultExpiryDays = Math.max(1, parseInt(settings.expiryThresholdDays, 10) || 90);

    // 2. Parallel queries for high-performance dashboard loading
    const [
      overviewRes,
      analyticsCurrentRes,
      analyticsPrevRes,
      dailyTrendRes,
      alertsRes,
      recentSalesRes,
      recentPurchasesRes,
      insightsRes,
    ] = await Promise.all([
      // A. Business Performance Overview (Today & Inventory & Supplier Balances)
      db.query(`
        SELECT
          -- Today's sales
          (SELECT COALESCE(SUM(total), 0)::numeric FROM "Sale" WHERE DATE("createdAt") = CURRENT_DATE) as "todaySales",
          (SELECT COALESCE(SUM(total), 0)::numeric FROM "Sale" WHERE DATE("createdAt") = CURRENT_DATE - 1) as "yesterdaySales",
          
          -- Today's gross profit
          (SELECT COALESCE(SUM(si.quantity * (si."unitPrice" - si."purchaseCost")), 0)::numeric
           FROM "SaleItem" si
           JOIN "Sale" s ON s.id = si."saleId"
           WHERE DATE(s."createdAt") = CURRENT_DATE) as "todayGrossProfit",
          (SELECT COALESCE(SUM(si.quantity * (si."unitPrice" - si."purchaseCost")), 0)::numeric
           FROM "SaleItem" si
           JOIN "Sale" s ON s.id = si."saleId"
           WHERE DATE(s."createdAt") = CURRENT_DATE - 1) as "yesterdayGrossProfit",

          -- Today's operating expenses
          (SELECT COALESCE(SUM(amount), 0)::numeric 
           FROM "Expense" 
           WHERE "isVoided" = FALSE AND "expenseDate" = CURRENT_DATE) as "todayExpenses",
          (SELECT COALESCE(SUM(amount), 0)::numeric 
           FROM "Expense" 
           WHERE "isVoided" = FALSE AND "expenseDate" = CURRENT_DATE - 1) as "yesterdayExpenses",

          -- Today's sales transactions count
          (SELECT COALESCE(COUNT(id), 0)::int FROM "Sale" WHERE DATE("createdAt") = CURRENT_DATE) as "todayTransactions",
          (SELECT COALESCE(COUNT(id), 0)::int FROM "Sale" WHERE DATE("createdAt") = CURRENT_DATE - 1) as "yesterdayTransactions",

          -- Current inventory valuation & units
          (SELECT COALESCE(SUM(quantity * "purchaseCost"), 0)::numeric FROM "Medicine") as "inventoryCostValue",
          (SELECT COALESCE(SUM(quantity * "sellingPrice"), 0)::numeric FROM "Medicine") as "inventoryRetailValue",
          (SELECT COALESCE(SUM(quantity), 0)::int FROM "Medicine") as "totalStockUnits",
          (SELECT COUNT(*)::int FROM "Medicine") as "totalMedicinesCount",

          -- Outstanding supplier balance
          (SELECT COALESCE(SUM("amountDue"), 0)::numeric FROM "Purchase" WHERE "amountDue" > 0) as "outstandingSupplierBalance",
          (SELECT COUNT(*)::int FROM "Purchase" WHERE "amountDue" > 0) as "unpaidSupplierInvoicesCount"
      `),

      // B. Analytics for Current Range (Total Revenue, Profit, Transactions)
      db.query(`
        SELECT
          COALESCE(SUM(s.total), 0)::numeric as "periodRevenue",
          COALESCE(COUNT(DISTINCT s.id), 0)::int as "periodTransactions",
          COALESCE(SUM(si.quantity * (si."unitPrice" - si."purchaseCost")), 0)::numeric as "periodGrossProfit",
          COALESCE(SUM(si.quantity), 0)::int as "periodUnitsSold"
        FROM "Sale" s
        LEFT JOIN "SaleItem" si ON s.id = si."saleId"
        WHERE DATE(s."createdAt") >= $1::date AND DATE(s."createdAt") <= $2::date
      `, [range.startDate, range.endDate]),

      // C. Analytics for Previous Period (for Growth % comparison)
      db.query(`
        SELECT
          COALESCE(SUM(s.total), 0)::numeric as "prevRevenue",
          COALESCE(COUNT(DISTINCT s.id), 0)::int as "prevTransactions",
          COALESCE(SUM(si.quantity * (si."unitPrice" - si."purchaseCost")), 0)::numeric as "prevGrossProfit"
        FROM "Sale" s
        LEFT JOIN "SaleItem" si ON s.id = si."saleId"
        WHERE DATE(s."createdAt") >= $1::date AND DATE(s."createdAt") <= $2::date
      `, [range.prevStartDate, range.prevEndDate]),

      // D. Daily Trend Series for Charts (Day-by-Day Revenue, Profit, Transactions)
      db.query(`
        WITH calendar AS (
          SELECT generate_series($1::date, $2::date, '1 day'::interval)::date as day
        ),
        daily_sales AS (
          SELECT
            DATE(s."createdAt") as day,
            SUM(s.total)::numeric as revenue,
            COUNT(DISTINCT s.id)::int as transactions,
            SUM(si.quantity * (si."unitPrice" - si."purchaseCost"))::numeric as gross_profit,
            SUM(si.quantity)::int as units_sold
          FROM "Sale" s
          LEFT JOIN "SaleItem" si ON s.id = si."saleId"
          WHERE DATE(s."createdAt") >= $1::date AND DATE(s."createdAt") <= $2::date
          GROUP BY DATE(s."createdAt")
        )
        SELECT
          c.day::text as "date",
          TO_CHAR(c.day, 'Mon DD') as "shortLabel",
          TO_CHAR(c.day, 'Dy') as "weekday",
          COALESCE(ds.revenue, 0)::numeric as "revenue",
          COALESCE(ds.gross_profit, 0)::numeric as "grossProfit",
          COALESCE(ds.transactions, 0)::int as "transactions",
          COALESCE(ds.units_sold, 0)::int as "unitsSold"
        FROM calendar c
        LEFT JOIN daily_sales ds ON c.day = ds.day
        ORDER BY c.day ASC
      `, [range.startDate, range.endDate]),

      // E. Stock & Expiry Alerts
      (async () => {
        const [lowMeds, outMeds, expiryCounts, expiredBatches, discrepancies] = await Promise.all([
          // Low stock medicines (quantity > 0 AND quantity <= reorderLevel)
          db.query(`
            SELECT 
              m.id,
              m.name,
              m."genericName",
              m.quantity,
              m."reorderLevel",
              m."sellingPrice",
              c.name as "categoryName"
            FROM "Medicine" m
            LEFT JOIN "Category" c ON m."categoryId" = c.id
            WHERE m.quantity > 0 AND m.quantity <= GREATEST(1, m."reorderLevel")
            ORDER BY m.quantity ASC, m.name ASC
            LIMIT 15
          `),

          // Out of stock medicines (quantity <= 0)
          db.query(`
            SELECT 
              m.id,
              m.name,
              m."genericName",
              m.quantity,
              m."reorderLevel",
              m."sellingPrice",
              c.name as "categoryName"
            FROM "Medicine" m
            LEFT JOIN "Category" c ON m."categoryId" = c.id
            WHERE m.quantity <= 0
            ORDER BY m.name ASC
            LIMIT 15
          `),

          // Expiring within 30, 60, 90 days counts & expired batches
          db.query(`
            SELECT
              -- Expired batches / medicines
              (SELECT COUNT(*)::int FROM "Batch" WHERE "expiryDate" < CURRENT_DATE) as "expiredBatchesCount",
              (SELECT COUNT(*)::int FROM "Medicine" WHERE "expiryDate" IS NOT NULL AND "expiryDate" < CURRENT_DATE) as "expiredMedicinesCount",

              -- Within 30 days
              (SELECT COUNT(*)::int FROM "Batch" 
               WHERE "expiryDate" >= CURRENT_DATE AND "expiryDate" <= CURRENT_DATE + interval '30 days') as "expiring30DaysCount",

              -- Between 31 and 60 days
              (SELECT COUNT(*)::int FROM "Batch" 
               WHERE "expiryDate" > CURRENT_DATE + interval '30 days' AND "expiryDate" <= CURRENT_DATE + interval '60 days') as "expiring60DaysCount",

              -- Between 61 and 90 days
              (SELECT COUNT(*)::int FROM "Batch" 
               WHERE "expiryDate" > CURRENT_DATE + interval '60 days' AND "expiryDate" <= CURRENT_DATE + interval '90 days') as "expiring90DaysCount"
          `),

          // Recent expired or near-expiry batches list
          db.query(`
            SELECT 
              b.id,
              b."batchNo",
              b.quantity,
              b."expiryDate",
              b.status,
              m.name as "medicineName",
              c.name as "categoryName",
              ROUND(EXTRACT(EPOCH FROM (b."expiryDate" - CURRENT_TIMESTAMP)) / 86400)::int as "daysToExpiry"
            FROM "Batch" b
            JOIN "Medicine" m ON b."medicineId" = m.id
            LEFT JOIN "Category" c ON m."categoryId" = c.id
            WHERE b."expiryDate" <= CURRENT_DATE + interval '90 days'
            ORDER BY b."expiryDate" ASC
            LIMIT 15
          `),

          // Medicines with stock discrepancies / recent stock adjustments
          db.query(`
            SELECT 
              sa.id,
              sa."previousQuantity",
              sa."countedQuantity",
              sa.difference,
              sa.reason,
              sa."userName",
              sa."createdAt",
              m.name as "medicineName"
            FROM "StockAdjustment" sa
            JOIN "Medicine" m ON sa."medicineId" = m.id
            WHERE sa.difference != 0
            ORDER BY sa."createdAt" DESC
            LIMIT 10
          `),
        ]);

        return {
          lowStockList: lowMeds.rows,
          lowStockCount: lowMeds.rowCount,
          outOfStockList: outMeds.rows,
          outOfStockCount: outMeds.rowCount,
          expirySummary: expiryCounts.rows[0] || {},
          expiringBatchesList: expiredBatches.rows,
          stockDiscrepancies: discrepancies.rows,
        };
      })(),

      // F. Recent Sales (compact receipt records)
      db.query(`
        SELECT 
          s.id,
          s.total,
          s."createdAt",
          u.name as "cashierName",
          p.name as "patientName",
          COUNT(si.id)::int as "itemsCount",
          COALESCE(SUM(si.quantity), 0)::int as "totalUnits",
          COALESCE(SUM(si.quantity * (si."unitPrice" - si."purchaseCost")), 0)::numeric as "profit"
        FROM "Sale" s
        LEFT JOIN "User" u ON s."userId" = u.id
        LEFT JOIN "Patient" p ON s."patientId" = p.id
        LEFT JOIN "SaleItem" si ON s.id = si."saleId"
        GROUP BY s.id, s.total, s."createdAt", u.name, p.name
        ORDER BY s."createdAt" DESC
        LIMIT 7
      `),

      // G. Recent Purchases (compact supplier purchase records)
      db.query(`
        SELECT 
          p.id,
          p."purchaseOrderNo",
          p."invoiceNo",
          p."totalCost",
          p."amountPaid",
          p."amountDue",
          p."status",
          p."paymentStatus",
          p."createdAt",
          p."orderDate",
          s.name as "supplierName",
          s.phone as "supplierPhone"
        FROM "Purchase" p
        LEFT JOIN "Supplier" s ON p."supplierId" = s.id
        ORDER BY p."createdAt" DESC
        LIMIT 7
      `),

      // H. Business Insights & Pending Tasks
      (async () => {
        const [
          bestSelling,
          slowMoving,
          unpaidInvoices,
          pendingDeliveries,
          unpaidExpenses,
          recentReturns,
        ] = await Promise.all([
          // 1. Best Selling Medicines in current period
          db.query(`
            SELECT 
              m.id as "medicineId",
              m.name as "medicineName",
              m.quantity as "currentStock",
              c.name as "categoryName",
              SUM(si.quantity)::int as "unitsSold",
              SUM(si.quantity * si."unitPrice")::numeric as "revenue",
              SUM(si.quantity * (si."unitPrice" - si."purchaseCost"))::numeric as "profit"
            FROM "SaleItem" si
            JOIN "Sale" s ON si."saleId" = s.id
            JOIN "Medicine" m ON si."medicineId" = m.id
            LEFT JOIN "Category" c ON m."categoryId" = c.id
            WHERE DATE(s."createdAt") >= $1::date AND DATE(s."createdAt") <= $2::date
            GROUP BY m.id, m.name, m.quantity, c.name
            ORDER BY "unitsSold" DESC, "revenue" DESC
            LIMIT 7
          `, [range.startDate, range.endDate]),

          // 2. Slow-Moving / Dead Stock (In-stock medicines with NO sales in selected period / last 30 days)
          db.query(`
            SELECT 
              m.id as "medicineId",
              m.name as "medicineName",
              m.quantity as "currentStock",
              COALESCE(m."purchaseCost", 0)::numeric as "unitCost",
              (m.quantity * COALESCE(m."purchaseCost", 0))::numeric as "trappedCapital",
              c.name as "categoryName"
            FROM "Medicine" m
            LEFT JOIN "Category" c ON m."categoryId" = c.id
            WHERE m.quantity > 5
              AND NOT EXISTS (
                SELECT 1 FROM "SaleItem" si
                JOIN "Sale" s ON si."saleId" = s.id
                WHERE si."medicineId" = m.id
                  AND DATE(s."createdAt") >= CURRENT_DATE - interval '30 days'
              )
            ORDER BY "trappedCapital" DESC
            LIMIT 7
          `),

          // 3. Unpaid or Partially Paid Supplier Invoices
          db.query(`
            SELECT 
              p.id,
              p."invoiceNo",
              p."purchaseOrderNo",
              p."totalCost",
              p."amountPaid",
              p."amountDue",
              p."paymentStatus",
              p."orderDate",
              s.name as "supplierName"
            FROM "Purchase" p
            LEFT JOIN "Supplier" s ON p."supplierId" = s.id
            WHERE p."amountDue" > 0
            ORDER BY p."amountDue" DESC, p."createdAt" ASC
            LIMIT 7
          `),

          // 4. Purchases Awaiting Delivery
          db.query(`
            SELECT 
              p.id,
              p."purchaseOrderNo",
              p."invoiceNo",
              p."totalCost",
              p."status",
              p."orderDate",
              s.name as "supplierName"
            FROM "Purchase" p
            LEFT JOIN "Supplier" s ON p."supplierId" = s.id
            WHERE p."status" = 'PENDING'
            ORDER BY p."createdAt" ASC
            LIMIT 7
          `),

          // 5. Unpaid Operating Expenses
          db.query(`
            SELECT 
              e.id,
              e.category,
              e.title,
              e.amount,
              e."amountPaid",
              e."amountDue",
              e."paymentStatus",
              e."expenseDate",
              e.payee
            FROM "Expense" e
            WHERE e."isVoided" = FALSE AND e."amountDue" > 0
            ORDER BY e."expenseDate" ASC
            LIMIT 7
          `),

          // 6. Recent Returns or Write-Offs
          db.query(`
            SELECT 
              it.id,
              it.type,
              it.quantity,
              it.reason,
              it."totalPrice",
              it."createdAt",
              it."userName",
              m.name as "medicineName"
            FROM "InventoryTransaction" it
            JOIN "Medicine" m ON it."medicineId" = m.id
            WHERE it.type IN ('DAMAGE', 'EXPIRED', 'RETURN', 'SUBTRACT')
               OR it.reason ILIKE '%return%'
               OR it.reason ILIKE '%damage%'
               OR it.reason ILIKE '%waste%'
               OR it.reason ILIKE '%write%'
            ORDER BY it."createdAt" DESC
            LIMIT 7
          `),
        ]);

        return {
          bestSelling: bestSelling.rows,
          slowMoving: slowMoving.rows,
          unpaidInvoices: unpaidInvoices.rows,
          pendingDeliveries: pendingDeliveries.rows,
          unpaidExpenses: unpaidExpenses.rows,
          recentReturns: recentReturns.rows,
        };
      })(),
    ]);

    // Format Overview Row
    const ov = overviewRes.rows[0] || {};
    const curAnalytics = analyticsCurrentRes.rows[0] || {};
    const prevAnalytics = analyticsPrevRes.rows[0] || {};

    const todaySales = parseFloat(Number(ov.todaySales || 0).toFixed(2));
    const yesterdaySales = parseFloat(Number(ov.yesterdaySales || 0).toFixed(2));
    const salesChangePct = yesterdaySales > 0 ? parseFloat((((todaySales - yesterdaySales) / yesterdaySales) * 100).toFixed(1)) : 0;

    const todayGrossProfit = parseFloat(Number(ov.todayGrossProfit || 0).toFixed(2));
    const yesterdayGrossProfit = parseFloat(Number(ov.yesterdayGrossProfit || 0).toFixed(2));
    const profitChangePct = yesterdayGrossProfit > 0 ? parseFloat((((todayGrossProfit - yesterdayGrossProfit) / yesterdayGrossProfit) * 100).toFixed(1)) : 0;

    const todayExpenses = parseFloat(Number(ov.todayExpenses || 0).toFixed(2));
    const todayTransactions = parseInt(ov.todayTransactions || 0, 10);
    const yesterdayTransactions = parseInt(ov.yesterdayTransactions || 0, 10);
    const transactionsChangePct = yesterdayTransactions > 0 ? parseFloat((((todayTransactions - yesterdayTransactions) / yesterdayTransactions) * 100).toFixed(1)) : 0;

    const inventoryCostValue = parseFloat(Number(ov.inventoryCostValue || 0).toFixed(2));
    const inventoryRetailValue = parseFloat(Number(ov.inventoryRetailValue || 0).toFixed(2));
    const outstandingSupplierBalance = parseFloat(Number(ov.outstandingSupplierBalance || 0).toFixed(2));

    // Format Period Analytics
    const periodRevenue = parseFloat(Number(curAnalytics.periodRevenue || 0).toFixed(2));
    const prevRevenue = parseFloat(Number(prevAnalytics.prevRevenue || 0).toFixed(2));
    const revenueGrowthPct = prevRevenue > 0 ? parseFloat((((periodRevenue - prevRevenue) / prevRevenue) * 100).toFixed(1)) : 0;

    const periodGrossProfit = parseFloat(Number(curAnalytics.periodGrossProfit || 0).toFixed(2));
    const prevGrossProfit = parseFloat(Number(prevAnalytics.prevGrossProfit || 0).toFixed(2));
    const profitGrowthPct = prevGrossProfit > 0 ? parseFloat((((periodGrossProfit - prevGrossProfit) / prevGrossProfit) * 100).toFixed(1)) : 0;

    const periodTransactions = parseInt(curAnalytics.periodTransactions || 0, 10);
    const prevTransactions = parseInt(prevAnalytics.prevTransactions || 0, 10);
    const transactionsGrowthPct = prevTransactions > 0 ? parseFloat((((periodTransactions - prevTransactions) / prevTransactions) * 100).toFixed(1)) : 0;

    const avgTransactionValue = periodTransactions > 0 ? parseFloat((periodRevenue / periodTransactions).toFixed(2)) : 0;

    return {
      period: range,
      settings: {
        currency: settings.currency || 'ETB',
        currencySymbol: settings.currencySymbol || 'Birr',
        lowStockThreshold: defaultLowStock,
        expiryThresholdDays: defaultExpiryDays,
      },
      businessOverview: {
        todaySales,
        yesterdaySales,
        salesChangePct,
        todayGrossProfit,
        yesterdayGrossProfit,
        profitChangePct,
        todayExpenses,
        todayTransactions,
        yesterdayTransactions,
        transactionsChangePct,
        inventoryCostValue,
        inventoryRetailValue,
        totalStockUnits: parseInt(ov.totalStockUnits || 0, 10),
        totalMedicinesCount: parseInt(ov.totalMedicinesCount || 0, 10),
        outstandingSupplierBalance,
        unpaidSupplierInvoicesCount: parseInt(ov.unpaidSupplierInvoicesCount || 0, 10),
      },
      salesAndProfitAnalytics: {
        summary: {
          periodRevenue,
          prevRevenue,
          revenueGrowthPct,
          periodGrossProfit,
          prevGrossProfit,
          profitGrowthPct,
          periodTransactions,
          prevTransactions,
          transactionsGrowthPct,
          periodUnitsSold: parseInt(curAnalytics.periodUnitsSold || 0, 10),
          avgTransactionValue,
        },
        dailyTrend: dailyTrendRes.rows.map((r) => ({
          date: r.date,
          label: r.shortLabel,
          weekday: r.weekday,
          revenue: parseFloat(Number(r.revenue || 0).toFixed(2)),
          grossProfit: parseFloat(Number(r.grossProfit || 0).toFixed(2)),
          transactions: parseInt(r.transactions || 0, 10),
          unitsSold: parseInt(r.unitsSold || 0, 10),
        })),
      },
      stockAndExpiryAlerts: alertsRes,
      recentRecords: {
        recentSales: recentSalesRes.rows.map((s) => ({
          id: s.id,
          receiptNo: `#SALE-${s.id.slice(0, 8).toUpperCase()}`,
          createdAt: s.createdAt,
          itemsCount: s.itemsCount,
          totalUnits: s.totalUnits,
          total: parseFloat(Number(s.total || 0).toFixed(2)),
          profit: parseFloat(Number(s.profit || 0).toFixed(2)),
          cashierName: s.cashierName || 'Cashier',
          patientName: s.patientName || 'Walk-in Customer',
        })),
        recentPurchases: recentPurchasesRes.rows.map((p) => ({
          id: p.id,
          purchaseOrderNo: p.purchaseOrderNo || `#PO-${p.id.slice(0, 8).toUpperCase()}`,
          invoiceNo: p.invoiceNo || 'N/A',
          supplierName: p.supplierName || 'Unknown Supplier',
          supplierPhone: p.supplierPhone || '',
          totalCost: parseFloat(Number(p.totalCost || 0).toFixed(2)),
          amountPaid: parseFloat(Number(p.amountPaid || 0).toFixed(2)),
          amountDue: parseFloat(Number(p.amountDue || 0).toFixed(2)),
          status: p.status || 'PENDING',
          paymentStatus: p.paymentStatus || 'PAID',
          createdAt: p.createdAt,
          orderDate: p.orderDate || p.createdAt,
        })),
      },
      businessInsightsAndPendingTasks: insightsRes,
    };
  }
}

export const dashboardService = new DashboardService();

