import { z } from 'zod';

export const createSaleSchema = z.object({
  body: z.object({
    patientId: z.string().optional().nullable(),
    userId: z.string().optional().nullable(),
    userRole: z.string().optional().nullable(),
    userName: z.string().optional().nullable(),
    discount: z.number().optional().nullable(),
    items: z
      .array(
        z.object({
          medicineId: z.string().min(1, 'Medicine ID is required'),
          quantity: z
            .number({ invalid_type_error: 'Quantity must be a number' })
            .int('Quantity must be an integer')
            .positive('Quantity must be greater than 0'),
          unitPrice: z
            .number({ invalid_type_error: 'Unit price must be a number' })
            .positive('Unit price must be greater than 0')
            .optional(),
        })
      )
      .min(1, 'Sale must include at least one item'),
  }).passthrough(),
});

export const getSalesQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }).optional(),
});

