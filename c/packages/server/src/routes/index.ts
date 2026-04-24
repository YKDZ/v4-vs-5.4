import { Hono } from 'hono';
import type { DB } from '../db/index.js';
import { createConceptRoutes } from './concept.routes.js';
import { createTermEntryRoutes } from './term-entry.routes.js';
import { createRegressionRoutes } from './regression.routes.js';
import { createTbxRoutes } from './tbx.routes.js';

export function createApiRoutes(db: DB) {
  const api = new Hono();
  api.route('/concepts', createConceptRoutes(db));
  // term-entry routes are mounted at root since they mix /concepts/:id/terms and /terms
  api.route('/', createTermEntryRoutes(db));
  api.route('/regression', createRegressionRoutes(db));
  api.route('/tbx', createTbxRoutes(db));
  return api;
}
