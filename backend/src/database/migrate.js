import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { db } from './client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigration() {
  console.log('🔄 Running database schema migration...');
  const sqlPath = path.join(__dirname, 'schema.sql');
  const sql = readFileSync(sqlPath, 'utf-8');

  try {
    await db.query(sql);
    console.log('✅ Database schema migration completed successfully.');
  } catch (error) {
    console.error('❌ Database migration failed:', error.message);
    throw error;
  }
}

// Allow standalone execution: node src/database/migrate.js
if (process.argv[1]?.endsWith('migrate.js')) {
  runMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

