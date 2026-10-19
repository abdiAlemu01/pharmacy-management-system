import { Router } from 'express';
import authRoutes from './auth.routes.js';
import medicinesRoutes from './medicines.routes.js';
import inventoryRoutes from './inventory.routes.js';
import salesRoutes from './sales.routes.js';
import suppliersRoutes from './suppliers.routes.js';
import purchasesRoutes from './purchases.routes.js';

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

export default router;



