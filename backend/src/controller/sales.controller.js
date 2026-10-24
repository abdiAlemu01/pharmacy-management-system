import { salesService } from '../service/sales.service.js';

export class SalesController {
  /**
   * GET /api/sales/analytics
   * Daily & Monthly sales, profits, most selling & less selling medicines
   */
  static async getAnalytics(req, res, next) {
    try {
      const data = await salesService.getAnalytics();
      return res.status(200).json({
        success: true,
        message: 'Sales analytics retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/sales
   * Process a POS sale
   */
  static async createSale(req, res, next) {
    try {
      const { items, patientId, userId, userRole, userName } = req.body;
      const effectiveUser = {
        ...(req.user || {}),
        ...(userId ? { id: userId } : {}),
        ...(userRole ? { role: userRole } : {}),
        ...(userName ? { name: userName } : {}),
      };

      const sale = await salesService.createSale({
        items,
        patientId,
        user: Object.keys(effectiveUser).length > 0 ? effectiveUser : req.user,
      });
      return res.status(201).json({
        success: true,
        message: 'Sale completed successfully',
        data: sale,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/sales
   * Retrieve sales history
   */
  static async getSales(req, res, next) {
    try {
      const { page = 1, limit = 15, search = '', startDate = '', endDate = '' } = req.query;
      const data = await salesService.getSales({
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 15,
        search,
        startDate,
        endDate,
      });
      return res.status(200).json({
        success: true,
        message: 'Sales history retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/sales/medicines
   * List available medicines for POS
   */
  static async getMedicinesForPOS(req, res, next) {
    try {
      const { search = '' } = req.query;
      const data = await salesService.getMedicinesForPOS({ search });
      return res.status(200).json({
        success: true,
        message: 'POS medicines retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

