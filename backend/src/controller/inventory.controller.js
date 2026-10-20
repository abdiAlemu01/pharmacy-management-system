import { inventoryService } from '../service/inventory.service.js';

export class InventoryController {
  /**
   * GET /api/inventory/summary
   * Whole investment cost, unit counts, low stock/excess stock summary
   */
  static async getSummary(req, res, next) {
    try {
      const summary = await inventoryService.getSummary();
      return res.status(200).json({
        success: true,
        message: 'Inventory summary retrieved successfully',
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/inventory
   * List inventory items with search by medicine name and pagination
   */
  static async getInventory(req, res, next) {
    try {
      const { search = '', page = 1, limit = 10 } = req.query;
      const result = await inventoryService.getInventory({
        search,
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 10,
      });
      return res.status(200).json({
        success: true,
        message: 'Inventory items retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/inventory/add
   * Add stock to an existing medicine or register new medicine stock
   */
  static async addStock(req, res, next) {
    try {
      const { name, quantity, purchaseCost, sellingPrice, purchaseDate, expiryDate } = req.body;
      const result = await inventoryService.addStock({
        name,
        quantity: Number(quantity),
        purchaseCost: Number(purchaseCost),
        sellingPrice: Number(sellingPrice),
        purchaseDate,
        expiryDate,
        user: req.user,
      });
      return res.status(200).json({
        success: true,
        message: 'Stock added successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/inventory/reduce
   * Subtract stock from a medicine
   */
  static async reduceStock(req, res, next) {
    try {
      const { medicineId, quantity, reason, date } = req.body;
      const result = await inventoryService.reduceStock({
        medicineId,
        quantity: Number(quantity),
        reason,
        date,
        user: req.user,
      });
      return res.status(200).json({
        success: true,
        message: 'Stock reduced successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/inventory/:id
   * Edit medicine information (name, quantity, purchaseCost, sellingPrice, purchaseDate)
   */
  static async editMedicine(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };
      if (updateData.quantity !== undefined) updateData.quantity = Number(updateData.quantity);
      if (updateData.purchaseCost !== undefined) updateData.purchaseCost = Number(updateData.purchaseCost);
      if (updateData.sellingPrice !== undefined) updateData.sellingPrice = Number(updateData.sellingPrice);

      const result = await inventoryService.editMedicine(id, updateData);
      return res.status(200).json({
        success: true,
        message: 'Medicine updated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/inventory/movements
   * Audit trail of inventory transactions
   */
  static async getMovements(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const result = await inventoryService.getMovements({
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 20,
      });
      return res.status(200).json({
        success: true,
        message: 'Stock movements retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

