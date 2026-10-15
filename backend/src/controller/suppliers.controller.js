import { suppliersService } from '../service/suppliers.service.js';

export class SuppliersController {
  /**
   * GET /api/suppliers
   * Retrieve list of suppliers with search, filter, and purchase summaries
   */
  static async getSuppliers(req, res, next) {
    try {
      const { search, status, page, limit } = req.query;
      const data = await suppliersService.getSuppliers({ search, status, page, limit });
      return res.status(200).json({
        success: true,
        message: 'Suppliers retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/suppliers/:id
   * Retrieve single supplier details
   */
  static async getSupplierById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await suppliersService.getSupplierById(id);
      return res.status(200).json({
        success: true,
        message: 'Supplier details retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/suppliers
   * Register a new supplier
   */
  static async createSupplier(req, res, next) {
    try {
      const supplier = await suppliersService.createSupplier(req.body);
      return res.status(201).json({
        success: true,
        message: 'Supplier registered successfully',
        data: supplier,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/suppliers/:id
   * Update an existing supplier
   */
  static async updateSupplier(req, res, next) {
    try {
      const { id } = req.params;
      const supplier = await suppliersService.updateSupplier(id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Supplier updated successfully',
        data: supplier,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/suppliers/:id
   * Delete or deactivate a supplier
   */
  static async deleteSupplier(req, res, next) {
    try {
      const { id } = req.params;
      const result = await suppliersService.deleteSupplier(id);
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/suppliers/:id/purchases
   * Retrieve complete purchase history for a supplier
   */
  static async getSupplierPurchaseHistory(req, res, next) {
    try {
      const { id } = req.params;
      const data = await suppliersService.getSupplierPurchaseHistory(id);
      return res.status(200).json({
        success: true,
        message: 'Supplier purchase history retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/suppliers/:id/purchases
   * Record a new purchase from a supplier
   */
  static async createSupplierPurchase(req, res, next) {
    try {
      const { id } = req.params;
      const data = await suppliersService.createSupplierPurchase(id, req.body);
      return res.status(201).json({
        success: true,
        message: 'Purchase recorded successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/suppliers/:id/purchases/:purchaseId
   * Delete a purchase order from supplier history
   */
  static async deleteSupplierPurchase(req, res, next) {
    try {
      const { id, purchaseId } = req.params;
      const data = await suppliersService.deleteSupplierPurchase(id, purchaseId);
      return res.status(200).json({
        success: true,
        message: data.message,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}


