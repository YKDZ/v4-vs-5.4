import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from './middleware/logger.js';
import { errorHandler } from './middleware/error-handler.js';
import { registerRoutes } from './routes/index.js';

export function createApp(): Hono {
  const app = new Hono();

  app.use('*', cors());
  app.use('*', logger);

  app.onError(errorHandler);

  registerRoutes(app);

  app.get('/health', (c) => c.json({ status: 'ok' }));

  return app;
}
