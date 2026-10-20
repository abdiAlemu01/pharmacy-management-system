import { Router } from 'express';
import { SettingsController } from '../controller/settings.controller.js';
import { authenticate } from '../middleware/authenticate.middleware.js';
import { validateRequest } from '../middleware/validate-request.middleware.js';
import {
  updatePharmacySchema,
  updateAccountSchema,
  changePasswordSchema,
  updateNotificationsSchema,
  updateGeneralPreferencesSchema,
} from '../validation/settings.validation.js';

const router = Router();

// Protect all settings endpoints with authentication
router.use(authenticate);

// 1. Get all settings & user profile
router.get('/', SettingsController.getSettings);

// 2. Pharmacy Information
router.put('/pharmacy', validateRequest(updatePharmacySchema), SettingsController.updatePharmacyInfo);

// 3. Account & Security (Profile)
router.put('/account', validateRequest(updateAccountSchema), SettingsController.updateAccountInfo);

// 4. Account & Security (Change Password with current password verification)
router.post('/change-password', validateRequest(changePasswordSchema), SettingsController.changePassword);

// 5. Notifications & Alerts
router.put('/notifications', validateRequest(updateNotificationsSchema), SettingsController.updateNotifications);

// 6. General Preferences
router.put('/general', validateRequest(updateGeneralPreferencesSchema), SettingsController.updateGeneralPreferences);

export default router;

