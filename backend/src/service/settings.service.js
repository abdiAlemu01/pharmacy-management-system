import bcrypt from 'bcryptjs';
import { db } from '../database/client.js';

export class SettingsService {
  /**
   * Helper: Ensure default PharmacySetting row exists
   */
  async ensureDefaultSettings() {
    const res = await db.query('SELECT * FROM "PharmacySetting" WHERE id = $1', ['default']);
    if (res.rows.length === 0) {
      const inserted = await db.query(`
        INSERT INTO "PharmacySetting" (
          "id", "pharmacyName", "ownerName", "phone", "email", "address", 
          "logoUrl", "sessionTimeout", "lowStockAlerts", "lowStockThreshold", 
          "nearingExpiryAlerts", "expiryThresholdDays", "expiredAlerts", 
          "supplierPaymentDueReminders", "pendingPurchaseAlerts", "inAppNotifications", 
          "currency", "currencySymbol", "dateFormat", "timeZone", "theme", "language",
          "defaultDashboardDateRange", "tableRowsPerPage"
        ) VALUES (
          'default', 'Pharmacy Care', 'Abdi Alemu', '+251 901 756 305', 'contact@pharmacycare.com', 'Bole Sub City, Addis Ababa, Ethiopia',
          '', 30, true, 10,
          true, 90, true,
          true, true, true,
          'ETB', 'Br', 'DD/MM/YYYY', 'Africa/Addis_Ababa', 'light', 'en',
          'month', 10
        ) RETURNING *;
      `);
      return inserted.rows[0];
    }
    return res.rows[0];
  }

  /**
   * 1. Get all settings and active user profile
   */
  async getSettings(userId) {
    const settings = await this.ensureDefaultSettings();

    let user = null;
    if (userId) {
      const userRes = await db.query(
        'SELECT "id", "name", "firstName", "lastName", "email", "phone", "role" FROM "User" WHERE id = $1',
        [userId]
      );
      user = userRes.rows[0] || null;
    }

    // Ensure consistent owner name and phone across settings and user
    if (user) {
      if (user.name && !settings.ownerName) {
        settings.ownerName = user.name;
      } else if (settings.ownerName && !user.name) {
        user.name = settings.ownerName;
      }
      if (user.phone && !settings.phone) {
        settings.phone = user.phone;
      } else if (settings.phone && !user.phone) {
        user.phone = settings.phone;
      }
    }

    // Calculate real-time alert metrics for Notifications & Alerts tab
    const alertMetrics = await this.getAlertMetrics(settings);

    return {
      settings,
      user,
      alertMetrics,
    };
  }

  /**
   * Real-time alert counts based on current pharmacy data
   */
  async getAlertMetrics(settings) {
    try {
      const lowStockThresh = settings?.lowStockThreshold || 10;
      const expiryDays = settings?.expiryThresholdDays || 90;

      // 1. Low stock count: Medicines whose sum of batch quantities <= threshold
      const lowStockRes = await db.query(`
        SELECT COUNT(*)::int as count
        FROM "Medicine" m
        LEFT JOIN (
          SELECT "medicineId", SUM(quantity) as "totalStock"
          FROM "Batch"
          GROUP BY "medicineId"
        ) b ON b."medicineId" = m.id
        WHERE COALESCE(b."totalStock", 0) <= $1
      `, [lowStockThresh]);

      // 2. Nearing expiry batches: expiryDate BETWEEN NOW() AND NOW() + interval
      const nearingExpiryRes = await db.query(`
        SELECT COUNT(*)::int as count
        FROM "Batch"
        WHERE "expiryDate" > NOW() 
          AND "expiryDate" <= NOW() + ($1 || ' days')::INTERVAL
          AND quantity > 0
      `, [expiryDays]);

      // 3. Expired batches: expiryDate <= NOW() with quantity > 0
      const expiredRes = await db.query(`
        SELECT COUNT(*)::int as count
        FROM "Batch"
        WHERE "expiryDate" <= NOW() AND quantity > 0
      `);

      // 4. Supplier payments due: Purchases with paymentStatus in ('UNPAID', 'PARTIAL')
      const paymentDueRes = await db.query(`
        SELECT COUNT(*)::int as count, COALESCE(SUM("amountDue"), 0)::numeric as total
        FROM "Purchase"
        WHERE "paymentStatus" IN ('UNPAID', 'PARTIAL')
      `);

      // 5. Pending purchase orders: Purchases with status = 'ORDERED' or 'PENDING'
      const pendingPoRes = await db.query(`
        SELECT COUNT(*)::int as count
        FROM "Purchase"
        WHERE status IN ('ORDERED', 'PENDING')
      `);

      return {
        lowStockCount: lowStockRes.rows[0]?.count || 0,
        nearingExpiryCount: nearingExpiryRes.rows[0]?.count || 0,
        expiredCount: expiredRes.rows[0]?.count || 0,
        paymentDueCount: paymentDueRes.rows[0]?.count || 0,
        paymentDueTotal: paymentDueRes.rows[0]?.total || 0,
        pendingPoCount: pendingPoRes.rows[0]?.count || 0,
      };
    } catch (err) {
      console.warn('Could not compute alert metrics:', err.message);
      return {
        lowStockCount: 0,
        nearingExpiryCount: 0,
        expiredCount: 0,
        paymentDueCount: 0,
        paymentDueTotal: 0,
        pendingPoCount: 0,
      };
    }
  }

