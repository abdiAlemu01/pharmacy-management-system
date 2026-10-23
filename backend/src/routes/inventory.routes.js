import { Router } from 'express';
import { InventoryController } from '../controller/inventory.controller.js';
import { authenticate } from '../middleware/authenticate.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';
import { validateRequest } from '../middleware/validate-request.middleware.js';
import {
  addStockSchema,
  reduceStockSchema,
  editMedicineInventorySchema,
} from '../validation/inventory.validation.js';

const router = Router();

// Require authentication & Role access: Admin and Inventor
router.use(authenticate);
router.use(authorize('ADMIN', 'INVENTOR'));

// 1. Get inventory investment summary
router.get('/summary', InventoryController.getSummary);

// 2. Audit movements
router.get('/movements', InventoryController.getMovements);

// 3. Get inventory items with search & pagination
router.get('/', InventoryController.getInventory);

// 4. Add stock (+)
router.post('/add', validateRequest(addStockSchema), InventoryController.addStock);

// 5. Reduce stock (-)
router.post('/reduce', validateRequest(reduceStockSchema), InventoryController.reduceStock);

// 6. Edit medicine inventory info
router.put('/:id', validateRequest(editMedicineInventorySchema), InventoryController.editMedicine);

export default router;

