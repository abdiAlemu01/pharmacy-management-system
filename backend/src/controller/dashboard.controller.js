import { DashboardService } from '../service/dashboard.service.js';

export class DashboardController {
  static async getSummary(req, res, next) {
    try {
      const { startDate, endDate, period } = req.query;
      const data = await DashboardService.getSummary({ startDate, endDate, period });
      res.status(200).json({
        success: true,
        message: 'Dashboard data retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

