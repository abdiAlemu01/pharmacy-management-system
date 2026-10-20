import { z } from 'zod';

export const updatePharmacySchema = z.object({
  body: z.object({
    pharmacyName: z.string().trim().min(1, 'Pharmacy name is required'),
    ownerName: z.string().trim().min(1, 'Owner name is required'),
    phone: z.string().trim().min(1, 'Phone number is required'),
    email: z.string().trim().email('Invalid email address'),
    address: z.string().trim().min(1, 'Pharmacy address is required'),
    logoUrl: z.string().optional().nullable(),
  }),
});

export const updateAccountSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Name is required').optional(),
    firstName: z.string().trim().optional(),
    lastName: z.string().trim().optional(),
    email: z.string().trim().email('Invalid email address'),
    phone: z.string().trim().optional(),
    sessionTimeout: z.number().int().min(5).max(720).optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters long'),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New password and confirm password do not match',
    path: ['confirmPassword'],
  }),
});

export const updateNotificationsSchema = z.object({
  body: z.object({
    lowStockAlerts: z.boolean().optional(),
    lowStockThreshold: z.number().int().min(1).max(1000).optional(),
    nearingExpiryAlerts: z.boolean().optional(),
    expiryThresholdDays: z.number().int().min(1).max(365).optional(),
    expiredAlerts: z.boolean().optional(),
    supplierPaymentDueReminders: z.boolean().optional(),
    pendingPurchaseAlerts: z.boolean().optional(),
    inAppNotifications: z.boolean().optional(),
  }),
});

export const updateGeneralPreferencesSchema = z.object({
  body: z.object({
    currency: z.string().trim().min(1).default('ETB'),
    currencySymbol: z.string().trim().min(1).default('Br'),
    dateFormat: z.enum(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']).default('DD/MM/YYYY'),
    timeZone: z.string().trim().min(1).default('Africa/Addis_Ababa'),
    theme: z.enum(['light', 'dark', 'system']).default('light'),
    defaultDashboardDateRange: z.enum(['today', 'week', 'month', 'year']).default('month'),
    tableRowsPerPage: z.number().int().min(5).max(100).default(10),
  }),
});

