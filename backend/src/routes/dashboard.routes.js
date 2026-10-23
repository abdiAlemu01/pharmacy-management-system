import { Router } from 'express';
import { DashboardController } from '../controller/dashboard.controller.js';
import { authenticate } from '../middleware/authenticate.middleware.js';

const router = Router();

// Protect dashboard route
router.use(authenticate);

// GET /api/dashboard/summary
router.get('/summary', DashboardController.getSummary);

export default router;

