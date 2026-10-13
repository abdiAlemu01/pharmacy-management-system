import { Router } from 'express';
import authRoutes from './auth.routes.js';
import medicinesRoutes from './medicines.routes.js';

const router = Router();

// Mount Auth routes
router.use('/auth', authRoutes);

// Mount Medicines routes
router.use('/medicines', medicinesRoutes);

export default router;

