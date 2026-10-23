


CREATE TABLE IF NOT EXISTS "User" (
  "id"        TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  "email"     TEXT NOT NULL UNIQUE,
  "password"  TEXT NOT NULL,
  "name"      TEXT NOT NULL,
  "firstName" TEXT,
  "lastName"  TEXT,
  "phone"     TEXT,
  "role"      TEXT NOT NULL DEFAULT 'ADMIN',
  "status"    TEXT NOT NULL DEFAULT 'ACTIVE',
  "isActive"  BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS "Category" (
  "id"          TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  "name"        TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "createdAt"   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS "Medicine" (
  "id"               TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  "name"             TEXT NOT NULL,
  "genericName"      TEXT,
  "barcode"          TEXT UNIQUE,
  "categoryId"       TEXT REFERENCES "Category"("id"),
  "price"            NUMERIC(10,2),
  "quantity"         INTEGER NOT NULL DEFAULT 0,
  "purchaseCost"     NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  "sellingPrice"     NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  "reorderLevel"     INTEGER NOT NULL DEFAULT 10,
  "targetStockLevel" INTEGER NOT NULL DEFAULT 50,
  "purchaseDate"     DATE DEFAULT CURRENT_DATE,
  "expiryDate"       TIMESTAMPTZ,
  "createdAt"        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Batch table
CREATE TABLE IF NOT EXISTS "Batch" (
  "id"              TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  "batchNo"         TEXT NOT NULL UNIQUE,
  "medicineId"      TEXT NOT NULL REFERENCES "Medicine"("id"),
  "quantity"        INTEGER NOT NULL,
  "initialQuantity" INTEGER NOT NULL DEFAULT 0,
  "expiryDate"      TIMESTAMP NOT NULL,
  "purchaseCost"    NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  "supplierId"      TEXT,
  "supplierName"    TEXT,
  "status"          TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt"       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Supplier table
CREATE TABLE IF NOT EXISTS "Supplier" (
  "id"            TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  "name"          TEXT NOT NULL,
  "email"         TEXT,
  "phone"         TEXT NOT NULL,
  "address"       TEXT,
  "contactPerson" TEXT,
  "stockSupplied" TEXT,
  "status"        TEXT NOT NULL DEFAULT 'ACTIVE',
  "taxNumber"     TEXT,
  "paymentTerms"  TEXT NOT NULL DEFAULT 'Net 30',
  "notes"         TEXT,
  "createdAt"     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Purchase table
CREATE TABLE IF NOT EXISTS "Purchase" (
  "id"               TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  "supplierId"       TEXT REFERENCES "Supplier"("id"),
  "totalCost"        NUMERIC(10,2) NOT NULL DEFAULT 0,
  "status"           TEXT NOT NULL DEFAULT 'PENDING',
  "paymentStatus"    TEXT NOT NULL DEFAULT 'PAID',
  "purchaseOrderNo"  TEXT,
  "invoiceNo"        TEXT,
  "notes"            TEXT,
  "amountPaid"       NUMERIC(10,2) DEFAULT 0,
  "amountDue"        NUMERIC(10,2) DEFAULT 0,
  "subtotal"         NUMERIC(10,2) DEFAULT 0,
  "discount"         NUMERIC(10,2) DEFAULT 0,
  "additionalCharges" NUMERIC(10,2) DEFAULT 0,
  "orderDate"        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "receivedDate"     TIMESTAMP,
  "receivingNotes"   TEXT,
  "createdAt"        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. PurchaseItem table
CREATE TABLE IF NOT EXISTS "PurchaseItem" (
  "id"               TEXT PRIMARY KEY,
  "purchaseId"       TEXT NOT NULL REFERENCES "Purchase"("id"),
  "medicineId"       TEXT REFERENCES "Medicine"("id"),
  "medicineName"     TEXT NOT NULL,
  "batchNumber"      TEXT,
  "quantity"         INTEGER NOT NULL,
  "quantityReceived" INTEGER DEFAULT 0,
  "quantityRejected" INTEGER DEFAULT 0,
  "rejectionReason"  TEXT,
  "unitCost"         NUMERIC(10,2) NOT NULL,
  "totalCost"        NUMERIC(10,2) NOT NULL,
  "expiryDate"       TIMESTAMP
);

-- 8. PurchasePayment table
CREATE TABLE IF NOT EXISTS "PurchasePayment" (
  "id"            TEXT PRIMARY KEY,
  "purchaseId"    TEXT NOT NULL REFERENCES "Purchase"("id"),
  "amount"        NUMERIC(10,2) NOT NULL,
  "paymentDate"   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "paymentMethod" TEXT NOT NULL DEFAULT 'CASH',
  "notes"         TEXT,
  "createdAt"     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. PurchaseReturn table
CREATE TABLE IF NOT EXISTS "PurchaseReturn" (
  "id"             TEXT PRIMARY KEY,
  "purchaseId"     TEXT REFERENCES "Purchase"("id"),
  "purchaseItemId" TEXT REFERENCES "PurchaseItem"("id"),
  "medicineId"     TEXT REFERENCES "Medicine"("id"),
  "medicineName"   TEXT NOT NULL,
  "batchNumber"    TEXT,
  "returnQuantity" INTEGER NOT NULL,
  "unitCost"       NUMERIC(10,2) NOT NULL DEFAULT 0,
  "totalAmount"    NUMERIC(10,2) NOT NULL DEFAULT 0,
  "returnReason"   TEXT NOT NULL,
  "returnDate"     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "refundStatus"   TEXT NOT NULL DEFAULT 'CREDITED',
  "notes"          TEXT,
  "createdAt"      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 10. Patient table
CREATE TABLE IF NOT EXISTS "Patient" (
  "id"        TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  "name"      TEXT NOT NULL,
  "phone"     TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 11. Prescription table
CREATE TABLE IF NOT EXISTS "Prescription" (
  "id"        TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  "patientId" TEXT REFERENCES "Patient"("id"),
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 12. Sale table
CREATE TABLE IF NOT EXISTS "Sale" (
  "id"        TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  "userId"    TEXT NOT NULL REFERENCES "User"("id"),
  "patientId" TEXT REFERENCES "Patient"("id"),
  "total"     NUMERIC(10,2) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 13. SaleItem table
CREATE TABLE IF NOT EXISTS "SaleItem" (
  "id"           TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  "saleId"       TEXT NOT NULL REFERENCES "Sale"("id"),
  "medicineId"   TEXT NOT NULL REFERENCES "Medicine"("id"),
  "quantity"     INTEGER NOT NULL,
  "unitPrice"    NUMERIC(10,2) NOT NULL,
  "purchaseCost" NUMERIC(10,2) DEFAULT 0
);

-- 14. InventoryTransaction table
CREATE TABLE IF NOT EXISTS "InventoryTransaction" (
  "id"               TEXT PRIMARY KEY,
  "type"             TEXT NOT NULL,
  "medicineId"       TEXT NOT NULL REFERENCES "Medicine"("id"),
  "batchId"          TEXT REFERENCES "Batch"("id"),
  "batchNo"          TEXT,
  "quantity"         INTEGER NOT NULL,
  "previousQuantity" INTEGER,
  "newQuantity"      INTEGER,
  "reason"           TEXT,
  "purchaseCost"     NUMERIC(10,2) DEFAULT 0.00,
  "sellingPrice"     NUMERIC(10,2) DEFAULT 0.00,
  "totalPrice"       NUMERIC(10,2) DEFAULT 0.00,
  "purchaseDate"     DATE DEFAULT CURRENT_DATE,
  "userId"           TEXT,
  "userName"         TEXT,
  "referenceType"    TEXT,
  "referenceId"      TEXT,
  "createdAt"        TIMESTAMP NOT NULL DEFAULT now()
);

-- 15. StockAdjustment table
CREATE TABLE IF NOT EXISTS "StockAdjustment" (
  "id"               TEXT PRIMARY KEY,
  "medicineId"       TEXT NOT NULL REFERENCES "Medicine"("id"),
  "batchId"          TEXT REFERENCES "Batch"("id"),
  "previousQuantity" INTEGER NOT NULL,
  "countedQuantity"  INTEGER NOT NULL,
  "difference"       INTEGER NOT NULL,
  "reason"           TEXT NOT NULL,
  "userId"           TEXT,
  "userName"         TEXT,
  "approvedBy"       TEXT,
  "status"           TEXT NOT NULL DEFAULT 'CONFIRMED',
  "createdAt"        TIMESTAMP NOT NULL DEFAULT now()
);

-- 16. Expense table
CREATE TABLE IF NOT EXISTS "Expense" (
  "id"            TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  "category"      TEXT NOT NULL,
  "title"         TEXT,
  "amount"        NUMERIC(10,2) NOT NULL,
  "amountPaid"    NUMERIC(10,2) NOT NULL DEFAULT 0,
  "amountDue"     NUMERIC(10,2) NOT NULL DEFAULT 0,
  "paymentStatus" TEXT NOT NULL DEFAULT 'UNPAID',
  "expenseNumber" TEXT,
  "note"          TEXT,
  "expenseDate"   DATE NOT NULL DEFAULT CURRENT_DATE,
  "date"          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "payee"         TEXT,
  "description"   TEXT,
  "attachmentUrl" TEXT,
  "isVoided"      BOOLEAN NOT NULL DEFAULT false,
  "voidReason"    TEXT,
  "voidedAt"      TIMESTAMP,
  "voidedBy"      TEXT,
  "userId"        TEXT,
  "userName"      TEXT,
  "createdAt"     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 17. ExpensePayment table
CREATE TABLE IF NOT EXISTS "ExpensePayment" (
  "id"              TEXT PRIMARY KEY,
  "expenseId"       TEXT NOT NULL REFERENCES "Expense"("id"),
  "paymentDate"     DATE NOT NULL DEFAULT CURRENT_DATE,
  "amountPaid"      NUMERIC(10,2) NOT NULL DEFAULT 0,
  "paymentMethod"   TEXT NOT NULL DEFAULT 'CASH',
  "referenceNumber" TEXT,
  "notes"           TEXT,
  "userId"          TEXT,
  "userName"        TEXT,
  "createdAt"       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS "ExpenseAuditLog" (
  "id"        TEXT PRIMARY KEY,
  "expenseId" TEXT NOT NULL REFERENCES "Expense"("id"),
  "action"    TEXT NOT NULL,
  "details"   TEXT,
  "userId"    TEXT,
  "userName"  TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS "PharmacySetting" (
  "id"                          TEXT PRIMARY KEY DEFAULT 'default',
  "pharmacyName"                TEXT NOT NULL DEFAULT 'Pharmacy Care',
  "ownerName"                   TEXT NOT NULL DEFAULT 'Admin',
  "phone"                       TEXT NOT NULL DEFAULT '+251 900 000 000',
  "email"                       TEXT NOT NULL DEFAULT 'contact@pharmacycare.com',
  "address"                     TEXT NOT NULL DEFAULT 'Addis Ababa, Ethiopia',
  "logoUrl"                     TEXT DEFAULT '',
  "sessionTimeout"              INTEGER NOT NULL DEFAULT 30,
  "lowStockAlerts"              BOOLEAN NOT NULL DEFAULT true,
  "lowStockThreshold"           INTEGER NOT NULL DEFAULT 10,
  "nearingExpiryAlerts"         BOOLEAN NOT NULL DEFAULT true,
  "expiryThresholdDays"         INTEGER NOT NULL DEFAULT 90,
  "expiredAlerts"               BOOLEAN NOT NULL DEFAULT true,
  "supplierPaymentDueReminders" BOOLEAN NOT NULL DEFAULT true,
  "pendingPurchaseAlerts"       BOOLEAN NOT NULL DEFAULT true,
  "inAppNotifications"          BOOLEAN NOT NULL DEFAULT true,
  "currency"                    TEXT NOT NULL DEFAULT 'ETB',
  "currencySymbol"              TEXT NOT NULL DEFAULT 'Br',
  "dateFormat"                  TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
  "timeZone"                    TEXT NOT NULL DEFAULT 'Africa/Addis_Ababa',
  "calendarType"                TEXT NOT NULL DEFAULT 'ethiopian',
  "theme"                       TEXT NOT NULL DEFAULT 'light',
  "language"                    TEXT NOT NULL DEFAULT 'en',
  "defaultDashboardDateRange"   TEXT NOT NULL DEFAULT 'month',
  "tableRowsPerPage"            INTEGER NOT NULL DEFAULT 10,
  "createdAt"                   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"                   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Seed default PharmacySetting row
INSERT INTO "PharmacySetting" ("id") VALUES ('default')
ON CONFLICT ("id") DO NOTHING;

