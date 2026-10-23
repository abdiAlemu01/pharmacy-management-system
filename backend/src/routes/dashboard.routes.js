import { Router } from 'express';
import { DashboardController } from '../controller/dashboard.controller.js';
import { authenticate } from '../middleware/authenticate.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';

const router = Router();

// Protect dashboard route: Authenticated ADMIN only
router.use(authenticate);
router.use(authorize('ADMIN'));

// GET /api/v1/dashboard/summary
router.get('/summary', DashboardController.getSummary);

export default router;

