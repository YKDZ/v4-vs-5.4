import { cors } from "hono/cors";
import { Hono } from "hono";

import { getDb } from "./db";
import { handleAppError } from "./middleware/error-handler";
import { loggerMiddleware } from "./middleware/logger";
import { registerRoutes } from "./routes";
import { successResponse } from "./utils/api-response";

export function createApp() {
  const app = new Hono();
  const db = getDb();

  app.use("*", cors());
  app.use("*", loggerMiddleware);

  app.get("/health", (c) => c.json(successResponse({ ok: true })));
  app.route("/api/v1", registerRoutes(db));

  app.onError((error, c) => handleAppError(error, c));
  return app;
}
