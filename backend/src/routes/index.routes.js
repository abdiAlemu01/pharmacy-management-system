import { Router } from 'express';
import authRoutes from './auth.routes.js';
import medicinesRoutes from './medicines.routes.js';
import inventoryRoutes from './inventory.routes.js';
import salesRoutes from './sales.routes.js';
import suppliersRoutes from './suppliers.routes.js';
import purchasesRoutes from './purchases.routes.js';
import expensesRoutes from './expenses.routes.js';
import settingsRoutes from './settings.routes.js';
import reportsRoutes from './reports.routes.js';

const router = Router();

// Mount Auth routes
router.use('/auth', authRoutes);

// Mount Medicines routes
router.use('/medicines', medicinesRoutes);

// Mount Inventory routes
router.use('/inventory', inventoryRoutes);

// Mount Sales routes
router.use('/sales', salesRoutes);

// Mount Suppliers routes
router.use('/suppliers', suppliersRoutes);

// Mount Purchases routes
router.use('/purchases', purchasesRoutes);

// Mount Expenses routes
router.use('/expenses', expensesRoutes);

// Mount Settings routes
router.use('/settings', settingsRoutes);

// Mount Reports routes
router.use('/reports', reportsRoutes);

export default router;
