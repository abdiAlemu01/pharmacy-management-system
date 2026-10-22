import { reportsService } from '../service/reports.service.js';

export class ReportsController {
  /**
   * GET /api/reports/overview
   */
  static async getOverview(req, res, next) {
    try {
      const overview = await reportsService.getOverview();
      return res.status(200).json({
        success: true,
        message: 'Reports overview metrics retrieved successfully',
        data: overview,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/reports/sales
   */
  static async getSalesReports(req, res, next) {
    try {
      const { period, startDate, endDate } = req.query;
      const data = await reportsService.getSalesReports({ period, startDate, endDate });
      return res.status(200).json({
        success: true,
        message: 'Sales reports retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/reports/financial
   */
  static async getFinancialReports(req, res, next) {
    try {
      const { period, startDate, endDate } = req.query;
      const data = await reportsService.getFinancialReports({ period, startDate, endDate });
      return res.status(200).json({
        success: true,
        message: 'Financial and profit reports retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/reports/inventory
   */
  static async getInventoryReports(req, res, next) {
    try {
      const { period, startDate, endDate } = req.query;
      const data = await reportsService.getInventoryReports({ period, startDate, endDate });
      return res.status(200).json({
        success: true,
        message: 'Inventory condition reports retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/reports/purchases
   */
  static async getPurchaseReports(req, res, next) {
    try {
      const { period, startDate, endDate } = req.query;
      const data = await reportsService.getPurchaseReports({ period, startDate, endDate });
      return res.status(200).json({
        success: true,
        message: 'Purchase activity reports retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/reports/expenses
   */
  static async getExpenseReports(req, res, next) {
    try {
      const { period, startDate, endDate, category, status } = req.query;
      const data = await reportsService.getExpenseReports({ period, startDate, endDate, category, status });
      return res.status(200).json({
        success: true,
        message: 'Expense breakdown reports retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/reports/medicine-performance
   */
  static async getMedicinePerformanceReports(req, res, next) {
    try {
      const { period, startDate, endDate, limit } = req.query;
      const data = await reportsService.getMedicinePerformanceReports({ period, startDate, endDate, limit });
      return res.status(200).json({
        success: true,
        message: 'Medicine performance reports retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

