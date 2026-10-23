import { Router } from 'express';
import { MedicinesController } from '../controller/medicines.controller.js';
import { authenticate } from '../middleware/authenticate.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';
import { validateRequest } from '../middleware/validate-request.middleware.js';
import {
  createMedicineSchema,
  updateMedicineSchema,
  getMedicineParamsSchema,
  queryMedicinesSchema,
} from '../validation/medicines.validation.js';

const router = Router();

// Apply authentication & Role access: Admin and Inventor
router.use(authenticate);
router.use(authorize('ADMIN', 'INVENTOR'));

// 1. Create a new medicine
router.post(
  '/',
  validateRequest(createMedicineSchema),
  MedicinesController.createMedicine
);

// 2. View all medicines (with search, filter, sort, pagination)
router.get(
  '/',
  validateRequest(queryMedicinesSchema),
  MedicinesController.getMedicines
);

// 3. View individual medicine details
router.get(
  '/:id',
  validateRequest(getMedicineParamsSchema),
  MedicinesController.getMedicineById
);

// 4. Edit existing medicine
router.put(
  '/:id',
  validateRequest(updateMedicineSchema),
  MedicinesController.updateMedicine
);

export default router;

