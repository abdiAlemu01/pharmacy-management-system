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
          "currency", "currencySymbol", "dateFormat", "timeZone", "calendarType", "theme", "language",
          "defaultDashboardDateRange", "tableRowsPerPage"
        ) VALUES (
          'default', 'Pharmacy Care', 'Abdi Alemu', '+251 901 756 305', 'contact@pharmacycare.com', 'Bole Sub City, Addis Ababa, Ethiopia',
          '', 30, true, 10,
          true, 90, true,
          true, true, true,
          'ETB', 'Br', 'DD/MM/YYYY', 'Africa/Addis_Ababa', 'ethiopian', 'light', 'en',
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

      // 1. Low stock count: Real medicines whose available stock <= threshold
      const lowStockTotalRes = await db.query(`
        SELECT COUNT(*)::int as count
        FROM "Medicine"
        WHERE COALESCE(quantity, 0) <= $1
      `, [lowStockThresh]);

      const lowStockItemsRes = await db.query(`
        SELECT id, name, quantity, "reorderLevel"
        FROM "Medicine"
        WHERE COALESCE(quantity, 0) <= $1
        ORDER BY quantity ASC
        LIMIT 10
      `, [lowStockThresh]);

      // 2. Nearing expiry batches: Real in-stock batches expiring within threshold days
      const nearingExpiryTotalRes = await db.query(`
        SELECT COUNT(*)::int as count
        FROM "Batch"
        WHERE "expiryDate" > NOW() 
          AND "expiryDate" <= NOW() + ($1 || ' days')::INTERVAL
          AND quantity > 0
      `, [expiryDays]);

      const nearingExpiryItemsRes = await db.query(`
        SELECT b.id, b."batchNo", b.quantity, b."expiryDate", COALESCE(m.name, 'Medicine') as "medicineName"
        FROM "Batch" b
        LEFT JOIN "Medicine" m ON m.id = b."medicineId"
        WHERE b."expiryDate" > NOW() 
          AND b."expiryDate" <= NOW() + ($1 || ' days')::INTERVAL
          AND b.quantity > 0
        ORDER BY b."expiryDate" ASC
        LIMIT 10
      `, [expiryDays]);

      // 3. Expired batches: Real in-stock batches with expiryDate <= NOW()
      const expiredTotalRes = await db.query(`
        SELECT COUNT(*)::int as count
        FROM "Batch"
        WHERE "expiryDate" <= NOW() AND quantity > 0
      `);

      const expiredItemsRes = await db.query(`
        SELECT b.id, b."batchNo", b.quantity, b."expiryDate", COALESCE(m.name, 'Medicine') as "medicineName"
        FROM "Batch" b
        LEFT JOIN "Medicine" m ON m.id = b."medicineId"
        WHERE b."expiryDate" <= NOW() AND b.quantity > 0
        ORDER BY b."expiryDate" DESC
        LIMIT 10
      `);

      // 4. Supplier payments due: Real purchases with UNPAID or PARTIAL status
      const paymentDueTotalRes = await db.query(`
        SELECT COUNT(*)::int as count, COALESCE(SUM("amountDue"), 0)::numeric as total
        FROM "Purchase"
        WHERE "paymentStatus" IN ('UNPAID', 'PARTIAL')
      `);

      const paymentDueItemsRes = await db.query(`
        SELECT p.id, p."purchaseOrderNo", p."amountDue", p."totalCost", p."paymentStatus", s.name as "supplierName",
               COALESCE(string_agg(DISTINCT COALESCE(NULLIF(pi."medicineName", ''), m.name), ', '), '') as "medicineName"
        FROM "Purchase" p
        LEFT JOIN "Supplier" s ON s.id = p."supplierId"
        LEFT JOIN "PurchaseItem" pi ON pi."purchaseId" = p.id
        LEFT JOIN "Medicine" m ON m.id = pi."medicineId"
        WHERE p."paymentStatus" IN ('UNPAID', 'PARTIAL')
        GROUP BY p.id, p."purchaseOrderNo", p."amountDue", p."totalCost", p."paymentStatus", s.name, p."createdAt"
        ORDER BY p."createdAt" DESC
        LIMIT 10
      `);

      // 5. Pending purchase orders: Real purchases with ORDERED or PENDING status
      const pendingPoTotalRes = await db.query(`
        SELECT COUNT(*)::int as count
        FROM "Purchase"
        WHERE status IN ('ORDERED', 'PENDING')
      `);

      const pendingPoItemsRes = await db.query(`
        SELECT p.id, p."purchaseOrderNo", p."totalCost", p.status, s.name as "supplierName",
               COALESCE(string_agg(DISTINCT COALESCE(NULLIF(pi."medicineName", ''), m.name), ', '), '') as "medicineName"
        FROM "Purchase" p
        LEFT JOIN "Supplier" s ON s.id = p."supplierId"
        LEFT JOIN "PurchaseItem" pi ON pi."purchaseId" = p.id
        LEFT JOIN "Medicine" m ON m.id = pi."medicineId"
        WHERE p.status IN ('ORDERED', 'PENDING')
        GROUP BY p.id, p."purchaseOrderNo", p."totalCost", p.status, s.name, p."createdAt"
        ORDER BY p."createdAt" DESC
        LIMIT 10
      `);

      return {
        lowStockCount: lowStockTotalRes.rows[0]?.count || 0,
        lowStockItems: lowStockItemsRes.rows || [],
        nearingExpiryCount: nearingExpiryTotalRes.rows[0]?.count || 0,
        nearingExpiryItems: nearingExpiryItemsRes.rows || [],
        expiredCount: expiredTotalRes.rows[0]?.count || 0,
        expiredItems: expiredItemsRes.rows || [],
        paymentDueCount: paymentDueTotalRes.rows[0]?.count || 0,
        paymentDueTotal: paymentDueTotalRes.rows[0]?.total || 0,
        paymentDueItems: paymentDueItemsRes.rows || [],
        pendingPoCount: pendingPoTotalRes.rows[0]?.count || 0,
        pendingPoItems: pendingPoItemsRes.rows || [],
      };
    } catch (err) {
      console.warn('Could not compute alert metrics:', err.message);
      return {
        lowStockCount: 0,
        lowStockItems: [],
        nearingExpiryCount: 0,
        nearingExpiryItems: [],
        expiredCount: 0,
        expiredItems: [],
        paymentDueCount: 0,
        paymentDueTotal: 0,
        paymentDueItems: [],
        pendingPoCount: 0,
        pendingPoItems: [],
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

    const updatedSettings = res.rows[0];
    const alertMetrics = await this.getAlertMetrics(updatedSettings);

    return {
      settings: updatedSettings,
      alertMetrics,
    };
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
        "calendarType" = COALESCE($9, "calendarType"),
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
      data.calendarType || null,
    ]);

    return res.rows[0];
  }
}

export const settingsService = new SettingsService();

