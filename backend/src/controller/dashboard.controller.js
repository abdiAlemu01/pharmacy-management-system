import { dashboardService } from '../service/dashboard.service.js';

export class DashboardController {
  static async getSummary(req, res, next) {
    try {
      const { period, startDate, endDate } = req.query;
      const data = await dashboardService.getDashboardData({
        period,
        startDate,
        endDate,
      });

      return res.status(200).json({
        success: true,
        message: 'Dashboard data retrieved successfully',
        data,
      });
    } catch (err) {
      next(err);
    }
  }
}

