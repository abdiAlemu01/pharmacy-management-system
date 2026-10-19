import { purchasesService } from '../service/purchases.service.js';

export class PurchasesController {
  /**
   * GET /api/purchases
   * List purchases with search and filters
   */
  static async getPurchases(req, res, next) {
    try {
      const { search, supplierId, status, paymentStatus, startDate, endDate, page, limit } = req.query;
      const data = await purchasesService.getPurchases({
        search,
        supplierId,
        status,
        paymentStatus,
        startDate,
        endDate,
        page,
        limit,
      });
      return res.status(200).json({
        success: true,
        message: 'Purchases retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/purchases/summary
   * Purchase reports and metrics
   */
  static async getPurchasesSummary(req, res, next) {
    try {
      const data = await purchasesService.getPurchasesSummary();
      return res.status(200).json({
        success: true,
        message: 'Purchase summary and reports retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/purchases/:id
   * Retrieve single purchase details
   */
  static async getPurchaseById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await purchasesService.getPurchaseById(id);
      return res.status(200).json({
        success: true,
        message: 'Purchase details retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/purchases
   * Add a new purchase order
   */
  static async createPurchase(req, res, next) {
    try {
      const purchase = await purchasesService.createPurchase(req.body, req.user);
      return res.status(201).json({
        success: true,
        message: 'Purchase order created successfully',
        data: purchase,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/purchases/:id/receive
   * Receive medicines and update inventory for accepted quantities
   */
  static async receiveMedicines(req, res, next) {
    try {
      const { id } = req.params;
      const data = await purchasesService.receiveMedicines(id, req.body, req.user);
      return res.status(200).json({
        success: true,
        message: 'Medicines received and inventory updated successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/purchases/:id/payments
   * Record supplier payment
   */
  static async recordPayment(req, res, next) {
    try {
      const { id } = req.params;
      const data = await purchasesService.recordPayment(id, req.body, req.user);
      return res.status(200).json({
        success: true,
        message: 'Supplier payment recorded successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/purchases/:id/returns
   * Return medicines to supplier and reflect in inventory and financials
   */
  static async returnMedicines(req, res, next) {
    try {
      const { id } = req.params;
      const data = await purchasesService.returnMedicines(id, req.body, req.user);
      return res.status(200).json({
        success: true,
        message: 'Medicines returned to supplier and records adjusted successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/purchases/:id
   * Delete purchase order
   */
  static async deletePurchase(req, res, next) {
    try {
      const { id } = req.params;
      const data = await purchasesService.deletePurchase(id);
      return res.status(200).json({
        success: true,
        message: data.message || 'Purchase deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

