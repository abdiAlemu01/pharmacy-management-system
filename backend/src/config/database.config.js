import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config(); // fallback to current working directory if exists

const connectionString = process.env.DATABASE_URL;

// Determine if connecting to localhost
const isLocalhost = connectionString
  ? connectionString.includes('localhost') || connectionString.includes('127.0.0.1')
  : (!process.env.DB_HOST || process.env.DB_HOST === 'localhost' || process.env.DB_HOST === '127.0.0.1');

// SSL configuration:
// Remote PostgreSQL providers (Render, Supabase, Neon) require SSL with self-signed certificate acceptance
const getSslConfig = () => {
  if (process.env.DB_SSL === 'true' || process.env.DATABASE_SSL === 'true') {
    return { rejectUnauthorized: false };
  }
  if (process.env.DB_SSL === 'false' || process.env.DATABASE_SSL === 'false' || isLocalhost) {
    return false;
  }
  return { rejectUnauthorized: false };
};

export const databaseConfig = connectionString
  ? {
      connectionString,
      ssl: getSslConfig(),
      max: parseInt(process.env.DB_POOL_MAX || '20', 10),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'pharmacy_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '123@abdi',
      ssl: getSslConfig(),
      max: parseInt(process.env.DB_POOL_MAX || '20', 10),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };
