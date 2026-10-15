import { z } from 'zod';

export const createSupplierSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Supplier name must be at least 2 characters'),
    contactPerson: z.string().optional().nullable(),
    phone: z.string().min(5, 'Valid phone number is required'),
    email: z.string().email('Invalid email address').optional().nullable().or(z.literal('')),
    address: z.string().optional().nullable(),
    stockSupplied: z.string().min(1, 'Please specify stock/medicines supplied by this supplier'),
    status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE').optional(),
    taxNumber: z.string().optional().nullable(),
    paymentTerms: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
  }),
});

export const updateSupplierSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Supplier ID is required'),
  }),
  body: z.object({
    name: z.string().min(2, 'Supplier name must be at least 2 characters').optional(),
    contactPerson: z.string().optional().nullable(),
    phone: z.string().min(5, 'Valid phone number is required').optional(),
    email: z.string().email('Invalid email address').optional().nullable().or(z.literal('')),
    address: z.string().optional().nullable(),
    stockSupplied: z.string().optional().nullable(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    taxNumber: z.string().optional().nullable(),
    paymentTerms: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
  }),
});

export const getSuppliersQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    status: z.string().optional(),
  }).optional(),
});

export const createSupplierPurchaseSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Supplier ID is required'),
  }),
  body: z.object({
    invoiceNo: z.string().optional().nullable(),
    totalCost: z.number().positive('Total cost must be greater than 0').optional(),
    paymentStatus: z.enum(['PAID', 'PENDING', 'PARTIAL']).default('PAID').optional(),
    amountPaid: z.number().min(0, 'Amount paid cannot be negative').optional().nullable(),
    amountDue: z.number().min(0, 'Amount due cannot be negative').optional().nullable(),
    notes: z.string().optional().nullable(),
    items: z.array(
      z.object({
        medicineName: z.string().min(1, 'Medicine name is required'),
        medicineId: z.string().optional().nullable(),
        batchNumber: z.string().optional().nullable(),
        quantity: z.number().int().positive('Quantity must be positive'),
        unitCost: z.number().positive('Unit cost must be positive'),
        expiryDate: z.string().optional().nullable(),
      })
    ).min(1, 'Purchase must have at least one item'),
  }),
});

