import pg from 'pg';
import { databaseConfig } from '../config/database.config.js';

const { Pool } = pg;

export const db = new Pool(databaseConfig);

export const testDbConnection = async () => {
  try {
    const client = await db.connect();
    const result = await client.query('SELECT current_database() as db_name, NOW() as current_time');
    client.release();
    console.log(`✅ PostgreSQL Connected Successfully to database "${result.rows[0].db_name}"`);
    return { success: true, dbName: result.rows[0].db_name, time: result.rows[0].current_time };
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }
};
