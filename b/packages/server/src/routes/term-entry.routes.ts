import { zValidator } from '@hono/zod-validator';
import { createTermEntrySchema, termSearchQuerySchema, updateTermEntrySchema } from '@termbase/shared';
import { Hono } from 'hono';
import { getServices, parseId } from './helpers';
import { successResponse } from '../utils/response';

export const termEntryRoutes = new Hono();

termEntryRoutes.get('/concepts/:conceptId/terms', async (c) => {
  const conceptId = parseId(c.req.param('conceptId'), 'concept id');
  const languageCode = c.req.query('lang');
  const sections = await getServices(c).termEntryService.listTermsByConcept(conceptId, languageCode);
  return c.json(successResponse(sections));
});

termEntryRoutes.post('/concepts/:conceptId/terms', zValidator('json', createTermEntrySchema), async (c) => {
  const term = await getServices(c).termEntryService.createTerm(
    parseId(c.req.param('conceptId'), 'concept id'),
    c.req.valid('json'),
  );
  return c.json(successResponse(term), 201);
});

termEntryRoutes.put('/terms/:id', zValidator('json', updateTermEntrySchema), async (c) => {
  const term = await getServices(c).termEntryService.updateTerm(
    parseId(c.req.param('id'), 'term id'),
    c.req.valid('json'),
  );
  return c.json(successResponse(term));
});

termEntryRoutes.delete('/terms/:id', async (c) => {
  await getServices(c).termEntryService.deleteTerm(parseId(c.req.param('id'), 'term id'));
  return c.json(successResponse({ deleted: true }));
});

termEntryRoutes.get('/terms/search', async (c) => {
  const query = termSearchQuerySchema.parse(c.req.query());
  const result = await getServices(c).termEntryService.searchTerms(query);
  return c.json(successResponse(result.items, { page: query.page, pageSize: query.pageSize, total: result.total }));
});
