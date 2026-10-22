import { db } from '../database/client.js';
import crypto from 'crypto';

export class ExpensesService {
  /**
   * Safe date formatting without UTC offset shifts
   */
  formatDateOnly(dateVal) {
    if (!dateVal) return null;
    if (typeof dateVal === 'string') return dateVal.split('T')[0];
    if (dateVal instanceof Date) {
      const year = dateVal.getFullYear();
      const month = String(dateVal.getMonth() + 1).padStart(2, '0');
      const day = String(dateVal.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return String(dateVal).split('T')[0];
  }

  /**
   * Sequential user-friendly ID: EXP-YYYYMMDD-0001
   */
  async generateExpenseNumber() {
    const today = new Date();
    const ymd = today.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `EXP-${ymd}-`;

    const res = await db.query(
      `SELECT "expenseNumber" FROM "Expense" 
       WHERE "expenseNumber" LIKE $1 
       ORDER BY "expenseNumber" DESC LIMIT 1`,
      [`${prefix}%`]
    );

    let nextSeq = 1;
    if (res.rows.length > 0 && res.rows[0].expenseNumber) {
      const parts = res.rows[0].expenseNumber.split('-');
      const lastSeq = parseInt(parts[2], 10);
      if (!isNaN(lastSeq)) {
        nextSeq = lastSeq + 1;
      }
    }

    return `${prefix}${String(nextSeq).padStart(4, '0')}`;
  }

  /**
   * 1. Expense Summary
   * - Total expenses this year
   * - Total expenses this month
   * - Total expenses today
   * - Total unpaid expenses (outstanding balance)
   * - Number of expense records
   */
  async getSummary() {
    const summaryRes = await db.query(`
      SELECT
        -- Total expenses this year (non-voided)
        COALESCE(SUM(CASE 
          WHEN "isVoided" = FALSE AND EXTRACT(YEAR FROM "expenseDate") = EXTRACT(YEAR FROM CURRENT_DATE) 
          THEN amount ELSE 0 END), 0)::numeric as "totalExpensesYear",

        -- Total expenses this month (non-voided)
        COALESCE(SUM(CASE 
          WHEN "isVoided" = FALSE 
            AND EXTRACT(YEAR FROM "expenseDate") = EXTRACT(YEAR FROM CURRENT_DATE)
            AND EXTRACT(MONTH FROM "expenseDate") = EXTRACT(MONTH FROM CURRENT_DATE) 
          THEN amount ELSE 0 END), 0)::numeric as "totalExpensesMonth",

        -- Total expenses today (non-voided)
        COALESCE(SUM(CASE 
          WHEN "isVoided" = FALSE AND "expenseDate" = CURRENT_DATE 
          THEN amount ELSE 0 END), 0)::numeric as "totalExpensesToday",

        -- Total unpaid expenses (sum of remaining balance on non-voided expenses)
        COALESCE(SUM(CASE 
          WHEN "isVoided" = FALSE THEN "amountDue" ELSE 0 END), 0)::numeric as "totalUnpaidExpenses",

        -- Number of active expense records
        COUNT(CASE WHEN "isVoided" = FALSE THEN 1 END)::int as "totalRecords"
      FROM "Expense"
    `);

    const row = summaryRes.rows[0] || {};
    return {
      totalExpensesYear: parseFloat(Number(row.totalExpensesYear || 0).toFixed(2)),
      totalExpensesMonth: parseFloat(Number(row.totalExpensesMonth || 0).toFixed(2)),
      totalExpensesToday: parseFloat(Number(row.totalExpensesToday || 0).toFixed(2)),
      totalUnpaidExpenses: parseFloat(Number(row.totalUnpaidExpenses || 0).toFixed(2)),
      totalRecords: parseInt(row.totalRecords || 0, 10),
    };
  }

  /**
   * 2. Expense History (List with search, date filters, category filters, pagination)
   */
  async getExpenses({
    search = '',
    category = 'ALL',
    startDate = '',
    endDate = '',
    status = 'ALL',
    page = 1,
    limit = 10,
    sortBy = 'expenseDate',
    sortOrder = 'desc',
  } = {}) {
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const offset = (parsedPage - 1) * parsedLimit;

    const conditions = [];
    const values = [];
    let pIdx = 1;

    // Search by title, payee, or expenseNumber
    if (search && search.trim()) {
      const s = `%${search.trim().toLowerCase()}%`;
      conditions.push(`(
        LOWER("title") LIKE $${pIdx} OR 
        LOWER(COALESCE("payee", '')) LIKE $${pIdx} OR 
        LOWER(COALESCE("expenseNumber", '')) LIKE $${pIdx}
      )`);
      values.push(s);
      pIdx++;
    }

    // Filter by Category
    if (category && category !== 'ALL') {
      conditions.push(`"category" = $${pIdx}`);
      values.push(category);
      pIdx++;
    }

    // Filter by Payment Status
    if (status && status !== 'ALL') {
      if (status === 'VOIDED') {
        conditions.push(`"isVoided" = TRUE`);
      } else if (status === 'OUTSTANDING' || status === 'UNPAID_BALANCE') {
        conditions.push(`"amountDue" > 0 AND "isVoided" = FALSE`);
      } else {
        conditions.push(`"paymentStatus" = $${pIdx} AND "isVoided" = FALSE`);
        values.push(status);
        pIdx++;
      }
    }

    // Filter by Date Range
    if (startDate) {
      conditions.push(`"expenseDate" >= $${pIdx}`);
      values.push(startDate);
      pIdx++;
    }
    if (endDate) {
      conditions.push(`"expenseDate" <= $${pIdx}`);
      values.push(endDate);
      pIdx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Validate sort column
    const allowedSort = ['expenseDate', 'amount', 'title', 'createdAt', 'amountDue'];
    const safeSortBy = allowedSort.includes(sortBy) ? sortBy : 'expenseDate';
    const safeSortOrder = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // Total count query
    const countRes = await db.query(
      `SELECT COUNT(*)::int as count FROM "Expense" ${whereClause}`,
      values
    );
    const totalCount = countRes.rows[0]?.count || 0;

    // Data query with last payment info
    const dataRes = await db.query(
      `SELECT 
         e.*,
         (SELECT MAX(p."paymentDate") FROM "ExpensePayment" p WHERE p."expenseId" = e.id) as "lastPaymentDate",
         (SELECT COUNT(*)::int FROM "ExpensePayment" p WHERE p."expenseId" = e.id) as "paymentsCount"
       FROM "Expense" e
       ${whereClause}
       ORDER BY "${safeSortBy}" ${safeSortOrder}, e."createdAt" DESC
       LIMIT $${pIdx} OFFSET $${pIdx + 1}`,
      [...values, parsedLimit, offset]
    );

    const items = dataRes.rows.map((row) => ({
      id: row.id,
      expenseNumber: row.expenseNumber || row.id.slice(0, 8),
      title: row.title || 'Untitled Expense',
      category: row.category,
      amount: parseFloat(Number(row.amount || 0).toFixed(2)),
      amountPaid: parseFloat(Number(row.amountPaid || 0).toFixed(2)),
      amountDue: parseFloat(Number(row.amountDue || 0).toFixed(2)),
      paymentStatus: row.isVoided ? 'VOIDED' : row.paymentStatus,
      expenseDate: this.formatDateOnly(row.expenseDate),
      payee: row.payee || '',
      description: row.description || '',
      isVoided: Boolean(row.isVoided),
      voidReason: row.voidReason || '',
      lastPaymentDate: this.formatDateOnly(row.lastPaymentDate),
      paymentsCount: row.paymentsCount || 0,
      createdAt: row.createdAt,
    }));

    return {
      items,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / parsedLimit) || 1,
      },
    };
  }

  /**
   * 3. Get Single Expense Details with payment history
   */
  async getExpenseById(id) {
    const res = await db.query('SELECT * FROM "Expense" WHERE id = $1', [id]);
    if (res.rows.length === 0) {
      const error = new Error('Expense record not found');
      error.statusCode = 404;
      throw error;
    }

    const expense = res.rows[0];

    // Fetch payments
    const paymentsRes = await db.query(
      'SELECT * FROM "ExpensePayment" WHERE "expenseId" = $1 ORDER BY "paymentDate" DESC, "createdAt" DESC',
      [id]
    );

    return {
      id: expense.id,
      expenseNumber: expense.expenseNumber || expense.id.slice(0, 8),
      title: expense.title,
      category: expense.category,
      amount: parseFloat(Number(expense.amount || 0).toFixed(2)),
      amountPaid: parseFloat(Number(expense.amountPaid || 0).toFixed(2)),
      amountDue: parseFloat(Number(expense.amountDue || 0).toFixed(2)),
      paymentStatus: expense.isVoided ? 'VOIDED' : expense.paymentStatus,
      expenseDate: this.formatDateOnly(expense.expenseDate),
      payee: expense.payee || '',
      description: expense.description || '',
      isVoided: Boolean(expense.isVoided),
      voidReason: expense.voidReason || '',
      voidedAt: expense.voidedAt,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
      payments: paymentsRes.rows.map((p) => ({
        id: p.id,
        paymentDate: this.formatDateOnly(p.paymentDate),
        amountPaid: parseFloat(Number(p.amountPaid || 0).toFixed(2)),
        paymentMethod: p.paymentMethod || 'Cash',
        notes: p.notes || '',
        createdAt: p.createdAt,
      })),
    };
  }

  /**
   * 4. Add Expense (with optional initial payment)
   */
  async createExpense(data, user) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      const id = crypto.randomUUID();
      const expenseNumber = await this.generateExpenseNumber();
      const title = data.title.trim();
      const category = data.category.trim();
      const amount = parseFloat(Number(data.amount).toFixed(2));
      const expenseDate = data.expenseDate;
      const payee = data.payee ? data.payee.trim() : null;
      const description = data.description ? data.description.trim() : null;
      const userId = user?.id || null;
      const userName = user?.name || user?.email || 'Staff';

      let amountPaid = 0;
      let initialPayment = null;

      // Check if user specified initial payment
      const initialPaid = parseFloat(Number(data.initialAmountPaid || 0).toFixed(2));
      if (initialPaid > 0) {
        amountPaid = Math.min(amount, initialPaid);
      } else if (data.isPaidInFull) {
        amountPaid = amount;
      }

      const amountDue = parseFloat((amount - amountPaid).toFixed(2));
      let paymentStatus = 'UNPAID';
      if (amountDue === 0 && amountPaid > 0) {
        paymentStatus = 'PAID';
      } else if (amountPaid > 0) {
        paymentStatus = 'PARTIALLY_PAID';
      }

      // 1. Insert Expense
      const insertRes = await client.query(
        `INSERT INTO "Expense" 
         ("id", "expenseNumber", "title", "category", "amount", "amountPaid", "amountDue", "paymentStatus", "expenseDate", "payee", "description", "userId", "userName", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
         RETURNING *`,
        [id, expenseNumber, title, category, amount, amountPaid, amountDue, paymentStatus, expenseDate, payee, description, userId, userName]
      );

      const created = insertRes.rows[0];

      // 2. Insert Payment record if paid
      if (amountPaid > 0) {
        const paymentId = crypto.randomUUID();
        const pDate = data.paymentDate || expenseDate;
        const pRes = await client.query(
          `INSERT INTO "ExpensePayment" 
           ("id", "expenseId", "paymentDate", "amountPaid", "paymentMethod", "notes", "userId", "userName", "createdAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
           RETURNING *`,
          [paymentId, id, pDate, amountPaid, data.paymentMethod || 'Cash', data.paymentNotes || 'Initial payment', userId, userName]
        );
        initialPayment = pRes.rows[0];
      }

      await client.query('COMMIT');

      return {
        ...created,
        expenseDate: this.formatDateOnly(created.expenseDate),
        amount: parseFloat(Number(created.amount).toFixed(2)),
        amountPaid: parseFloat(Number(created.amountPaid).toFixed(2)),
        amountDue: parseFloat(Number(created.amountDue).toFixed(2)),
        initialPayment,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * 5. Edit Expense Details
   */
  async updateExpense(id, data) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      const existingRes = await client.query('SELECT * FROM "Expense" WHERE id = $1 FOR UPDATE', [id]);
      if (existingRes.rows.length === 0) {
        const error = new Error('Expense record not found');
        error.statusCode = 404;
        throw error;
      }

      const existing = existingRes.rows[0];
      if (existing.isVoided) {
        const error = new Error('Cannot edit a voided expense');
        error.statusCode = 400;
        throw error;
      }

      const currentPaid = parseFloat(Number(existing.amountPaid || 0).toFixed(2));
      const newAmount = data.amount !== undefined ? parseFloat(Number(data.amount).toFixed(2)) : parseFloat(Number(existing.amount).toFixed(2));

      if (newAmount < currentPaid) {
        const error = new Error(`Expense amount cannot be reduced below the amount already paid (${currentPaid})`);
        error.statusCode = 400;
        throw error;
      }

      const newTitle = data.title !== undefined ? data.title.trim() : existing.title;
      const newCategory = data.category !== undefined ? data.category.trim() : existing.category;
      const newExpenseDate = data.expenseDate || existing.expenseDate;
      const newPayee = data.payee !== undefined ? (data.payee ? data.payee.trim() : null) : existing.payee;
      const newDescription = data.description !== undefined ? (data.description ? data.description.trim() : null) : existing.description;

      const newDue = parseFloat((newAmount - currentPaid).toFixed(2));
      let newStatus = 'UNPAID';
      if (newDue <= 0 && currentPaid > 0) {
        newStatus = 'PAID';
      } else if (currentPaid > 0) {
        newStatus = 'PARTIALLY_PAID';
      }

      const updateRes = await client.query(
        `UPDATE "Expense"
         SET "title" = $1,
             "category" = $2,
             "amount" = $3,
             "amountDue" = $4,
             "paymentStatus" = $5,
             "expenseDate" = $6,
             "payee" = $7,
             "description" = $8,
             "updatedAt" = NOW()
         WHERE id = $9
         RETURNING *`,
        [newTitle, newCategory, newAmount, newDue, newStatus, newExpenseDate, newPayee, newDescription, id]
      );

      await client.query('COMMIT');

      const updated = updateRes.rows[0];
      return {
        ...updated,
        expenseDate: this.formatDateOnly(updated.expenseDate),
        amount: parseFloat(Number(updated.amount).toFixed(2)),
        amountPaid: parseFloat(Number(updated.amountPaid).toFixed(2)),
        amountDue: parseFloat(Number(updated.amountDue).toFixed(2)),
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * 6. Payment Tracking — Record a payment
   */
  async recordPayment(id, data, user) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      const expRes = await client.query('SELECT * FROM "Expense" WHERE id = $1 FOR UPDATE', [id]);
      if (expRes.rows.length === 0) {
        const error = new Error('Expense record not found');
        error.statusCode = 404;
        throw error;
      }

      const existing = expRes.rows[0];
      if (existing.isVoided) {
        const error = new Error('Cannot record payment for a voided expense');
        error.statusCode = 400;
        throw error;
      }

      const currentDue = parseFloat(Number(existing.amountDue || 0).toFixed(2));
      if (currentDue <= 0) {
        const error = new Error('This expense is already fully paid');
        error.statusCode = 400;
        throw error;
      }

      const payAmount = parseFloat(Number(data.amountPaid).toFixed(2));
      if (isNaN(payAmount) || payAmount <= 0) {
        const error = new Error('Payment amount must be greater than zero');
        error.statusCode = 400;
        throw error;
      }

      if (payAmount > currentDue) {
        const error = new Error(`Payment amount (${payAmount}) exceeds the remaining balance (${currentDue})`);
        error.statusCode = 400;
        throw error;
      }

      const paymentId = crypto.randomUUID();
      const paymentDate = data.paymentDate || new Date().toISOString().split('T')[0];
      const paymentMethod = data.paymentMethod || 'Cash';
      const notes = data.notes ? data.notes.trim() : null;
      const userId = user?.id || null;
      const userName = user?.name || user?.email || 'Staff';

      const pRes = await client.query(
        `INSERT INTO "ExpensePayment"
         ("id", "expenseId", "paymentDate", "amountPaid", "paymentMethod", "notes", "userId", "userName", "createdAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
         RETURNING *`,
        [paymentId, id, paymentDate, payAmount, paymentMethod, notes, userId, userName]
      );

      const newTotalPaid = parseFloat((Number(existing.amountPaid || 0) + payAmount).toFixed(2));
      const newDue = parseFloat((Number(existing.amount || 0) - newTotalPaid).toFixed(2));
      const newStatus = newDue <= 0 ? 'PAID' : 'PARTIALLY_PAID';

      const updateRes = await client.query(
        `UPDATE "Expense"
         SET "amountPaid" = $1,
             "amountDue" = $2,
             "paymentStatus" = $3,
             "updatedAt" = NOW()
         WHERE id = $4
         RETURNING *`,
        [newTotalPaid, newDue, newStatus, id]
      );

      await client.query('COMMIT');

      return {
        expense: {
          ...updateRes.rows[0],
          expenseDate: this.formatDateOnly(updateRes.rows[0].expenseDate),
          amount: parseFloat(Number(updateRes.rows[0].amount).toFixed(2)),
          amountPaid: parseFloat(Number(updateRes.rows[0].amountPaid).toFixed(2)),
          amountDue: parseFloat(Number(updateRes.rows[0].amountDue).toFixed(2)),
        },
        payment: {
          ...pRes.rows[0],
          paymentDate: this.formatDateOnly(pRes.rows[0].paymentDate),
          amountPaid: parseFloat(Number(pRes.rows[0].amountPaid).toFixed(2)),
        },
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * 7. Void an expense
   */
  async voidExpense(id, { reason = 'Voided by user' } = {}, user) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      const expRes = await client.query('SELECT * FROM "Expense" WHERE id = $1 FOR UPDATE', [id]);
      if (expRes.rows.length === 0) {
        const error = new Error('Expense record not found');
        error.statusCode = 404;
        throw error;
      }

      const existing = expRes.rows[0];
      if (existing.isVoided) {
        const error = new Error('Expense is already voided');
        error.statusCode = 400;
        throw error;
      }

      const userName = user?.name || user?.email || 'Staff';

      const updateRes = await client.query(
        `UPDATE "Expense"
         SET "isVoided" = TRUE,
             "paymentStatus" = 'VOIDED',
             "voidReason" = $1,
             "voidedAt" = NOW(),
             "voidedBy" = $2,
             "updatedAt" = NOW()
         WHERE id = $3
         RETURNING *`,
        [reason.trim() || 'Voided by user', userName, id]
      );

      await client.query('COMMIT');

      return {
        ...updateRes.rows[0],
        expenseDate: this.formatDateOnly(updateRes.rows[0].expenseDate),
        amount: parseFloat(Number(updateRes.rows[0].amount).toFixed(2)),
        amountPaid: parseFloat(Number(updateRes.rows[0].amountPaid).toFixed(2)),
        amountDue: parseFloat(Number(updateRes.rows[0].amountDue).toFixed(2)),
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * 8. Expense Reports:
   * - Expenses by date range
   * - Monthly expense comparison
   * - Paid versus unpaid expenses
   */
  async getReports({ startDate = '', endDate = '' } = {}) {
    const conditions = ['"isVoided" = FALSE'];
    const values = [];
    let pIdx = 1;

    if (startDate) {
      conditions.push(`"expenseDate" >= $${pIdx}`);
      values.push(startDate);
      pIdx++;
    }
    if (endDate) {
      conditions.push(`"expenseDate" <= $${pIdx}`);
      values.push(endDate);
      pIdx++;
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    // 1. Overall totals in date range
    const totalRes = await db.query(
      `SELECT
         COUNT(*)::int as "totalRecords",
         COALESCE(SUM(amount), 0)::numeric as "totalAmount",
         COALESCE(SUM("amountPaid"), 0)::numeric as "totalPaid",
         COALESCE(SUM("amountDue"), 0)::numeric as "totalUnpaid"
       FROM "Expense"
       ${whereClause}`,
      values
    );

    const totalRow = totalRes.rows[0] || {};
    const totalAmount = parseFloat(Number(totalRow.totalAmount || 0).toFixed(2));
    const totalPaid = parseFloat(Number(totalRow.totalPaid || 0).toFixed(2));
    const totalUnpaid = parseFloat(Number(totalRow.totalUnpaid || 0).toFixed(2));

    // 2. Paid vs Unpaid counts & ratios
    const paidRatio = totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0;
    const unpaidRatio = totalAmount > 0 ? Math.round((totalUnpaid / totalAmount) * 100) : 0;

    // 3. Monthly Expense Comparison (Last 12 months)
    const monthlyRes = await db.query(
      `SELECT 
         TO_CHAR("expenseDate", 'YYYY-MM') as month,
         TO_CHAR("expenseDate", 'Mon YYYY') as "monthLabel",
         COUNT(*)::int as count,
         COALESCE(SUM(amount), 0)::numeric as total,
         COALESCE(SUM("amountPaid"), 0)::numeric as "paidTotal",
         COALESCE(SUM("amountDue"), 0)::numeric as "dueTotal"
       FROM "Expense"
       WHERE "isVoided" = FALSE
         AND "expenseDate" >= CURRENT_DATE - INTERVAL '12 months'
       GROUP BY TO_CHAR("expenseDate", 'YYYY-MM'), TO_CHAR("expenseDate", 'Mon YYYY')
       ORDER BY month ASC`
    );

    const monthlyComparison = monthlyRes.rows.map((r) => ({
      month: r.month,
      monthLabel: r.monthLabel,
      count: parseInt(r.count, 10),
      total: parseFloat(Number(r.total || 0).toFixed(2)),
      paidTotal: parseFloat(Number(r.paidTotal || 0).toFixed(2)),
      dueTotal: parseFloat(Number(r.dueTotal || 0).toFixed(2)),
    }));

    // 4. Expenses by category
    const catRes = await db.query(
      `SELECT 
         category,
         COUNT(*)::int as count,
         COALESCE(SUM(amount), 0)::numeric as total,
         COALESCE(SUM("amountPaid"), 0)::numeric as "paidTotal",
         COALESCE(SUM("amountDue"), 0)::numeric as "dueTotal"
       FROM "Expense"
       ${whereClause}
       GROUP BY category
       ORDER BY total DESC`,
      values
    );

    const byCategory = catRes.rows.map((r) => {
      const catTotal = parseFloat(Number(r.total || 0).toFixed(2));
      return {
        category: r.category,
        count: parseInt(r.count, 10),
        total: catTotal,
        paidTotal: parseFloat(Number(r.paidTotal || 0).toFixed(2)),
        dueTotal: parseFloat(Number(r.dueTotal || 0).toFixed(2)),
        percentage: totalAmount > 0 ? Math.round((catTotal / totalAmount) * 100) : 0,
      };
    });

    return {
      summary: {
        totalRecords: parseInt(totalRow.totalRecords || 0, 10),
        totalAmount,
        totalPaid,
        totalUnpaid,
        paidRatio,
        unpaidRatio,
      },
      byCategory,
      monthlyComparison,
    };
  }
}

export const expensesService = new ExpensesService();

