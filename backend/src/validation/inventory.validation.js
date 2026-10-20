import { z } from 'zod';

export const addStockSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Medicine name is required'),
    quantity: z
      .number({ invalid_type_error: 'Quantity must be a number' })
      .int('Quantity must be a whole number')
      .positive('Quantity to add must be greater than 0'),
    purchaseCost: z
      .number({ invalid_type_error: 'Purchase price must be a number' })
      .nonnegative('Purchase price cannot be negative'),
    sellingPrice: z
      .number({ invalid_type_error: 'Selling price must be a number' })
      .nonnegative('Selling price cannot be negative'),
    purchaseDate: z.string().optional(),
    expiryDate: z.string().optional().nullable(),
  }),
});

export const reduceStockSchema = z.object({
  body: z.object({
    medicineId: z.string().min(1, 'Medicine ID is required'),
    quantity: z
      .number({ invalid_type_error: 'Quantity must be a number' })
      .int('Quantity must be a whole number')
      .positive('Quantity to reduce must be greater than 0'),
    reason: z.string().trim().optional(),
    date: z.string().optional(),
  }),
});

export const editMedicineInventorySchema = z.object({
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
      .number({ invalid_type_error: 'Purchase price must be a number' })
      .nonnegative('Purchase price cannot be negative')
      .optional(),
    sellingPrice: z
      .number({ invalid_type_error: 'Selling price must be a number' })
      .nonnegative('Selling price cannot be negative')
      .optional(),
    purchaseDate: z.string().optional(),
    expiryDate: z.string().optional().nullable(),
  }),
});

