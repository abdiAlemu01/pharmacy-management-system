import { db } from './client.js';

async function migrate() {
  try {
    console.log('Starting migration for Supplier & Purchase management tables...');

    // 1. Ensure all rich Supplier columns exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS "Supplier" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "contactPerson" TEXT,
        "email" TEXT,
        "phone" TEXT NOT NULL,
        "address" TEXT,
        "stockSupplied" TEXT,
        "status" TEXT NOT NULL DEFAULT 'ACTIVE',
        "taxNumber" TEXT,
        "paymentTerms" TEXT DEFAULT 'Net 30',
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
      ALTER TABLE "Supplier"
      ADD COLUMN IF NOT EXISTS "contactPerson" TEXT,
      ADD COLUMN IF NOT EXISTS "email" TEXT,
      ADD COLUMN IF NOT EXISTS "address" TEXT,
      ADD COLUMN IF NOT EXISTS "stockSupplied" TEXT,
      ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'ACTIVE',
      ADD COLUMN IF NOT EXISTS "taxNumber" TEXT,
      ADD COLUMN IF NOT EXISTS "paymentTerms" TEXT DEFAULT 'Net 30',
      ADD COLUMN IF NOT EXISTS "notes" TEXT,
      ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    `);

    // 2. Ensure Purchase table exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS "Purchase" (
        "id" TEXT PRIMARY KEY,
        "purchaseOrderNo" TEXT,
        "invoiceNo" TEXT,
        "supplierId" TEXT NOT NULL REFERENCES "Supplier"("id") ON DELETE CASCADE,
        "totalCost" NUMERIC(10, 2) NOT NULL DEFAULT 0,
        "status" TEXT NOT NULL DEFAULT 'RECEIVED',
        "paymentStatus" TEXT NOT NULL DEFAULT 'PAID',
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
      ALTER TABLE "Purchase"
      ADD COLUMN IF NOT EXISTS "purchaseOrderNo" TEXT,
      ADD COLUMN IF NOT EXISTS "invoiceNo" TEXT,
      ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT NOT NULL DEFAULT 'PAID',
      ADD COLUMN IF NOT EXISTS "amountPaid" NUMERIC(10, 2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "amountDue" NUMERIC(10, 2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "notes" TEXT,
      ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    `);

    // Backfill amountPaid and amountDue for any existing purchases
    await db.query(`
      UPDATE "Purchase"
      SET 
        "amountPaid" = CASE WHEN "paymentStatus" = 'PAID' THEN "totalCost" ELSE COALESCE("amountPaid", 0) END,
        "amountDue" = CASE WHEN "paymentStatus" = 'PAID' THEN 0 ELSE COALESCE("amountDue", "totalCost") END
      WHERE "amountPaid" IS NULL OR "amountDue" IS NULL;
    `);

    // 3. Ensure PurchaseItem table exists so purchase history shows item details
    await db.query(`
      CREATE TABLE IF NOT EXISTS "PurchaseItem" (
        "id" TEXT PRIMARY KEY,
        "purchaseId" TEXT NOT NULL REFERENCES "Purchase"("id") ON DELETE CASCADE,
        "medicineId" TEXT REFERENCES "Medicine"("id") ON DELETE SET NULL,
        "medicineName" TEXT NOT NULL,
        "batchNumber" TEXT,
        "quantity" INTEGER NOT NULL,
        "unitCost" NUMERIC(10, 2) NOT NULL,
        "totalCost" NUMERIC(10, 2) NOT NULL,
        "expiryDate" TIMESTAMP(3)
      );
    `);

    console.log('✅ Supplier, Purchase, and PurchaseItem tables and schema verified.');
    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
