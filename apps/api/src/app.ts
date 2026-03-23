import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import { logger } from './utils/logger.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';
import { env } from './config/env.js';

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: env.CORS_ORIGINS.split(','),
  credentials: true,
}));

// Logging
app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === '/health' } }));

// Body parsing (skip for webhook route which needs raw body)
app.use((req, res, next) => {
  if (req.path === '/api/v1/payments/webhook') return next();
  express.json({ limit: '10mb' })(req, res, next);
});
app.use(cookieParser());

// Rate limiting
app.use('/api/v1', apiLimiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

// API routes
app.use('/api/v1', routes);

// Error handler (must be last)
app.use(errorHandler);

export default app;
