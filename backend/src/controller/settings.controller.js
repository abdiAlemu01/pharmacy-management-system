import { settingsService } from '../service/settings.service.js';

export class SettingsController {
  /**
   * GET /api/settings
   * Retrieve all settings, current user info, and alert metrics
   */
  static async getSettings(req, res, next) {
    try {
      const userId = req.user?.id;
      const data = await settingsService.getSettings(userId);
      return res.status(200).json({
        success: true,
        message: 'Settings retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/settings/pharmacy
   * Update Pharmacy Information
   */
  static async updatePharmacyInfo(req, res, next) {
    try {
      const updated = await settingsService.updatePharmacyInfo(req.body);
      return res.status(200).json({
        success: true,
        message: 'Pharmacy details updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/settings/account
   * Update Owner's Account details
   */
  static async updateAccountInfo(req, res, next) {
    try {
      const userId = req.user?.id;
      const updatedUser = await settingsService.updateAccountInfo(userId, req.body);
      return res.status(200).json({
        success: true,
        message: 'Account information updated successfully',
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/settings/change-password
   * Change user password with current password verification
   */
  static async changePassword(req, res, next) {
    try {
      const userId = req.user?.id;
      const result = await settingsService.changePassword(userId, req.body);
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/settings/notifications
   * Update Notifications & Alerts preferences
   */
  static async updateNotifications(req, res, next) {
    try {
      const updated = await settingsService.updateNotifications(req.body);
      return res.status(200).json({
        success: true,
        message: 'Notification preferences updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/settings/general
   * Update General Preferences
   */
  static async updateGeneralPreferences(req, res, next) {
    try {
      const updated = await settingsService.updateGeneralPreferences(req.body);
      return res.status(200).json({
        success: true,
        message: 'General preferences updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}

