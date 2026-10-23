import bcrypt from 'bcryptjs';
import { db } from '../database/client.js';

export class UserService {
  constructor() {
    this._cachedCols = null;
    this._lastCheckTime = 0;
  }

  /**
   * Safe helper: ensures missing columns are created if permissions permit,
   * and dynamically discovers available columns in the User table.
   */
  async getTableColumns() {
    const now = Date.now();
    // Cache for 10 seconds to avoid repeating DDL on every request
    if (this._cachedCols && now - this._lastCheckTime < 10000) {
      return this._cachedCols;
    }

    try {
      // 1. Attempt to add columns safely (if permissions allow)
      await db.query(`
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'ACTIVE';
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT TRUE;
        UPDATE "User" SET "status" = 'ACTIVE' WHERE "status" IS NULL;
        UPDATE "User" SET "isActive" = TRUE WHERE "isActive" IS NULL;
      `).catch(() => {});

      // 2. Query available columns directly from PostgreSQL information_schema
      const res = await db.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE LOWER(table_name) = 'user'
      `);

      const colSet = new Set(res.rows.map((r) => r.column_name));

      this._cachedCols = {
        hasStatus: colSet.has('status'),
        hasIsActive: colSet.has('isActive'),
        hasFirstName: colSet.has('firstName'),
        hasLastName: colSet.has('lastName'),
        hasPhone: colSet.has('phone'),
      };
      this._lastCheckTime = now;
      return this._cachedCols;
    } catch (err) {
      console.warn('Notice while inspecting User columns:', err.message);
      return {
        hasStatus: false,
        hasIsActive: false,
        hasFirstName: false,
        hasLastName: false,
        hasPhone: false,
      };
    }
  }

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
    const cols = await this.getTableColumns();

    let query = '';
    const params = [];

    if (cols.hasStatus) {
      query = `
        SELECT 
          "id", "name", 
          ${cols.hasFirstName ? '"firstName",' : '\'\' as "firstName",'}
          ${cols.hasLastName ? '"lastName",' : '\'\' as "lastName",'}
          "email", 
          ${cols.hasPhone ? '"phone",' : '\'\' as "phone",'}
          "role", 
          "status", 
          ${cols.hasIsActive ? '"isActive"' : 'true as "isActive"'}, 
          "createdAt", "updatedAt"
        FROM "User"
        WHERE 1=1
      `;
    } else {
      query = `
        SELECT 
          "id", "name", 
          ${cols.hasFirstName ? '"firstName",' : '\'\' as "firstName",'}
          ${cols.hasLastName ? '"lastName",' : '\'\' as "lastName",'}
          "email", 
          ${cols.hasPhone ? '"phone",' : '\'\' as "phone",'}
          "role", 
          'ACTIVE' as "status", 
          true as "isActive", 
          "createdAt", "updatedAt"
        FROM "User"
        WHERE 1=1
      `;
    }

    if (search && search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      const pIdx = params.length;
      query += ` AND (
        LOWER("name") LIKE $${pIdx} OR 
        LOWER("email") LIKE $${pIdx} OR 
        LOWER(COALESCE("phone", '')) LIKE $${pIdx}
      )`;
    }

    if (role && role !== 'ALL') {
      const normalizedRole = this.normalizeRole(role);
      params.push(normalizedRole);
      query += ` AND UPPER("role") = $${params.length}`;
    }

    if (cols.hasStatus && status && status !== 'ALL') {
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
    const cols = await this.getTableColumns();

    const query = `
      SELECT 
        "id", "name", 
        ${cols.hasFirstName ? '"firstName",' : '\'\' as "firstName",'}
        ${cols.hasLastName ? '"lastName",' : '\'\' as "lastName",'}
        "email", 
        ${cols.hasPhone ? '"phone",' : '\'\' as "phone",'}
        "role",
        ${cols.hasStatus ? '"status",' : '\'ACTIVE\' as "status",'}
        ${cols.hasIsActive ? '"isActive",' : 'true as "isActive",'}
        "createdAt", "updatedAt"
      FROM "User" 
      WHERE "id" = $1 
      LIMIT 1
    `;

    const result = await db.query(query, [id]);
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

    const cols = await this.getTableColumns();

    let insertQuery = '';
    let insertParams = [];

    if (cols.hasStatus && cols.hasIsActive) {
      insertQuery = `
        INSERT INTO "User" (
          "name", "firstName", "lastName", "email", "password", "phone", "role", "status", "isActive"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING "id", "name", "firstName", "lastName", "email", "phone", "role", "status", "isActive", "createdAt"
      `;
      insertParams = [
        trimmedFullName,
        firstName,
        lastName,
        normalizedEmail,
        hashedPassword,
        (phone || '').trim(),
        normalizedRole,
        normalizedStatus,
        isActive,
      ];
    } else if (cols.hasStatus) {
      insertQuery = `
        INSERT INTO "User" (
          "name", "firstName", "lastName", "email", "password", "phone", "role", "status"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING "id", "name", "firstName", "lastName", "email", "phone", "role", "status", "createdAt"
      `;
      insertParams = [
        trimmedFullName,
        firstName,
        lastName,
        normalizedEmail,
        hashedPassword,
        (phone || '').trim(),
        normalizedRole,
        normalizedStatus,
      ];
    } else {
      // Safe fallback: table does not have status column
      insertQuery = `
        INSERT INTO "User" (
          "name", "firstName", "lastName", "email", "password", "phone", "role"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING "id", "name", "firstName", "lastName", "email", "phone", "role", "createdAt"
      `;
      insertParams = [
        trimmedFullName,
        firstName,
        lastName,
        normalizedEmail,
        hashedPassword,
        (phone || '').trim(),
        normalizedRole,
      ];
    }

    const result = await db.query(insertQuery, insertParams);
    const created = result.rows[0];

    return {
      ...created,
      role: normalizedRole,
      status: created.status || normalizedStatus,
      isActive: created.isActive !== undefined ? created.isActive : isActive,
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

    const cols = await this.getTableColumns();

    let result;
    if (cols.hasStatus && cols.hasIsActive) {
      result = await db.query(
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
    } else if (cols.hasStatus) {
      result = await db.query(
        `UPDATE "User"
         SET "name" = $1,
             "firstName" = $2,
             "lastName" = $3,
             "email" = $4,
             "phone" = $5,
             "role" = $6,
             "status" = $7,
             "updatedAt" = CURRENT_TIMESTAMP
         WHERE "id" = $8
         RETURNING "id", "name", "firstName", "lastName", "email", "phone", "role", "status", "createdAt", "updatedAt"`,
        [
          trimmedFullName,
          firstName,
          lastName,
          normalizedEmail,
          updatedPhone,
          updatedRole,
          updatedStatus,
          id,
        ]
      );
    } else {
      result = await db.query(
        `UPDATE "User"
         SET "name" = $1,
             "firstName" = $2,
             "lastName" = $3,
             "email" = $4,
             "phone" = $5,
             "role" = $6,
             "updatedAt" = CURRENT_TIMESTAMP
         WHERE "id" = $7
         RETURNING "id", "name", "firstName", "lastName", "email", "phone", "role", "createdAt", "updatedAt"`,
        [
          trimmedFullName,
          firstName,
          lastName,
          normalizedEmail,
          updatedPhone,
          updatedRole,
          id,
        ]
      );
    }

    const updated = result.rows[0];
    return {
      ...updated,
      status: updated.status || updatedStatus,
      isActive: updated.isActive !== undefined ? updated.isActive : isActive,
    };
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
    const cols = await this.getTableColumns();

    if (cols.hasStatus) {
      const result = await db.query(
        `UPDATE "User"
         SET "status" = $1, ${cols.hasIsActive ? '"isActive" = $2,' : ''} "updatedAt" = CURRENT_TIMESTAMP
         WHERE "id" = $3
         RETURNING "id", "name", "email", "role", "status"`,
        cols.hasIsActive ? [newStatus, isNowActive, id] : [newStatus, id]
      );
      if (result.rows.length === 0) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
      }
      return {
        ...result.rows[0],
        isActive: isNowActive,
      };
    } else {
      const result = await db.query(
        `UPDATE "User"
         SET "updatedAt" = CURRENT_TIMESTAMP
         WHERE "id" = $1
         RETURNING "id", "name", "email", "role"`,
        [id]
      );
      if (result.rows.length === 0) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
      }
      return {
        ...result.rows[0],
        status: newStatus,
        isActive: isNowActive,
      };
    }
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
