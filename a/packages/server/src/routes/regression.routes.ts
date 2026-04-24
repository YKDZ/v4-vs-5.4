import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { regressionVerifySchema } from '@termbase/shared';
import { regressionService } from '../services/regression.service.js';

export const regressionRoutes = new Hono();

regressionRoutes.post('/verify', zValidator('json', regressionVerifySchema), async (c) => {
  const data = c.req.valid('json');
  const report = await regressionService.verify(data);
  return c.json({ success: true, data: report }, 201);
});

regressionRoutes.get('/reports', async (c) => {
  const page = Number(c.req.query('page') ?? '1');
  const pageSize = Number(c.req.query('pageSize') ?? '20');
  const result = await regressionService.listReports(page, pageSize);
  return c.json({
    success: true,
    data: result.data,
    meta: {
      page: result.page,
      pageSize: result.pageSize,
      total: result.total,
    },
  });
});

regressionRoutes.get('/reports/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) {
    return c.json({ success: false, error: { code: 'INVALID_ID', message: 'Invalid report ID' } }, 400);
  }
  const report = await regressionService.getReportById(id);
  if (!report) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Report not found' } }, 404);
  }
  return c.json({ success: true, data: report });
});
