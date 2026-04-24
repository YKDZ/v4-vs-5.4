import { zValidator } from '@hono/zod-validator';
import { conceptQuerySchema, createConceptSchema, updateConceptSchema } from '@termbase/shared';
import { Hono } from 'hono';
import { getServices, parseId } from './helpers';
import { successResponse } from '../utils/response';

export const conceptRoutes = new Hono();

conceptRoutes.get('/concepts', async (c) => {
  const query = conceptQuerySchema.parse(c.req.query());
  const result = await getServices(c).conceptService.listConcepts(query);
  return c.json(successResponse(result.items, { page: query.page, pageSize: query.pageSize, total: result.total }));
});

conceptRoutes.get('/concepts/:id', async (c) => {
  const concept = await getServices(c).conceptService.getConceptById(parseId(c.req.param('id'), 'concept id'));
  return c.json(successResponse(concept));
});

conceptRoutes.post('/concepts', zValidator('json', createConceptSchema), async (c) => {
  const concept = await getServices(c).conceptService.createConcept(c.req.valid('json'));
  return c.json(successResponse(concept), 201);
});

conceptRoutes.put('/concepts/:id', zValidator('json', updateConceptSchema), async (c) => {
  const concept = await getServices(c).conceptService.updateConcept(
    parseId(c.req.param('id'), 'concept id'),
    c.req.valid('json'),
  );
  return c.json(successResponse(concept));
});

conceptRoutes.delete('/concepts/:id', async (c) => {
  await getServices(c).conceptService.deleteConcept(parseId(c.req.param('id'), 'concept id'));
  return c.json(successResponse({ deleted: true }));
});
