import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { corsConfig } from './config/cors.config.js';
import { appConfig } from './config/app.config.js';
import { requestId } from './middleware/request-id.middleware.js';
import { rateLimiter } from './middleware/rate-limit.middleware.js';
import { errorHandler } from './middleware/error-handler.middleware.js';
import { db } from './database/client.js';
import rootRouter from './routes/index.routes.js';

const app = express();

// Global Middlewares
app.use(helmet());
app.use(cors(corsConfig));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));
app.use(requestId);
app.use('/api', rateLimiter);

// Root API welcome endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Pharmacy Management System API is running',
    version: appConfig.version,
    health: '/health',
  });
});

// Health check endpoint (checks server & PostgreSQL connection)
app.get('/health', async (req, res) => {
  try {
    const dbRes = await db.query('SELECT current_database() as db_name, NOW() as db_time');
    res.json({
      status: 'healthy',
      server: 'running',
      database: {
        status: 'connected',
        name: dbRes.rows[0].db_name,
        time: dbRes.rows[0].db_time,
      },
      service: appConfig.name,
      version: appConfig.version,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      server: 'running',
      database: {
        status: 'disconnected',
        error: error.message,
      },
      timestamp: new Date().toISOString(),
    });
  }
});

// API Routes Mounting (support both /api/v1 and /api)
app.use(appConfig.prefix, rootRouter);
app.use('/api', rootRouter);

// Centralized Error Handling
app.use(errorHandler);

export default app;
