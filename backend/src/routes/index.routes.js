import { Router } from 'express';
import authRoutes from './auth.routes.js';

const router = Router();

// Mount Auth routes only for this feature
router.use('/auth', authRoutes);

export default router;

