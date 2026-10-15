import { Router } from 'express';
import { SuppliersController } from '../controller/suppliers.controller.js';
import { authenticate } from '../middleware/authenticate.middleware.js';
import { validateRequest } from '../middleware/validate-request.middleware.js';
import {
  createSupplierSchema,
  updateSupplierSchema,
  getSuppliersQuerySchema,
  createSupplierPurchaseSchema,
} from '../validation/suppliers.validation.js';

const router = Router();

// Require authentication for all supplier endpoints
router.use(authenticate);

// 1. List suppliers with search, filter, and pagination
router.get('/', validateRequest(getSuppliersQuerySchema), SuppliersController.getSuppliers);

// 2. Register a new supplier
router.post('/', validateRequest(createSupplierSchema), SuppliersController.createSupplier);

// 3. Get single supplier details
router.get('/:id', SuppliersController.getSupplierById);

// 4. Update supplier information
router.put('/:id', validateRequest(updateSupplierSchema), SuppliersController.updateSupplier);

// 5. Delete or deactivate supplier
router.delete('/:id', SuppliersController.deleteSupplier);

// 6. View supplier purchase history
router.get('/:id/purchases', SuppliersController.getSupplierPurchaseHistory);

// 7. Record a new purchase from supplier
router.post('/:id/purchases', validateRequest(createSupplierPurchaseSchema), SuppliersController.createSupplierPurchase);

// 8. Delete a purchase order from supplier history
router.delete('/:id/purchases/:purchaseId', SuppliersController.deleteSupplierPurchase);

export default router;

