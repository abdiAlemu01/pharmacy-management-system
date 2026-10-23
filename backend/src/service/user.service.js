import bcrypt from 'bcryptjs';
import { db } from '../database/client.js';

export class UserService {
  /**
   * Normalize input role to supported roles: 'ADMIN', 'CASHIER', 'INVENTOR'
   */
  normalizeRole(role) {
    if (!role) return 'CASHIER';
    const r = role.toString().toUpperCase().trim();
    if (r === 'CASHER') return 'CASHIER';
    if (r === 'INVENTORY') return 'INVENTOR';
    if (['ADMIN', 'CASHIER', 'INVENTOR'].includes(r)) return r;
    return 'CASHIER';
  }

  /**
   * List all staff accounts with optional search, role and status filtering
   */
  async listUsers({ search = '', role = '', status = '' } = {}) {
    let query = `
      SELECT 
        "id", "name", "firstName", "lastName", "email", "phone", 
        "role", "status", "isActive", "createdAt", "updatedAt"
      FROM "User"
      WHERE 1=1
    `;
    const params = [];

    if (search && search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      query += ` AND (
        LOWER("name") LIKE $${params.length} OR 
        LOWER("email") LIKE $${params.length} OR 
        LOWER(COALESCE("phone", '')) LIKE $${params.length}
      )`;
    }

    if (role && role !== 'ALL') {
      const normalizedRole = this.normalizeRole(role);
      params.push(normalizedRole);
      query += ` AND UPPER("role") = $${params.length}`;
    }

    if (status && status !== 'ALL') {
      const normalizedStatus = status.toUpperCase().trim();
      params.push(normalizedStatus);
      query += ` AND UPPER("status") = $${params.length}`;
    }

    query += ' ORDER BY "createdAt" DESC';

    const result = await db.query(query, params);
    return result.rows.map((u) => ({
      ...u,
      role: this.normalizeRole(u.role),
      status: u.status || (u.isActive ? 'ACTIVE' : 'INACTIVE'),
      isActive: u.isActive !== false && u.status !== 'INACTIVE',
    }));
  }

