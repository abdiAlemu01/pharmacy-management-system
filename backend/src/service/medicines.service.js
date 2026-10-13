import { db } from '../database/client.js';
import crypto from 'crypto';

export class MedicinesService {
  /**
   * Helper to determine stock status based on quantity and threshold
   */
  calculateStatus(quantity, threshold = 10) {
    if (quantity === 0) return 'OUT_OF_STOCK';
    if (quantity <= threshold) return 'LOW_STOCK';
    return 'IN_STOCK';
  }

  /**
   * Format numeric fields properly
   */
  formatMedicine(row, threshold = 10) {
    const purchaseCost = parseFloat(row.purchaseCost || 0);
    const sellingPrice = parseFloat(row.sellingPrice || 0);
    const profitPerUnit = parseFloat((sellingPrice - purchaseCost).toFixed(2));
    const quantity = parseInt(row.quantity, 10) || 0;

    return {
      id: row.id,
      name: row.name,
      quantity,
      purchaseCost,
      sellingPrice,
      profitPerUnit,
      status: this.calculateStatus(quantity, threshold),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  /**
   * Create a new medicine
   */
  async createMedicine({ name, quantity, purchaseCost, sellingPrice }) {
    const trimmedName = name.trim();

    // Check for duplicate medicine name (case-insensitive)
    const existing = await db.query(
      'SELECT id FROM "Medicine" WHERE LOWER(TRIM(name)) = LOWER($1) LIMIT 1',
      [trimmedName]
    );

    if (existing.rows.length > 0) {
      const error = new Error(`A medicine with the name "${trimmedName}" already exists.`);
      error.statusCode = 409;
      throw error;
    }

    const id = crypto.randomUUID();
    const result = await db.query(
      `INSERT INTO "Medicine" ("id", "name", "quantity", "purchaseCost", "sellingPrice", "price", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $5, NOW())
       RETURNING *`,
      [id, trimmedName, quantity, purchaseCost, sellingPrice]
    );

    return this.formatMedicine(result.rows[0]);
  }

  /**
   * Get medicines with pagination, search, filter, and sorting
   */
  async getMedicines({
    search = '',
    status = 'ALL',
    sortBy = 'name',
    sortOrder = 'asc',
    page = 1,
    limit = 10,
    lowStockThreshold = 10,
  } = {}) {
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    // Search by name or id
    if (search && search.trim() !== '') {
      conditions.push(`(LOWER("name") LIKE $${paramIndex} OR LOWER("id") LIKE $${paramIndex})`);
      values.push(`%${search.trim().toLowerCase()}%`);
      paramIndex++;
    }

    // Filter by stock status
    if (status === 'OUT_OF_STOCK') {
      conditions.push(`"quantity" = 0`);
    } else if (status === 'LOW_STOCK') {
      conditions.push(`"quantity" > 0 AND "quantity" <= $${paramIndex}`);
      values.push(lowStockThreshold);
      paramIndex++;
    } else if (status === 'IN_STOCK') {
      conditions.push(`"quantity" > $${paramIndex}`);
      values.push(lowStockThreshold);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Total count query
    const countResult = await db.query(
      `SELECT COUNT(*)::int as total FROM "Medicine" ${whereClause}`,
      values
    );
    const total = countResult.rows[0].total;

    // Allowed sort columns
    const allowedSortColumns = {
      name: 'LOWER("name")',
      quantity: '"quantity"',
      purchaseCost: '"purchaseCost"',
      sellingPrice: '"sellingPrice"',
      id: '"id"',
      createdAt: '"createdAt"',
    };

    const sortColumn = allowedSortColumns[sortBy] || 'LOWER("name")';
    const direction = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    const offset = (page - 1) * limit;
    const queryValues = [...values, limit, offset];

    const dataResult = await db.query(
      `SELECT * FROM "Medicine" 
       ${whereClause} 
       ORDER BY ${sortColumn} ${direction} 
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      queryValues
    );

    const items = dataResult.rows.map((row) => this.formatMedicine(row, lowStockThreshold));

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Get medicine by ID
   */
  async getMedicineById(id, lowStockThreshold = 10) {
    const result = await db.query(
      'SELECT * FROM "Medicine" WHERE "id" = $1 LIMIT 1',
      [id]
    );

    if (result.rows.length === 0) {
      const error = new Error('Medicine not found');
      error.statusCode = 404;
      throw error;
    }

    return this.formatMedicine(result.rows[0], lowStockThreshold);
  }

  /**
   * Update existing medicine
   */
  async updateMedicine(id, updates) {
    const existing = await db.query(
      'SELECT * FROM "Medicine" WHERE "id" = $1 LIMIT 1',
      [id]
    );

    if (existing.rows.length === 0) {
      const error = new Error('Medicine not found');
      error.statusCode = 404;
      throw error;
    }

    const currentMedicine = existing.rows[0];

    // If updating name, ensure no other record has that name
    if (updates.name && updates.name.trim().toLowerCase() !== currentMedicine.name.toLowerCase()) {
      const duplicate = await db.query(
        'SELECT id FROM "Medicine" WHERE LOWER(TRIM(name)) = LOWER($1) AND "id" != $2 LIMIT 1',
        [updates.name.trim(), id]
      );

      if (duplicate.rows.length > 0) {
        const error = new Error(`A medicine with the name "${updates.name.trim()}" already exists.`);
        error.statusCode = 409;
        throw error;
      }
    }

    const newName = updates.name !== undefined ? updates.name.trim() : currentMedicine.name;
    const newQuantity = updates.quantity !== undefined ? updates.quantity : currentMedicine.quantity;
    const newPurchaseCost = updates.purchaseCost !== undefined ? updates.purchaseCost : currentMedicine.purchaseCost;
    const newSellingPrice = updates.sellingPrice !== undefined ? updates.sellingPrice : currentMedicine.sellingPrice;

    const result = await db.query(
      `UPDATE "Medicine"
       SET "name" = $1,
           "quantity" = $2,
           "purchaseCost" = $3,
           "sellingPrice" = $4,
           "price" = $4,
           "updatedAt" = NOW()
       WHERE "id" = $5
       RETURNING *`,
      [newName, newQuantity, newPurchaseCost, newSellingPrice, id]
    );

    return this.formatMedicine(result.rows[0]);
  }
}

export const medicinesService = new MedicinesService();