  /**
   * 2. Update Pharmacy Information (and sync ownerName & phone to User profile)
   */
  async updatePharmacyInfo(userId, { pharmacyName, ownerName, phone, email, address, logoUrl }) {
    await this.ensureDefaultSettings();

    const trimmedOwnerName = ownerName?.trim();
    const trimmedPhone = phone?.trim();

    const query = `
      UPDATE "PharmacySetting"
      SET 
        "pharmacyName" = $1,
        "ownerName" = $2,
        "phone" = $3,
        "email" = COALESCE($4, "email"),
        "address" = $5,
        "logoUrl" = $6,
        "updatedAt" = NOW()
      WHERE id = 'default'
      RETURNING *;
    `;
    const res = await db.query(query, [
      pharmacyName.trim(),
      trimmedOwnerName,
      trimmedPhone,
      email ? email.trim() : null,
      address.trim(),
      logoUrl || '',
    ]);

    const updatedSettings = res.rows[0];

    // Automatically sync ownerName and phone to the User table for full consistency
    let updatedUser = null;
    if (userId) {
      let fName = null;
      let lName = null;
      if (trimmedOwnerName) {
        const parts = trimmedOwnerName.split(' ');
        fName = parts[0] || '';
        lName = parts.slice(1).join(' ') || '';
      }

      await db.query(`
        UPDATE "User"
        SET 
          "name" = COALESCE($1, "name"),
          "firstName" = COALESCE($2, "firstName"),
          "lastName" = COALESCE($3, "lastName"),
          "phone" = COALESCE($4, "phone"),
          "updatedAt" = NOW()
        WHERE id = $5
      `, [trimmedOwnerName || null, fName, lName, trimmedPhone || null, userId]);

      const userRes = await db.query(
        'SELECT "id", "name", "firstName", "lastName", "email", "phone", "role" FROM "User" WHERE id = $1',
        [userId]
      );
      updatedUser = userRes.rows[0] || null;
    }

    return {
      settings: updatedSettings,
      user: updatedUser,
    };
  }

  /**
   * 3. Update Account & Security profile (and sync name & phone to PharmacySetting)
   */
  async updateAccountInfo(userId, { name, firstName, lastName, email, phone, sessionTimeout }) {
    const normalizedEmail = email ? email.toLowerCase().trim() : null;
    const trimmedName = name?.trim();
    const trimmedPhone = phone?.trim();

    let updatedUser = null;

    if (userId) {
      // Check if new email is taken by someone else (only if changing email)
      if (normalizedEmail) {
        const emailCheck = await db.query(
          'SELECT id FROM "User" WHERE LOWER(email) = $1 AND id != $2',
          [normalizedEmail, userId]
        );
        if (emailCheck.rows.length > 0) {
          const error = new Error('This email address is already in use by another account');
          error.statusCode = 409;
          throw error;
        }
      }

      let fullName = trimmedName;
      let fName = firstName?.trim();
      let lName = lastName?.trim();

      if (!fullName && (fName || lName)) {
        fullName = `${fName || ''} ${lName || ''}`.trim();
      } else if (fullName && (!fName || !lName)) {
        const parts = fullName.split(' ');
        fName = parts[0] || '';
        lName = parts.slice(1).join(' ') || '';
      }

      await db.query(`
        UPDATE "User"
        SET 
          "name" = COALESCE($1, "name"),
          "firstName" = COALESCE($2, "firstName"),
          "lastName" = COALESCE($3, "lastName"),
          "email" = COALESCE($4, "email"),
          "phone" = COALESCE($5, "phone"),
          "updatedAt" = NOW()
        WHERE id = $6
      `, [fullName || null, fName || null, lName || null, normalizedEmail || null, trimmedPhone || null, userId]);

      const updatedUserRes = await db.query(
        'SELECT "id", "name", "firstName", "lastName", "email", "phone", "role" FROM "User" WHERE id = $1',
        [userId]
      );
      updatedUser = updatedUserRes.rows[0];
    }

    // Automatically sync ownerName, phone, and sessionTimeout into PharmacySetting table
    const settingsUpdateRes = await db.query(`
      UPDATE "PharmacySetting"
      SET 
        "ownerName" = COALESCE($1, "ownerName"),
        "phone" = COALESCE($2, "phone"),
        "sessionTimeout" = COALESCE($3, "sessionTimeout"),
        "updatedAt" = NOW()
      WHERE id = 'default'
      RETURNING *;
    `, [
      trimmedName || null,
      trimmedPhone || null,
      sessionTimeout !== undefined ? sessionTimeout : null,
    ]);

    const updatedSettings = settingsUpdateRes.rows[0];

    return {
      settings: updatedSettings,
      user: updatedUser,
    };
  }

