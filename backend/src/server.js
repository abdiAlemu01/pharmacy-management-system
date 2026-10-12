import app from './app.js';
import { envConfig } from './config/env.config.js';
import { db, testDbConnection } from './database/client.js';

const startServer = async () => {
  try {
    await testDbConnection();

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
    console.error('Fatal error starting server:', error.message);
    process.exit(1);
  }
};

startServer();
