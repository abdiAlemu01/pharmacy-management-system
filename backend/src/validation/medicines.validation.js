import { z } from 'zod';

export const createMedicineSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Medicine name is required'),
    quantity: z
      .number({ invalid_type_error: 'Quantity must be a number' })
      .int('Quantity must be a whole number')
      .nonnegative('Quantity cannot be negative'),
    purchaseCost: z
      .number({ invalid_type_error: 'Purchase cost must be a number' })
      .nonnegative('Purchase cost cannot be negative'),
    sellingPrice: z
      .number({ invalid_type_error: 'Selling price must be a number' })
      .nonnegative('Selling price cannot be negative'),
    expiryDate: z.string().optional().nullable().or(z.literal('')),
  }),
});

export const updateMedicineSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Medicine ID is required'),
  }),
  body: z.object({
    name: z.string().trim().min(1, 'Medicine name is required').optional(),
    quantity: z
      .number({ invalid_type_error: 'Quantity must be a number' })
      .int('Quantity must be a whole number')
      .nonnegative('Quantity cannot be negative')
      .optional(),
    purchaseCost: z
      .number({ invalid_type_error: 'Purchase cost must be a number' })
      .nonnegative('Purchase cost cannot be negative')
      .optional(),
    sellingPrice: z
      .number({ invalid_type_error: 'Selling price must be a number' })
      .nonnegative('Selling price cannot be negative')
      .optional(),
    expiryDate: z.string().optional().nullable().or(z.literal('')),
  }),
});

export const getMedicineParamsSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Medicine ID is required'),
  }),
});

export const queryMedicinesSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    status: z.enum(['ALL', 'IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK']).optional(),
    sortBy: z.enum(['name', 'quantity', 'purchaseCost', 'sellingPrice', 'id', 'createdAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.enum(['10', '20', '50']).transform(Number).optional(),
    lowStockThreshold: z.string().regex(/^\d+$/).transform(Number).optional(),
  }).optional(),
});

