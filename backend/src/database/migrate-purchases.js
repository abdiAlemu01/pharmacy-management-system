import { db } from './client.js';

async function migratePurchases() {
  try {
    console.log('🚀 Running database migration for complete Purchases system...');

    // 1. Ensure Purchase table has all required columns
    await db.query(`
      CREATE TABLE IF NOT EXISTS "Purchase" (
        "id" TEXT PRIMARY KEY,
        "purchaseOrderNo" TEXT,
        "invoiceNo" TEXT,
        "supplierId" TEXT NOT NULL REFERENCES "Supplier"("id") ON DELETE CASCADE,
        "orderDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        "subtotal" NUMERIC(10, 2) DEFAULT 0,
        "discount" NUMERIC(10, 2) DEFAULT 0,
        "additionalCharges" NUMERIC(10, 2) DEFAULT 0,
        "totalCost" NUMERIC(10, 2) NOT NULL DEFAULT 0,
        "amountPaid" NUMERIC(10, 2) DEFAULT 0,
        "amountDue" NUMERIC(10, 2) DEFAULT 0,
        "status" TEXT NOT NULL DEFAULT 'ORDERED',
        "paymentStatus" TEXT NOT NULL DEFAULT 'UNPAID',
        "receivedDate" TIMESTAMP(3),
        "receivingNotes" TEXT,
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
      ALTER TABLE "Purchase"
      ADD COLUMN IF NOT EXISTS "purchaseOrderNo" TEXT,
      ADD COLUMN IF NOT EXISTS "invoiceNo" TEXT,
      ADD COLUMN IF NOT EXISTS "orderDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN IF NOT EXISTS "subtotal" NUMERIC(10, 2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "discount" NUMERIC(10, 2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "additionalCharges" NUMERIC(10, 2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "amountPaid" NUMERIC(10, 2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "amountDue" NUMERIC(10, 2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT NOT NULL DEFAULT 'UNPAID',
      ADD COLUMN IF NOT EXISTS "receivedDate" TIMESTAMP(3),
      ADD COLUMN IF NOT EXISTS "receivingNotes" TEXT,
      ADD COLUMN IF NOT EXISTS "notes" TEXT;
    `);

    // 2. Ensure PurchaseItem table has quantityReceived, quantityRejected, rejectionReason
    await db.query(`
      CREATE TABLE IF NOT EXISTS "PurchaseItem" (
        "id" TEXT PRIMARY KEY,
        "purchaseId" TEXT NOT NULL REFERENCES "Purchase"("id") ON DELETE CASCADE,
        "medicineId" TEXT REFERENCES "Medicine"("id") ON DELETE SET NULL,
        "medicineName" TEXT NOT NULL,
        "batchNumber" TEXT,
        "quantity" INTEGER NOT NULL,
        "quantityReceived" INTEGER DEFAULT 0,
        "quantityRejected" INTEGER DEFAULT 0,
        "unitCost" NUMERIC(10, 2) NOT NULL,
        "totalCost" NUMERIC(10, 2) NOT NULL,
        "expiryDate" TIMESTAMP(3),
        "rejectionReason" TEXT
      );
    `);

    await db.query(`
      ALTER TABLE "PurchaseItem"
      ADD COLUMN IF NOT EXISTS "quantityReceived" INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "quantityRejected" INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;
    `);

    // 3. Create PurchasePayment table to log supplier payment installments
    await db.query(`
      CREATE TABLE IF NOT EXISTS "PurchasePayment" (
        "id" TEXT PRIMARY KEY,
        "purchaseId" TEXT NOT NULL REFERENCES "Purchase"("id") ON DELETE CASCADE,
        "amount" NUMERIC(10, 2) NOT NULL,
        "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "paymentMethod" TEXT NOT NULL DEFAULT 'CASH',
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Create PurchaseReturn table to record medicine returns to suppliers
    await db.query(`
      CREATE TABLE IF NOT EXISTS "PurchaseReturn" (
        "id" TEXT PRIMARY KEY,
        "purchaseId" TEXT NOT NULL REFERENCES "Purchase"("id") ON DELETE CASCADE,
        "purchaseItemId" TEXT REFERENCES "PurchaseItem"("id") ON DELETE SET NULL,
        "medicineId" TEXT REFERENCES "Medicine"("id") ON DELETE SET NULL,
        "medicineName" TEXT NOT NULL,
        "batchNumber" TEXT,
        "returnQuantity" INTEGER NOT NULL,
        "unitCost" NUMERIC(10, 2) NOT NULL DEFAULT 0,
        "totalAmount" NUMERIC(10, 2) NOT NULL DEFAULT 0,
        "returnReason" TEXT NOT NULL,
        "returnDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "refundStatus" TEXT NOT NULL DEFAULT 'CREDITED',
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Ensure indexes for high performance
    await db.query(`
      CREATE INDEX IF NOT EXISTS "idx_purchase_supplier" ON "Purchase"("supplierId");
      CREATE INDEX IF NOT EXISTS "idx_purchase_order_date" ON "Purchase"("orderDate");
      CREATE INDEX IF NOT EXISTS "idx_purchase_status" ON "Purchase"("status");
      CREATE INDEX IF NOT EXISTS "idx_purchase_payment_status" ON "Purchase"("paymentStatus");
      CREATE INDEX IF NOT EXISTS "idx_purchase_item_purchase" ON "PurchaseItem"("purchaseId");
      CREATE INDEX IF NOT EXISTS "idx_purchase_item_medicine" ON "PurchaseItem"("medicineId");
      CREATE INDEX IF NOT EXISTS "idx_purchase_payment_purchase" ON "PurchasePayment"("purchaseId");
      CREATE INDEX IF NOT EXISTS "idx_purchase_return_purchase" ON "PurchaseReturn"("purchaseId");
    `);

    // 6. Ensure default orderDate and subtotal for existing records
    await db.query(`
      UPDATE "Purchase"
      SET "orderDate" = "createdAt"
      WHERE "orderDate" IS NULL;

      UPDATE "Purchase"
      SET "subtotal" = "totalCost"
      WHERE "subtotal" IS NULL OR "subtotal" = 0;
    `);

    console.log('✅ Migration succeeded! Purchase, PurchaseItem, PurchasePayment, and PurchaseReturn tables are ready.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migratePurchases();

