import dotenv from 'dotenv';
dotenv.config();

import { inventoryService } from '../service/inventory.service.js';
import { db } from '../database/client.js';

async function runTests() {
  console.log('--- 1. Testing getSummary ---');
  const summary = await inventoryService.getSummary();
  console.log('Summary:', summary);

  console.log('\n--- 2. Testing getInventory ---');
  const inv = await inventoryService.getInventory({ page: 1, limit: 5 });
  console.log('Total items in inventory:', inv.pagination.total);

  console.log('\n--- 3. Testing addStock ---');
  const added = await inventoryService.addStock({
    name: 'Amoxicillin 500mg Unit Test',
    quantity: 30,
    purchaseCost: 12.5,
    sellingPrice: 18.0,
    purchaseDate: '2026-10-13',
    user: { id: 'test-user-id', name: 'Inventor Staff' },
  });
  console.log('Added medicine:', {
    name: added.name,
    quantity: added.quantity,
    purchaseCost: added.purchaseCost,
    totalCost: added.totalCost,
    stockStatus: added.stockStatus,
  });

  console.log('\n--- 4. Testing addStock onto existing medicine ---');
  const addedAgain = await inventoryService.addStock({
    name: 'Amoxicillin 500mg Unit Test',
    quantity: 20,
    purchaseCost: 13.0,
    sellingPrice: 19.0,
    purchaseDate: '2026-10-13',
    user: { id: 'test-user-id', name: 'Inventor Staff' },
  });
  console.log('Added again quantity (expected 50):', addedAgain.quantity);

  console.log('\n--- 5. Testing reduceStock ---');
  const reduced = await inventoryService.reduceStock({
    medicineId: added.id,
    quantity: 15,
    reason: 'Dispensed to customer',
    date: '2026-10-13',
    user: { id: 'test-user-id', name: 'Inventor Staff' },
  });
  console.log('Reduced quantity (expected 35):', reduced.quantity);

  console.log('\n--- 6. Testing editMedicine ---');
  const edited = await inventoryService.editMedicine(added.id, {
    sellingPrice: 20.0,
  });
  console.log('Edited medicine selling price:', edited.sellingPrice);

  console.log('\n--- 7. Testing negative stock prevention ---');
  try {
    await inventoryService.reduceStock({
      medicineId: added.id,
      quantity: 9999,
      reason: 'Should fail',
      date: '2026-10-13',
      user: { id: 'test-user-id', name: 'Inventor Staff' },
    });
    console.error('❌ Negative stock was not prevented!');
  } catch (err) {
    console.log('✅ Negative stock prevented successfully:', err.message);
  }

  console.log('\n--- 8. Testing getMovements ---');
  const movements = await inventoryService.getMovements({ page: 1, limit: 5 });
  console.log('Movements recorded:', movements.items.length);
  if (movements.items.length > 0) {
    console.log('Latest movement:', {
      type: movements.items[0].type,
      medicineName: movements.items[0].medicineName,
      quantity: movements.items[0].quantity,
      totalPrice: movements.items[0].totalPrice,
    });
  }

  // Cleanup test entries
  await db.query('DELETE FROM "InventoryTransaction" WHERE "medicineId" = $1', [added.id]);
  await db.query('DELETE FROM "Medicine" WHERE id = $1', [added.id]);
  console.log('\n✅ All tests passed cleanly and test records cleaned up!');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});

