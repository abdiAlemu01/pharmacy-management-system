import { Router } from 'express';
import { AuthController } from '../controller/auth.controller.js';
import { validateRequest } from '../middleware/validate-request.middleware.js';
import { loginSchema, registerSchema } from '../validation/auth.validation.js';

const router = Router();

router.post('/register', validateRequest(registerSchema), AuthController.register);
router.post('/login', validateRequest(loginSchema), AuthController.login);

export default router;

