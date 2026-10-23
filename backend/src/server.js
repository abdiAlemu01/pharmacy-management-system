import app from './app.js';
import { envConfig } from './config/env.config.js';
import { db, testDbConnection } from './database/client.js';
import { runMigration } from './database/migrate.js';

const startServer = async () => {
  try {
    // 1. Verify database connectivity
    await testDbConnection();

    // 2. Run schema migration (safe: uses CREATE TABLE IF NOT EXISTS)
    await runMigration();

    // 3. Start HTTP server
    const server = app.listen(envConfig.port, () => {
      console.log(`🚀 Server running on port ${envConfig.port} in ${envConfig.nodeEnv} mode`);
    });

    const shutdown = async () => {
      console.log('Stopping server...');
      server.close(async () => {
        await db.end();
        console.log('Database pool closed. Process terminated.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Fatal error starting server:', error?.message || error?.code || error);
    process.exit(1);
  }
};

startServer();