  /**
   * 4. Change Password with Current Password Verification
   */
  async changePassword(userId, { currentPassword, newPassword }) {
    if (!userId) {
      const error = new Error('User authentication required');
      error.statusCode = 401;
      throw error;
    }

    // 1. Fetch user with existing password
    const userRes = await db.query('SELECT id, password FROM "User" WHERE id = $1', [userId]);
    if (userRes.rows.length === 0) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const user = userRes.rows[0];

    // 2. Verify current password
    const isCurrentValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentValid) {
      const error = new Error('Current password verification failed. Please enter your correct current password.');
      error.statusCode = 400;
      throw error;
    }

    // 3. Prevent using identical password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      const error = new Error('New password must be different from current password');
      error.statusCode = 400;
      throw error;
    }

    // 4. Hash new password and update
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.query(`
      UPDATE "User"
      SET "password" = $1, "updatedAt" = NOW()
      WHERE id = $2
    `, [hashedPassword, userId]);

    return { success: true, message: 'Password has been updated successfully.' };
  }

  /**
   * 5. Update Notifications & Alerts preferences
   */
  async updateNotifications(data) {
    await this.ensureDefaultSettings();

    const query = `
      UPDATE "PharmacySetting"
      SET 
        "lowStockAlerts" = COALESCE($1, "lowStockAlerts"),
        "lowStockThreshold" = COALESCE($2, "lowStockThreshold"),
        "nearingExpiryAlerts" = COALESCE($3, "nearingExpiryAlerts"),
        "expiryThresholdDays" = COALESCE($4, "expiryThresholdDays"),
        "expiredAlerts" = COALESCE($5, "expiredAlerts"),
        "supplierPaymentDueReminders" = COALESCE($6, "supplierPaymentDueReminders"),
        "pendingPurchaseAlerts" = COALESCE($7, "pendingPurchaseAlerts"),
        "inAppNotifications" = COALESCE($8, "inAppNotifications"),
        "updatedAt" = NOW()
      WHERE id = 'default'
      RETURNING *;
    `;

    const res = await db.query(query, [
      data.lowStockAlerts !== undefined ? data.lowStockAlerts : null,
      data.lowStockThreshold !== undefined ? data.lowStockThreshold : null,
      data.nearingExpiryAlerts !== undefined ? data.nearingExpiryAlerts : null,
      data.expiryThresholdDays !== undefined ? data.expiryThresholdDays : null,
      data.expiredAlerts !== undefined ? data.expiredAlerts : null,
      data.supplierPaymentDueReminders !== undefined ? data.supplierPaymentDueReminders : null,
      data.pendingPurchaseAlerts !== undefined ? data.pendingPurchaseAlerts : null,
      data.inAppNotifications !== undefined ? data.inAppNotifications : null,
    ]);

    return res.rows[0];
  }

  /**
   * 6. Update General Preferences
   */
  async updateGeneralPreferences(data) {
    await this.ensureDefaultSettings();

    const query = `
      UPDATE "PharmacySetting"
      SET 
        "currency" = COALESCE($1, "currency"),
        "currencySymbol" = COALESCE($2, "currencySymbol"),
        "dateFormat" = COALESCE($3, "dateFormat"),
        "timeZone" = COALESCE($4, "timeZone"),
        "theme" = COALESCE($5, "theme"),
        "language" = COALESCE($6, "language"),
        "defaultDashboardDateRange" = COALESCE($7, "defaultDashboardDateRange"),
        "tableRowsPerPage" = COALESCE($8, "tableRowsPerPage"),
        "updatedAt" = NOW()
      WHERE id = 'default'
      RETURNING *;
    `;

    const res = await db.query(query, [
      data.currency || null,
      data.currencySymbol || null,
      data.dateFormat || null,
      data.timeZone || null,
      data.theme || null,
      data.language || null,
      data.defaultDashboardDateRange || null,
      data.tableRowsPerPage !== undefined ? data.tableRowsPerPage : null,
    ]);

    return res.rows[0];
  }
}

export const settingsService = new SettingsService();