  /**
   * Get single user by id
   */
  async getUserById(id) {
    const result = await db.query(
      `SELECT "id", "name", "firstName", "lastName", "email", "phone", 
              "role", "status", "isActive", "createdAt", "updatedAt"
       FROM "User" WHERE "id" = $1 LIMIT 1`,
      [id]
    );
    if (result.rows.length === 0) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }
    const u = result.rows[0];
    return {
      ...u,
      role: this.normalizeRole(u.role),
      status: u.status || (u.isActive ? 'ACTIVE' : 'INACTIVE'),
      isActive: u.isActive !== false && u.status !== 'INACTIVE',
    };
  }

  /**
   * Create a new staff account (Admin only)
   */
  async createUser({ fullName, email, password, phone, role = 'CASHIER', status = 'ACTIVE' }) {
    if (!email || !password || !fullName) {
      const err = new Error('Full Name, Email, and Password are required.');
      err.statusCode = 400;
      throw err;
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check email uniqueness
    const existing = await db.query(
      'SELECT "id" FROM "User" WHERE LOWER("email") = $1 LIMIT 1',
      [normalizedEmail]
    );
    if (existing.rows.length > 0) {
      const err = new Error('A user with this email address already exists.');
      err.statusCode = 409;
      throw err;
    }

    // Split name into first and last name
    const trimmedFullName = fullName.trim();
    const parts = trimmedFullName.split(/\s+/);
    const firstName = parts[0] || 'Staff';
    const lastName = parts.slice(1).join(' ') || '';

    const normalizedRole = this.normalizeRole(role);
    const normalizedStatus = (status || 'ACTIVE').toUpperCase().trim() === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const isActive = normalizedStatus === 'ACTIVE';

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await db.query(
      `INSERT INTO "User" (
        "name", "firstName", "lastName", "email", "password", "phone", "role", "status", "isActive"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING "id", "name", "firstName", "lastName", "email", "phone", "role", "status", "isActive", "createdAt"`,
      [
        trimmedFullName,
        firstName,
        lastName,
        normalizedEmail,
        hashedPassword,
        (phone || '').trim(),
        normalizedRole,
        normalizedStatus,
        isActive,
      ]
    );

    const created = result.rows[0];
    return {
      ...created,
      role: normalizedRole,
      status: normalizedStatus,
    };
  }

  /**
   * Update staff account details
   */
  async updateUser(id, { fullName, email, phone, role, status }, currentUserId) {
    const existing = await this.getUserById(id);

    // Prevent current admin from demoting or deactivating themselves
    if (id === currentUserId) {
      if (role && this.normalizeRole(role) !== 'ADMIN') {
        const err = new Error('You cannot change your own administrator role.');
        err.statusCode = 400;
        throw err;
      }
      if (status && status.toUpperCase() === 'INACTIVE') {
        const err = new Error('You cannot deactivate your own account.');
        err.statusCode = 400;
        throw err;
      }
    }

    const normalizedEmail = email ? email.toLowerCase().trim() : existing.email;

    // If email changed, check uniqueness
    if (normalizedEmail !== existing.email.toLowerCase()) {
      const emailCheck = await db.query(
        'SELECT "id" FROM "User" WHERE LOWER("email") = $1 AND "id" != $2 LIMIT 1',
        [normalizedEmail, id]
      );
      if (emailCheck.rows.length > 0) {
        const err = new Error('Another user with this email already exists.');
        err.statusCode = 409;
        throw err;
      }
    }

    const trimmedFullName = fullName ? fullName.trim() : existing.name;
    const parts = trimmedFullName.split(/\s+/);
    const firstName = parts[0] || existing.firstName || 'Staff';
    const lastName = parts.slice(1).join(' ') || existing.lastName || '';
    const updatedPhone = phone !== undefined ? phone.trim() : existing.phone;
    const updatedRole = role ? this.normalizeRole(role) : existing.role;
    const updatedStatus = status ? status.toUpperCase().trim() : existing.status;
    const isActive = updatedStatus === 'ACTIVE';

    const result = await db.query(
      `UPDATE "User"
       SET "name" = $1,
           "firstName" = $2,
           "lastName" = $3,
           "email" = $4,
           "phone" = $5,
           "role" = $6,
           "status" = $7,
           "isActive" = $8,
           "updatedAt" = CURRENT_TIMESTAMP
       WHERE "id" = $9
       RETURNING "id", "name", "firstName", "lastName", "email", "phone", "role", "status", "isActive", "createdAt", "updatedAt"`,
      [
        trimmedFullName,
        firstName,
        lastName,
        normalizedEmail,
        updatedPhone,
        updatedRole,
        updatedStatus,
        isActive,
        id,
      ]
    );

    return result.rows[0];
  }

  /**
   * Quick toggle user status between ACTIVE and INACTIVE
   */
  async toggleUserStatus(id, { status, isActive }, currentUserId) {
    if (id === currentUserId) {
      const err = new Error('You cannot deactivate your own account.');
      err.statusCode = 400;
      throw err;
    }

    let newStatus = 'ACTIVE';
    if (status) {
      newStatus = status.toUpperCase().trim() === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';
    } else if (isActive !== undefined) {
      newStatus = isActive ? 'ACTIVE' : 'INACTIVE';
    }

    const isNowActive = newStatus === 'ACTIVE';

    const result = await db.query(
      `UPDATE "User"
       SET "status" = $1, "isActive" = $2, "updatedAt" = CURRENT_TIMESTAMP
       WHERE "id" = $3
       RETURNING "id", "name", "email", "role", "status", "isActive"`,
      [newStatus, isNowActive, id]
    );

    if (result.rows.length === 0) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    return result.rows[0];
  }

  /**
   * Reset a staff member's password directly (Admin only)
   */
  async resetUserPassword(id, { newPassword }) {
    if (!newPassword || newPassword.length < 6) {
      const err = new Error('Password must be at least 6 characters long.');
      err.statusCode = 400;
      throw err;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const result = await db.query(
      `UPDATE "User"
       SET "password" = $1, "updatedAt" = CURRENT_TIMESTAMP
       WHERE "id" = $2
       RETURNING "id", "name", "email"`,
      [hashedPassword, id]
    );

    if (result.rows.length === 0) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    return { success: true, message: 'Password reset successfully.' };
  }

  /**
   * Delete a staff account
   */
  async deleteUser(id, currentUserId) {
    if (id === currentUserId) {
      const err = new Error('You cannot delete your own account.');
      err.statusCode = 400;
      throw err;
    }

    const result = await db.query('DELETE FROM "User" WHERE "id" = $1 RETURNING "id"', [id]);
    if (result.rows.length === 0) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    return { success: true, message: 'User deleted successfully.' };
  }
}

