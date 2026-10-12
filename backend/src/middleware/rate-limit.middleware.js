import rateLimit from 'express-rate-limit';
import { envConfig } from '../config/env.config.js';

export const rateLimiter = rateLimit({
  windowMs: envConfig.rateLimit.windowMs,
  max: envConfig.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});
