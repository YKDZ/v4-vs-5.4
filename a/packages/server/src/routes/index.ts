import { Hono } from 'hono';
import { conceptRoutes } from './concept.routes.js';
import { termEntryRoutes } from './term-entry.routes.js';
import { regressionRoutes } from './regression.routes.js';
import { tbxRoutes } from './tbx.routes.js';

export function registerRoutes(app: Hono) {
  const api = new Hono().basePath('/api/v1');

  api.route('/concepts', conceptRoutes);
  api.route('/', termEntryRoutes);
  api.route('/regression', regressionRoutes);
  api.route('/tbx', tbxRoutes);

  app.route('/', api);
}
