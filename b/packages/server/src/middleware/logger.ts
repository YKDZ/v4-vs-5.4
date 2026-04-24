import type { MiddlewareHandler } from 'hono';

export const loggerMiddleware: MiddlewareHandler = async (c, next) => {
  const startedAt = performance.now();
  await next();
  const duration = Math.round((performance.now() - startedAt) * 100) / 100;
  console.info(`${c.req.method} ${c.req.path} -> ${c.res.status} (${duration}ms)`);
};
