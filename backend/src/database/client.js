import pg from 'pg';
import { databaseConfig } from '../config/database.config.js';

const { Pool } = pg;

export const db = new Pool(databaseConfig);

// Helper for safe logging without exposing database credentials
const getSafeConnectionTarget = () => {
  if (databaseConfig.connectionString) {
    try {
      const sanitized = databaseConfig.connectionString.replace(/:\/\/[^:]+:[^@]+@/, '://****:****@');
      return `${sanitized} (SSL: ${Boolean(databaseConfig.ssl)})`;
    } catch {
      return `DATABASE_URL (SSL: ${Boolean(databaseConfig.ssl)})`;
    }
  }
  return `${databaseConfig.user}@${databaseConfig.host}:${databaseConfig.port}/${databaseConfig.database} (SSL: ${Boolean(databaseConfig.ssl)})`;
};

export const testDbConnection = async () => {
  console.log(`📡 Connecting to PostgreSQL: ${getSafeConnectionTarget()}`);
  try {
    const client = await db.connect();
    const result = await client.query('SELECT current_database() as db_name, NOW() as current_time');
    client.release();
    console.log(`✅ PostgreSQL Connected Successfully to database "${result.rows[0].db_name}"`);
    return { success: true, dbName: result.rows[0].db_name, time: result.rows[0].current_time };
  } catch (error) {
    console.error('❌ Database connection failed:', error?.message || error?.code || error);
    if (error?.detail) console.error('Details:', error.detail);
    if (error?.hint) console.error('Hint:', error.hint);
    throw error;
  }
};
