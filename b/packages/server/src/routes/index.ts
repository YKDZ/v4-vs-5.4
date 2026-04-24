import { Hono } from 'hono';
import { conceptRoutes } from './concept.routes';
import { regressionRoutes } from './regression.routes';
import { tbxRoutes } from './tbx.routes';
import { termEntryRoutes } from './term-entry.routes';

export const apiRoutes = new Hono();

apiRoutes.route('/', conceptRoutes);
apiRoutes.route('/', termEntryRoutes);
apiRoutes.route('/', regressionRoutes);
apiRoutes.route('/', tbxRoutes);
