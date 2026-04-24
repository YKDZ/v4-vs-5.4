import { cors } from 'hono/cors';
import { Hono } from 'hono';
import { handleAppError } from './middleware/error-handler';
import { loggerMiddleware } from './middleware/logger';
import { apiRoutes } from './routes/index';
import type { ServiceContainer } from './services/container';
import { errorResponse, successResponse } from './utils/response';

type AppVariables = {
  Variables: {
    services: ServiceContainer;
  };
};

export function createApp(services: ServiceContainer) {
  const app = new Hono<AppVariables>();

  app.use('*', cors({ origin: process.env.CORS_ORIGIN ?? '*' }));
  app.use('*', loggerMiddleware);
  app.use('*', async (c, next) => {
    c.set('services', services);
    await next();
  });

  app.get('/health', (c) => c.json(successResponse({ status: 'ok' })));
  app.route('/api/v1', apiRoutes);

  app.notFound((c) =>
    c.json(
      errorResponse({
        code: 'NOT_FOUND',
        message: 'Route not found',
      }),
      404,
    ),
  );

  app.onError((error, c) => handleAppError(error, c));

  return app;
}
