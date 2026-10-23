import { Router } from 'express';
import { ExpensesController } from '../controller/expenses.controller.js';
import { authenticate } from '../middleware/authenticate.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';

const router = Router();

// Protect all expense routes: Admin only
router.use(authenticate);
router.use(authorize('ADMIN'));

// 1. Summary Cards
router.get('/summary', ExpensesController.getSummary);

// 2. Reports
router.get('/reports', ExpensesController.getReports);

// 3. List Expenses
router.get('/', ExpensesController.getExpenses);

// 4. Create Expense
router.post('/', ExpensesController.createExpense);

// 5. Get Expense by ID
router.get('/:id', ExpensesController.getExpenseById);

// 6. Update Expense
router.put('/:id', ExpensesController.updateExpense);

// 7. Record Payment
router.post('/:id/payment', ExpensesController.recordPayment);

// 8. Void Expense
router.post('/:id/void', ExpensesController.voidExpense);

export default router;

