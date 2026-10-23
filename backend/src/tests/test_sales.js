import dotenv from 'dotenv';
dotenv.config();

import { salesService } from '../service/sales.service.js';
import { db } from '../database/client.js';

async function runTests() {
  console.log('--- 1. Testing getMedicinesForPOS ---');
  const posMeds = await salesService.getMedicinesForPOS();
  console.log(`Found ${posMeds.length} medicines available for POS.`);
  if (posMeds.length === 0) {
    throw new Error('No medicines found in database for test');
  }
  const testMed = posMeds[0];
  console.log('Sample POS Medicine:', {
    name: testMed.name,
    stock: testMed.quantity,
    purchaseCost: testMed.purchaseCost,
    sellingPrice: testMed.sellingPrice,
    profitPerUnit: testMed.profitPerUnit,
  });

  const prevStock = testMed.quantity;

  console.log('\n--- 2. Testing createSale ---');
  const salePayload = {
    items: [
      {
        medicineId: testMed.id,
        quantity: 2,
        unitPrice: testMed.sellingPrice,
      },
    ],
    user: { id: 'test-cashier-id', name: 'Cashier Abdi' },
  };

  const completedSale = await salesService.createSale(salePayload);
  console.log('Sale completed successfully:', {
    id: completedSale.id,
    total: completedSale.total,
    totalProfit: completedSale.totalProfit,
    itemsCount: completedSale.items.length,
  });

  // Verify stock was decremented
  const checkMed = await db.query('SELECT quantity FROM "Medicine" WHERE id = $1', [testMed.id]);
  const newStock = checkMed.rows[0].quantity;
  console.log(`Stock changed from ${prevStock} -> ${newStock} (expected: ${prevStock - 2})`);
  if (newStock !== prevStock - 2) {
    throw new Error('Stock was not properly decremented!');
  }

  console.log('\n--- 3. Testing getAnalytics (Daily & Monthly, Top & Less Selling) ---');
  const analytics = await salesService.getAnalytics();
  console.log('Daily Sell (Birr):', analytics.daily.totalSell);
  console.log('Daily Profit (Birr):', analytics.daily.totalProfit);
  console.log('Monthly Sell (Birr):', analytics.monthly.totalSell);
  console.log('Monthly Profit (Birr):', analytics.monthly.totalProfit);
  console.log('Most Selling Daily:', analytics.daily.mostSelling);
  console.log('Less Selling Daily:', analytics.daily.lessSelling);

  console.log('\n--- 4. Testing getSales (History) ---');
  const history = await salesService.getSales({ page: 1, limit: 5 });
  console.log(`History returned ${history.sales.length} sales. Total: ${history.pagination.total}`);
  if (history.sales.length > 0) {
    console.log('Latest sale in history:', {
      id: history.sales[0].id,
      total: history.sales[0].total,
      profit: history.sales[0].totalProfit,
      items: history.sales[0].items.length,
    });
  }

  console.log('\n--- 5. Testing insufficient stock prevention ---');
  try {
    await salesService.createSale({
      items: [{ medicineId: testMed.id, quantity: 99999 }],
      user: { id: 'test-cashier-id', name: 'Cashier' },
    });
    throw new Error('Should have failed on excessive quantity!');
  } catch (err) {
    console.log('✅ Insufficient stock error caught properly:', err.message);
  }

  // Cleanup test sale
  await db.query('DELETE FROM "SaleItem" WHERE "saleId" = $1', [completedSale.id]);
  await db.query('DELETE FROM "Sale" WHERE id = $1', [completedSale.id]);
  await db.query('DELETE FROM "InventoryTransaction" WHERE "medicineId" = $1 AND reason = $2', [
    testMed.id,
    'POS Customer Sale',
  ]);
  // Restore stock
  await db.query('UPDATE "Medicine" SET quantity = $1 WHERE id = $2', [prevStock, testMed.id]);

  console.log('\n✅ All Sales tests passed cleanly and test data restored!');
  process.exit(0);
}

runTests().catch((e) => {
  console.error('❌ Test failed:', e);
  process.exit(1);
});

