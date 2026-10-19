import { z } from 'zod';

export const createPurchaseSchema = z.object({
  body: z.object({
    supplierId: z.string().min(1, 'Supplier is required'),
    orderDate: z.string().optional().nullable(),
    invoiceNo: z.string().optional().nullable(),
    discount: z.number().min(0, 'Discount cannot be negative').default(0).optional(),
    additionalCharges: z.number().min(0, 'Additional charges cannot be negative').default(0).optional(),
    amountPaid: z.number().min(0, 'Amount paid cannot be negative').default(0).optional(),
    paymentMethod: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    items: z.array(
      z.object({
        medicineId: z.string().optional().nullable(),
        medicineName: z.string().min(1, 'Medicine name is required'),
        quantity: z.number().int().positive('Quantity ordered must be greater than 0'),
        unitCost: z.number().positive('Unit purchase price must be greater than 0'),
        batchNumber: z.string().optional().nullable(),
        expiryDate: z.string().optional().nullable(),
      })
    ).min(1, 'At least one medicine item is required in the purchase order'),
  }),
});

export const receiveMedicinesSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Purchase ID is required'),
  }),
  body: z.object({
    receivedDate: z.string().optional().nullable(),
    receivingNotes: z.string().optional().nullable(),
    items: z.array(
      z.object({
        purchaseItemId: z.string().min(1, 'Purchase item ID is required'),
        quantityReceived: z.number().int().min(0, 'Quantity received cannot be negative'),
        quantityRejected: z.number().int().min(0, 'Quantity rejected cannot be negative').default(0).optional(),
        batchNumber: z.string().optional().nullable(),
        expiryDate: z.string().optional().nullable(),
        rejectionReason: z.string().optional().nullable(),
      })
    ).min(1, 'At least one receiving item record is required'),
  }),
});

export const recordPaymentSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Purchase ID is required'),
  }),
  body: z.object({
    amount: z.number().positive('Payment amount must be greater than 0'),
    paymentDate: z.string().optional().nullable(),
    paymentMethod: z.string().optional().default('CASH'),
    notes: z.string().optional().nullable(),
  }),
});

export const returnMedicinesSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Purchase ID is required'),
  }),
  body: z.object({
    returnDate: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    items: z.array(
      z.object({
        purchaseItemId: z.string().min(1, 'Purchase item ID is required'),
        returnQuantity: z.number().int().positive('Return quantity must be greater than 0'),
        returnReason: z.string().min(1, 'Return reason is required'),
        refundStatus: z.enum(['CREDITED', 'REFUNDED', 'PENDING']).default('CREDITED').optional(),
      })
    ).min(1, 'At least one medicine return item is required'),
  }),
});

export const getPurchasesQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    supplierId: z.string().optional(),
    status: z.string().optional(),
    paymentStatus: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }).optional(),
});

