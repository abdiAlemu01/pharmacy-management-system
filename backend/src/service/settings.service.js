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
          "currency", "currencySymbol", "dateFormat", "timeZone", "theme", 
          "defaultDashboardDateRange", "tableRowsPerPage"
        ) VALUES (
          'default', 'Pharmacy Care', 'Abdi Alemu', '+251 901 756 305', 'contact@pharmacycare.com', 'Bole Sub City, Addis Ababa, Ethiopia',
          '', 30, true, 10,
          true, 90, true,
          true, true, true,
          'ETB', 'Br', 'DD/MM/YYYY', 'Africa/Addis_Ababa', 'light',
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
   * 2. Update Pharmacy Information
   */
  async updatePharmacyInfo({ pharmacyName, ownerName, phone, email, address, logoUrl }) {
    await this.ensureDefaultSettings();

    const query = `
      UPDATE "PharmacySetting"
      SET 
        "pharmacyName" = $1,
        "ownerName" = $2,
        "phone" = $3,
        "email" = $4,
        "address" = $5,
        "logoUrl" = $6,
        "updatedAt" = NOW()
      WHERE id = 'default'
      RETURNING *;
    `;
    const res = await db.query(query, [
      pharmacyName.trim(),
      ownerName.trim(),
      phone.trim(),
      email.trim(),
      address.trim(),
      logoUrl || '',
    ]);

    return res.rows[0];
  }

  /**
   * 3. Update Account & Security profile
   */
  async updateAccountInfo(userId, { name, firstName, lastName, email, phone, sessionTimeout }) {
    // 1. Update user credentials in User table
    const normalizedEmail = email.toLowerCase().trim();

    // Check if new email is taken by someone else
    if (userId) {
      const emailCheck = await db.query(
        'SELECT id FROM "User" WHERE LOWER(email) = $1 AND id != $2',
        [normalizedEmail, userId]
      );
      if (emailCheck.rows.length > 0) {
        const error = new Error('This email address is already in use by another account');
        error.statusCode = 409;
        throw error;
      }

      let fullName = name?.trim();
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
          "email" = $4,
          "phone" = COALESCE($5, "phone"),
          "updatedAt" = NOW()
        WHERE id = $6
      `, [fullName, fName, lName, normalizedEmail, phone ? phone.trim() : null, userId]);
    }

    // 2. Update sessionTimeout in PharmacySetting if provided
    if (sessionTimeout !== undefined) {
      await db.query(`
        UPDATE "PharmacySetting"
        SET "sessionTimeout" = $1, "updatedAt" = NOW()
        WHERE id = 'default'
      `, [sessionTimeout]);
    }

    // Fetch updated user
    const updatedUserRes = await db.query(
      'SELECT "id", "name", "firstName", "lastName", "email", "phone", "role" FROM "User" WHERE id = $1',
      [userId]
    );

    return updatedUserRes.rows[0];
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
        "defaultDashboardDateRange" = COALESCE($6, "defaultDashboardDateRange"),
        "tableRowsPerPage" = COALESCE($7, "tableRowsPerPage"),
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
      data.defaultDashboardDateRange || null,
      data.tableRowsPerPage !== undefined ? data.tableRowsPerPage : null,
    ]);

    return res.rows[0];
  }
}

export const settingsService = new SettingsService();

