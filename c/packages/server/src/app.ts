import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { DB } from './db/index.js';
import { onError } from './middleware/error-handler.js';
import { logger } from './middleware/logger.js';
import { createApiRoutes } from './routes/index.js';

export function createApp(db: DB) {
  const app = new Hono();
  app.use('*', cors());
  app.use('*', logger);
  app.onError(onError);

  app.get('/health', (c) => c.json({ success: true, data: { status: 'ok' } }));
  app.route('/api/v1', createApiRoutes(db));

  return app;
}
