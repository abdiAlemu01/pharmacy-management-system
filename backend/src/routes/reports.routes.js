import { Router } from 'express';
import { ReportsController } from '../controller/reports.controller.js';
import { authenticate } from '../middleware/authenticate.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';

const router = Router();

// Protect all report endpoints: Admin only
router.use(authenticate);
router.use(authorize('ADMIN'));

// 1. High-level Overview Metrics
router.get('/overview', ReportsController.getOverview);

// 2. Sales Reports
router.get('/sales', ReportsController.getSalesReports);

// 3. Profit & Financial Reports
router.get('/financial', ReportsController.getFinancialReports);

// 4. Inventory Condition Reports
router.get('/inventory', ReportsController.getInventoryReports);

// 5. Purchase Activity Reports
router.get('/purchases', ReportsController.getPurchaseReports);

// 6. Expense Breakdown Reports
router.get('/expenses', ReportsController.getExpenseReports);

// 7. Medicine Sales Performance Reports
router.get('/medicine-performance', ReportsController.getMedicinePerformanceReports);

export default router;

