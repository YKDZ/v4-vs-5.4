import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { DB } from '../db/index.js';
import { RegressionService } from '../services/regression.service.js';
import { regressionVerifySchema } from '@termbase/shared';
import { HttpError, okJson } from '../middleware/error-handler.js';

export function createRegressionRoutes(db: DB) {
  const svc = new RegressionService(db);
  const app = new Hono();

  app.post('/verify', zValidator('json', regressionVerifySchema), async (c) => {
    const body = c.req.valid('json');
    const report = await svc.verify(body);
    return okJson(c, report);
  });

  app.get('/reports', async (c) => {
    const rows = await svc.listReports();
    return okJson(c, rows);
  });

  app.get(
    '/reports/:id',
    zValidator('param', z.object({ id: z.coerce.number().int().positive() })),
    async (c) => {
      const { id } = c.req.valid('param');
      const row = await svc.getReport(id);
      if (!row) throw new HttpError(404, 'REPORT_NOT_FOUND', `Report ${id} not found`);
      return okJson(c, row);
    },
  );

  return app;
}
