import { Router } from 'express';
import { UserController } from '../controller/user.controller.js';
import { authenticate } from '../middleware/authenticate.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';

const router = Router();

// Protect all user management endpoints: Must be authenticated AND Admin
router.use(authenticate);
router.use(authorize('ADMIN'));

// List staff accounts with search/filter
router.get('/', UserController.listUsers);

// Create new staff account
router.post('/', UserController.createUser);

// Get single user
router.get('/:id', UserController.getUserById);

// Update staff account
router.put('/:id', UserController.updateUser);

// Quick toggle status (active/inactive)
router.patch('/:id/status', UserController.toggleStatus);

// Admin password reset for staff
router.post('/:id/reset-password', UserController.resetPassword);

// Delete staff account
router.delete('/:id', UserController.deleteUser);

export default router;

