import { Router } from 'express';
import { SalesController } from '../controller/sales.controller.js';
import { authenticate } from '../middleware/authenticate.middleware.js';
import { validateRequest } from '../middleware/validate-request.middleware.js';
import { createSaleSchema, getSalesQuerySchema } from '../validation/sales.validation.js';

const router = Router();

// Require authentication for all sales endpoints
router.use(authenticate);

// 1. Sales & Profit analytics (Daily & Monthly, top & least selling)
router.get('/analytics', SalesController.getAnalytics);

// 2. POS Medicines list (with stock, purchase price, selling price, unit profit)
router.get('/medicines', SalesController.getMedicinesForPOS);

// 3. Sales history
router.get('/', validateRequest(getSalesQuerySchema), SalesController.getSales);

// 4. Complete a POS sale
router.post('/', validateRequest(createSaleSchema), SalesController.createSale);

export default router;

