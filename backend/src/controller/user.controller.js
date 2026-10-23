import { UserService } from '../service/user.service.js';

const userService = new UserService();

export class UserController {
  static async listUsers(req, res, next) {
    try {
      const { search, role, status } = req.query;
      const users = await userService.listUsers({ search, role, status });
      return res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserById(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);
      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createUser(req, res, next) {
    try {
      const newUser = await userService.createUser(req.body);
      return res.status(201).json({
        success: true,
        message: 'Staff account created successfully',
        data: newUser,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req, res, next) {
    try {
      const updated = await userService.updateUser(
        req.params.id,
        req.body,
        req.user?.id
      );
      return res.status(200).json({
        success: true,
        message: 'Staff account updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async toggleStatus(req, res, next) {
    try {
      const updated = await userService.toggleUserStatus(
        req.params.id,
        req.body,
        req.user?.id
      );
      return res.status(200).json({
        success: true,
        message: `Account is now ${updated.status.toLowerCase()}`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req, res, next) {
    try {
      const result = await userService.resetUserPassword(req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Password reset successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req, res, next) {
    try {
      await userService.deleteUser(req.params.id, req.user?.id);
      return res.status(200).json({
        success: true,
        message: 'Staff account deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

