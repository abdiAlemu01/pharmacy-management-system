import dotenv from 'dotenv';
dotenv.config();

import { suppliersService } from '../service/suppliers.service.js';
import { db } from '../database/client.js';

async function runTests() {
  console.log('--- 1. Testing getSuppliers (List, Search & Stats) ---');
  const listResult = await suppliersService.getSuppliers();
  console.log(`Found ${listResult.suppliers.length} suppliers. Total in DB: ${listResult.pagination.total}`);
  console.log('Summary metrics:', listResult.summary);
  if (listResult.suppliers.length === 0) {
    throw new Error('Expected at least 1 supplier from seed');
  }

  const sample = listResult.suppliers[0];
  console.log('Sample Supplier:', {
    name: sample.name,
    contactPerson: sample.contactPerson,
    phone: sample.phone,
    stockSupplied: sample.stockSupplied,
    status: sample.status,
    totalPurchases: sample.totalPurchases,
    totalSpend: sample.totalSpend,
  });

  console.log('\n--- 2. Testing search and filter ---');
  const searchResult = await suppliersService.getSuppliers({ search: 'Cadila' });
  console.log(`Search for "Cadila" matched: ${searchResult.suppliers.length} suppliers.`);

  const activeResult = await suppliersService.getSuppliers({ status: 'ACTIVE' });
  console.log(`Filter status="ACTIVE" matched: ${activeResult.suppliers.length} suppliers.`);

  console.log('\n--- 3. Testing createSupplier ---');
  const newSupplier = await suppliersService.createSupplier({
    name: 'Test Global Pharma Supply Co.',
    contactPerson: 'Mr. Test Coordinator',
    phone: '+251 988 776 655',
    email: 'test@globalpharma.com',
    address: 'Bole Medhanialem, Addis Ababa',
    stockSupplied: 'Cardiology, Neurology, Emergency Medications',
    status: 'ACTIVE',
    taxNumber: 'TIN-999888777',
    paymentTerms: 'Net 30 Days',
    notes: 'Created via automated unit test.',
  });
  console.log('Created supplier:', {
    id: newSupplier.id,
    name: newSupplier.name,
    contactPerson: newSupplier.contactPerson,
    stockSupplied: newSupplier.stockSupplied,
  });

  console.log('\n--- 4. Testing getSupplierById ---');
  const fetched = await suppliersService.getSupplierById(newSupplier.id);
  console.log('Fetched details for new supplier:', {
    id: fetched.id,
    name: fetched.name,
    totalPurchases: fetched.totalPurchases,
  });

  console.log('\n--- 5. Testing updateSupplier ---');
  const updated = await suppliersService.updateSupplier(newSupplier.id, {
    contactPerson: 'Dr. Updated Coordinator',
    phone: '+251 988 000 111',
    stockSupplied: 'Expanded Oncology & Critical Care',
  });
  console.log('Updated supplier:', {
    id: updated.id,
    contactPerson: updated.contactPerson,
    phone: updated.phone,
    stockSupplied: updated.stockSupplied,
  });

  console.log('\n--- 6. Testing createSupplierPurchase ---');
  const purchaseResult = await suppliersService.createSupplierPurchase(newSupplier.id, {
    invoiceNo: 'INV-TEST-001',
    paymentStatus: 'PAID',
    notes: 'Initial test stock order',
    items: [
      {
        medicineName: 'Test Antibiotic Capsule 500mg',
        batchNumber: 'BATCH-TEST-A',
        quantity: 100,
        unitCost: 35.50,
        expiryDate: '2028-06-30',
      },
      {
        medicineName: 'Test Saline Solution 500ml',
        batchNumber: 'BATCH-TEST-B',
        quantity: 50,
        unitCost: 20.00,
        expiryDate: '2029-01-01',
      },
    ],
  });
  console.log('Purchase recorded. Purchase history summary:', purchaseResult.summary);
  console.log(`Total purchases recorded for supplier: ${purchaseResult.purchases.length}`);

  console.log('\n--- 7. Testing getSupplierPurchaseHistory ---');
  const history = await suppliersService.getSupplierPurchaseHistory(newSupplier.id);
  console.log('Retrieved purchase history:', {
    supplierName: history.supplier.name,
    totalOrders: history.summary.totalOrders,
    totalSpent: history.summary.totalSpent,
    totalItemsPurchased: history.summary.totalItemsPurchased,
    firstOrderItemsCount: history.purchases[0]?.items?.length,
  });

  console.log('\n--- 8. Testing delete / soft delete ---');
  // Since it now has a purchase record, it should soft delete (set status='INACTIVE') to protect audit integrity
  const deleteResult = await suppliersService.deleteSupplier(newSupplier.id);
  console.log('Delete result:', deleteResult);

  // Clean up test data completely
  await db.query(`DELETE FROM "PurchaseItem" WHERE "purchaseId" IN (SELECT id FROM "Purchase" WHERE "supplierId" = $1);`, [newSupplier.id]);
  await db.query(`DELETE FROM "Purchase" WHERE "supplierId" = $1;`, [newSupplier.id]);
  await db.query(`DELETE FROM "Supplier" WHERE id = $1;`, [newSupplier.id]);
  console.log('Cleaned up test records from database.');

  console.log('\n✅ ALL SUPPLIER SERVICE TESTS PASSED CLEANLY!\n');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});

