import { authService } from '../service/auth.service.js';

export class AuthController {
  static async register(req, res, next) {
    try {
      const { user, token } = await authService.register(req.body);
      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: { user, token },
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { user, token } = await authService.login(req.body);
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: { user, token },
      });
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req, res, next) {
    try {
      await authService.resetPassword(req.body);
      return res.status(200).json({
        success: true,
        message: 'Password has been reset successfully. Please sign in.',
      });
    } catch (error) {
      next(error);
    }
  }
}

