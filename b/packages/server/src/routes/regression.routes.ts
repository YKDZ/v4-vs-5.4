import { zValidator } from '@hono/zod-validator';
import { verifyRegressionSchema } from '@termbase/shared';
import { Hono } from 'hono';
import { getServices, parseId } from './helpers';
import { NotFoundError } from '../utils/errors';
import { successResponse } from '../utils/response';

export const regressionRoutes = new Hono();

regressionRoutes.post('/regression/verify', zValidator('json', verifyRegressionSchema), async (c) => {
  const report = await getServices(c).regressionService.verify(c.req.valid('json'));
  return c.json(successResponse(report), 201);
});

regressionRoutes.get('/regression/reports', async (c) => {
  const reports = await getServices(c).regressionService.listReports();
  return c.json(successResponse(reports));
});

regressionRoutes.get('/regression/reports/:id', async (c) => {
  const report = await getServices(c).regressionService.getReportById(parseId(c.req.param('id'), 'report id'));
  if (!report) {
    throw new NotFoundError(`Report ${c.req.param('id')} not found`);
  }

  return c.json(successResponse(report));
});
