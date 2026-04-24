import type { MiddlewareHandler } from "hono";

export const loggerMiddleware: MiddlewareHandler = async (c, next) => {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;
  const method = c.req.method;
  const path = c.req.path;
  const status = c.res.status;
  // eslint-disable-next-line no-console
  console.log(`[${new Date().toISOString()}] ${method} ${path} ${status} - ${duration}ms`);
};
