import { db } from './client.js';

export async function migrateSettings() {
  try {
    console.log('⚙️ Running database migration for Settings...');

    // 1. Create PharmacySetting table if it does not exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS "PharmacySetting" (
        "id" TEXT PRIMARY KEY DEFAULT 'default',
        "pharmacyName" TEXT NOT NULL DEFAULT 'Pharmacy Care',
        "ownerName" TEXT NOT NULL DEFAULT 'Abdi Alemu',
        "phone" TEXT NOT NULL DEFAULT '+251 901 756 305',
        "email" TEXT NOT NULL DEFAULT 'contact@pharmacycare.com',
        "address" TEXT NOT NULL DEFAULT 'Bole Sub City, Addis Ababa, Ethiopia',
        "logoUrl" TEXT DEFAULT '',
        "sessionTimeout" INTEGER NOT NULL DEFAULT 30,
        "lowStockAlerts" BOOLEAN NOT NULL DEFAULT true,
        "lowStockThreshold" INTEGER NOT NULL DEFAULT 10,
        "nearingExpiryAlerts" BOOLEAN NOT NULL DEFAULT true,
        "expiryThresholdDays" INTEGER NOT NULL DEFAULT 90,
        "expiredAlerts" BOOLEAN NOT NULL DEFAULT true,
        "supplierPaymentDueReminders" BOOLEAN NOT NULL DEFAULT true,
        "pendingPurchaseAlerts" BOOLEAN NOT NULL DEFAULT true,
        "inAppNotifications" BOOLEAN NOT NULL DEFAULT true,
        "currency" TEXT NOT NULL DEFAULT 'ETB',
        "currencySymbol" TEXT NOT NULL DEFAULT 'Br',
        "dateFormat" TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
        "timeZone" TEXT NOT NULL DEFAULT 'Africa/Addis_Ababa',
        "theme" TEXT NOT NULL DEFAULT 'light',
        "defaultDashboardDateRange" TEXT NOT NULL DEFAULT 'month',
        "tableRowsPerPage" INTEGER NOT NULL DEFAULT 10,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Ensure columns exist if table was already created
    await db.query(`
      ALTER TABLE "PharmacySetting"
      ADD COLUMN IF NOT EXISTS "pharmacyName" TEXT NOT NULL DEFAULT 'Pharmacy Care',
      ADD COLUMN IF NOT EXISTS "ownerName" TEXT NOT NULL DEFAULT 'Abdi Alemu',
      ADD COLUMN IF NOT EXISTS "phone" TEXT NOT NULL DEFAULT '+251 901 756 305',
      ADD COLUMN IF NOT EXISTS "email" TEXT NOT NULL DEFAULT 'contact@pharmacycare.com',
      ADD COLUMN IF NOT EXISTS "address" TEXT NOT NULL DEFAULT 'Bole Sub City, Addis Ababa, Ethiopia',
      ADD COLUMN IF NOT EXISTS "logoUrl" TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS "sessionTimeout" INTEGER NOT NULL DEFAULT 30,
      ADD COLUMN IF NOT EXISTS "lowStockAlerts" BOOLEAN NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS "lowStockThreshold" INTEGER NOT NULL DEFAULT 10,
      ADD COLUMN IF NOT EXISTS "nearingExpiryAlerts" BOOLEAN NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS "expiryThresholdDays" INTEGER NOT NULL DEFAULT 90,
      ADD COLUMN IF NOT EXISTS "expiredAlerts" BOOLEAN NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS "supplierPaymentDueReminders" BOOLEAN NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS "pendingPurchaseAlerts" BOOLEAN NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS "inAppNotifications" BOOLEAN NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'ETB',
      ADD COLUMN IF NOT EXISTS "currencySymbol" TEXT NOT NULL DEFAULT 'Br',
      ADD COLUMN IF NOT EXISTS "dateFormat" TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
      ADD COLUMN IF NOT EXISTS "timeZone" TEXT NOT NULL DEFAULT 'Africa/Addis_Ababa',
      ADD COLUMN IF NOT EXISTS "theme" TEXT NOT NULL DEFAULT 'light',
      ADD COLUMN IF NOT EXISTS "defaultDashboardDateRange" TEXT NOT NULL DEFAULT 'month',
      ADD COLUMN IF NOT EXISTS "tableRowsPerPage" INTEGER NOT NULL DEFAULT 10;
    `);

    // 3. Seed default record if none exists
    const existing = await db.query('SELECT id FROM "PharmacySetting" WHERE id = $1', ['default']);
    if (existing.rows.length === 0) {
      await db.query(`
        INSERT INTO "PharmacySetting" ("id", "pharmacyName", "ownerName", "phone", "email", "address", "currency", "currencySymbol")
        VALUES ('default', 'Pharmacy Care', 'Abdi Alemu', '+251 901 756 305', 'contact@pharmacycare.com', 'Bole Sub City, Addis Ababa, Ethiopia', 'ETB', 'Br');
      `);
      console.log('✅ Default PharmacySetting seeded successfully.');
    } else {
      console.log('ℹ️ PharmacySetting default row already exists.');
    }

    console.log('✅ Settings migration completed successfully.');
  } catch (error) {
    console.error('❌ Settings migration failed:', error.message);
    throw error;
  }
}

// Allow standalone execution
if (process.argv[1]?.endsWith('migrate-settings.js')) {
  migrateSettings()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

