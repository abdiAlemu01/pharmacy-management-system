import { purchasesService } from '../service/purchases.service.js';
import { db } from '../database/client.js';

async function runTests() {
  console.log('🧪 Starting Purchases feature integration test...');
  try {
    // 1. Get or create a test supplier
    let supRes = await db.query('SELECT id, name FROM "Supplier" WHERE status = \'ACTIVE\' LIMIT 1');
    let supplierId;
    if (supRes.rows.length === 0) {
      const insRes = await db.query(
        'INSERT INTO "Supplier" (id, name, phone, "stockSupplied") VALUES (gen_random_uuid(), \'Test Pharma Supplies\', \'0911223344\', \'Antibiotics\') RETURNING id'
      );
      supplierId = insRes.rows[0].id;
    } else {
      supplierId = supRes.rows[0].id;
    }

    // 2. Test Add Purchase
    console.log('Testing 1: Add Purchase...');
    const testMedName = `Amoxicillin-Test-${Date.now()}`;
    const newPurchase = await purchasesService.createPurchase(
      {
        supplierId,
        invoiceNo: 'INV-TEST-001',
        discount: 50,
        additionalCharges: 20,
        notes: 'Test order note',
        items: [
          {
            medicineName: testMedName,
            quantity: 100,
            unitCost: 15.0,
            batchNumber: 'BATCH-TEST-1',
            expiryDate: '2027-12-31',
          },
        ],
      },
      { id: 'user-test', name: 'Test User' }
    );

    console.log('✅ Purchase created:', {
      id: newPurchase.id,
      poNo: newPurchase.purchaseOrderNo,
      totalCost: newPurchase.totalCost,
      status: newPurchase.status,
      paymentStatus: newPurchase.paymentStatus,
    });

    if (newPurchase.totalCost !== 1470) {
      throw new Error(`Expected totalCost to be 1470 (1500 - 50 + 20), got ${newPurchase.totalCost}`);
    }

    // 3. Test Receive Medicines
    console.log('Testing 2: Receive Medicines...');
    const itemId = newPurchase.items[0].id;
    const receivedPurchase = await purchasesService.receiveMedicines(
      newPurchase.id,
      {
        receivedDate: new Date().toISOString().split('T')[0],
        receivingNotes: 'Received 95 good units, 5 damaged',
        items: [
          {
            purchaseItemId: itemId,
            quantityReceived: 95,
            quantityRejected: 5,
            batchNumber: 'BATCH-TEST-1',
            expiryDate: '2027-12-31',
            rejectionReason: 'Damaged bottles during transport',
          },
        ],
      },
      { id: 'user-test', name: 'Test User' }
    );

    console.log('✅ Medicines received. Purchase status:', receivedPurchase.status);

    // Verify inventory updated for accepted quantity (95)
    const medCheck = await db.query('SELECT quantity, "purchaseCost" FROM "Medicine" WHERE LOWER(name) = LOWER($1)', [testMedName]);
    console.log('✅ Inventory medicine verified:', medCheck.rows[0]);
    if (parseInt(medCheck.rows[0].quantity, 10) !== 95) {
      throw new Error(`Expected inventory quantity 95, got ${medCheck.rows[0].quantity}`);
    }

    // 4. Test Record Supplier Payment
    console.log('Testing 3: Record Supplier Payment...');
    const paidPurchase = await purchasesService.recordPayment(
      newPurchase.id,
      {
        amount: 500,
        paymentMethod: 'BANK_TRANSFER',
        notes: 'Partial payment wire transfer',
      },
      { id: 'user-test', name: 'Test User' }
    );

    console.log('✅ Payment recorded:', {
      amountPaid: paidPurchase.amountPaid,
      amountDue: paidPurchase.amountDue,
      paymentStatus: paidPurchase.paymentStatus,
      paymentsCount: paidPurchase.payments.length,
    });

    if (paidPurchase.amountPaid !== 500 || paidPurchase.paymentStatus !== 'PARTIAL') {
      throw new Error('Payment calculations mismatch');
    }

    // 5. Test Return Medicines to Supplier
    console.log('Testing 4: Return Medicines to Supplier...');
    const returnedPurchase = await purchasesService.returnMedicines(
      newPurchase.id,
      {
        notes: 'Returning 5 units defective seal',
        items: [
          {
            purchaseItemId: itemId,
            returnQuantity: 5,
            returnReason: 'Defective seal found on batch',
            refundStatus: 'CREDITED',
          },
        ],
      },
      { id: 'user-test', name: 'Test User' }
    );

    console.log('✅ Return processed. New totalCost:', returnedPurchase.totalCost, 'Returns logged:', returnedPurchase.returns.length);

    // Verify inventory reduced by 5: 95 - 5 = 90
    const medCheckAfterReturn = await db.query('SELECT quantity FROM "Medicine" WHERE LOWER(name) = LOWER($1)', [testMedName]);
    console.log('✅ Inventory quantity after return:', medCheckAfterReturn.rows[0]);
    if (parseInt(medCheckAfterReturn.rows[0].quantity, 10) !== 90) {
      throw new Error(`Expected inventory quantity 90, got ${medCheckAfterReturn.rows[0].quantity}`);
    }

    // 6. Test Purchase Summary & Reports
    console.log('Testing 5: Purchase Summary & Reports...');
    const summary = await purchasesService.getPurchasesSummary();
    console.log('✅ Summary overview:', summary.overview);
    console.log('✅ Top suppliers:', summary.spendingBySupplier.length);
    console.log('✅ Most purchased meds:', summary.mostPurchasedMedicines.length);

    // 7. Clean up test purchase & medicine
    await purchasesService.deletePurchase(newPurchase.id);
    await db.query('DELETE FROM "Batch" WHERE "medicineId" IN (SELECT id FROM "Medicine" WHERE LOWER(name) = LOWER($1))', [testMedName]);
    await db.query('DELETE FROM "InventoryTransaction" WHERE "medicineId" IN (SELECT id FROM "Medicine" WHERE LOWER(name) = LOWER($1))', [testMedName]);
    await db.query('DELETE FROM "Medicine" WHERE LOWER(name) = LOWER($1)', [testMedName]);
    console.log('🧹 Cleaned up test records.');

    console.log('🎉 ALL PURCHASES BACKEND TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  }
}

runTests();
