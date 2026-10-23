import { Router } from 'express';
import { PurchasesController } from '../controller/purchases.controller.js';
import { authenticate } from '../middleware/authenticate.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';
import { validateRequest } from '../middleware/validate-request.middleware.js';
import {
  createPurchaseSchema,
  receiveMedicinesSchema,
  recordPaymentSchema,
  returnMedicinesSchema,
  getPurchasesQuerySchema,
} from '../validation/purchases.validation.js';

const router = Router();

// Require authentication & Role access: Admin and Inventor
router.use(authenticate);
router.use(authorize('ADMIN', 'INVENTOR'));

// 1. Get purchase summary and reports
router.get('/summary', PurchasesController.getPurchasesSummary);

// 2. List purchases with search & filters
router.get('/', validateRequest(getPurchasesQuerySchema), PurchasesController.getPurchases);

// 3. Add new purchase
router.post('/', validateRequest(createPurchaseSchema), PurchasesController.createPurchase);

// 4. Get single purchase details
router.get('/:id', PurchasesController.getPurchaseById);

// 5. Receive medicines (updates inventory for accepted quantities)
router.post('/:id/receive', validateRequest(receiveMedicinesSchema), PurchasesController.receiveMedicines);

// 6. Record supplier payment
router.post('/:id/payments', validateRequest(recordPaymentSchema), PurchasesController.recordPayment);

// 7. Return medicines to supplier
router.post('/:id/returns', validateRequest(returnMedicinesSchema), PurchasesController.returnMedicines);

// 8. Delete purchase
router.delete('/:id', PurchasesController.deletePurchase);

export default router;

