import dotenv from 'dotenv';
dotenv.config();
import { db } from './client.js';

async function migrate() {
  try {
    await db.query(`
      ALTER TABLE "SaleItem" 
      ADD COLUMN IF NOT EXISTS "purchaseCost" numeric DEFAULT 0;
    `);
    console.log('✅ Added purchaseCost column to SaleItem table');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

migrate();

