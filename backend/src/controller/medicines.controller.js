import { medicinesService } from '../service/medicines.service.js';

export class MedicinesController {
  static async createMedicine(req, res, next) {
    try {
      const medicine = await medicinesService.createMedicine(req.body);
      return res.status(201).json({
        success: true,
        message: 'Medicine added successfully',
        data: medicine,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMedicines(req, res, next) {
    try {
      const result = await medicinesService.getMedicines(req.query);
      return res.status(200).json({
        success: true,
        message: 'Medicines retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMedicineById(req, res, next) {
    try {
      const { id } = req.params;
      const threshold = req.query.lowStockThreshold ? Number(req.query.lowStockThreshold) : 10;
      const medicine = await medicinesService.getMedicineById(id, threshold);
      return res.status(200).json({
        success: true,
        message: 'Medicine details retrieved successfully',
        data: medicine,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateMedicine(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await medicinesService.updateMedicine(id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Medicine updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}

