import { expensesService } from '../service/expenses.service.js';

export class ExpensesController {
  /**
   * GET /api/expenses/summary
   */
  static async getSummary(req, res, next) {
    try {
      const summary = await expensesService.getSummary();
      return res.status(200).json({
        success: true,
        message: 'Expense summary retrieved successfully',
        data: summary,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/expenses
   */
  static async getExpenses(req, res, next) {
    try {
      const result = await expensesService.getExpenses(req.query);
      return res.status(200).json({
        success: true,
        message: 'Expenses retrieved successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/expenses/reports
   */
  static async getReports(req, res, next) {
    try {
      const reports = await expensesService.getReports(req.query);
      return res.status(200).json({
        success: true,
        message: 'Expense reports retrieved successfully',
        data: reports,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/expenses/:id
   */
  static async getExpenseById(req, res, next) {
    try {
      const { id } = req.params;
      const expense = await expensesService.getExpenseById(id);
      return res.status(200).json({
        success: true,
        message: 'Expense details retrieved successfully',
        data: expense,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/expenses
   */
  static async createExpense(req, res, next) {
    try {
      const user = req.user;
      const { title, category, amount, expenseDate } = req.body;

      if (!title || !title.trim()) {
        return res.status(400).json({ success: false, message: 'Expense title is required' });
      }
      if (!category || !category.trim()) {
        return res.status(400).json({ success: false, message: 'Expense category is required' });
      }
      if (!amount || isNaN(amount) || Number(amount) <= 0) {
        return res.status(400).json({ success: false, message: 'Expense amount must be greater than zero' });
      }
      if (!expenseDate) {
        return res.status(400).json({ success: false, message: 'Expense date is required' });
      }

      const created = await expensesService.createExpense(req.body, user);
      return res.status(201).json({
        success: true,
        message: 'Expense recorded successfully',
        data: created,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/expenses/:id
   */
  static async updateExpense(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await expensesService.updateExpense(id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Expense updated successfully',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/expenses/:id/payment
   */
  static async recordPayment(req, res, next) {
    try {
      const { id } = req.params;
      const user = req.user;
      const { amountPaid } = req.body;

      if (!amountPaid || isNaN(amountPaid) || Number(amountPaid) <= 0) {
        return res.status(400).json({ success: false, message: 'Payment amount must be greater than zero' });
      }

      const result = await expensesService.recordPayment(id, req.body, user);
      return res.status(200).json({
        success: true,
        message: 'Payment recorded successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/expenses/:id/void
   */
  static async voidExpense(req, res, next) {
    try {
      const { id } = req.params;
      const user = req.user;
      const result = await expensesService.voidExpense(id, req.body, user);
      return res.status(200).json({
        success: true,
        message: 'Expense voided successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

