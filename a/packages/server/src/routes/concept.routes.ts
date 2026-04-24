import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createConceptSchema, updateConceptSchema, conceptQuerySchema } from '@termbase/shared';
import { conceptService } from '../services/concept.service.js';

export const conceptRoutes = new Hono();

conceptRoutes.get('/', zValidator('query', conceptQuerySchema), async (c) => {
  const query = c.req.valid('query');
  const result = await conceptService.list(query);
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

conceptRoutes.get('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) {
    return c.json({ success: false, error: { code: 'INVALID_ID', message: 'Invalid concept ID' } }, 400);
  }
  const concept = await conceptService.getById(id);
  return c.json({ success: true, data: concept });
});

conceptRoutes.post('/', zValidator('json', createConceptSchema), async (c) => {
  const data = c.req.valid('json');
  const concept = await conceptService.create(data);
  return c.json({ success: true, data: concept }, 201);
});

conceptRoutes.put('/:id', zValidator('json', updateConceptSchema), async (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) {
    return c.json({ success: false, error: { code: 'INVALID_ID', message: 'Invalid concept ID' } }, 400);
  }
  const data = c.req.valid('json');
  const concept = await conceptService.update(id, data);
  return c.json({ success: true, data: concept });
});

conceptRoutes.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) {
    return c.json({ success: false, error: { code: 'INVALID_ID', message: 'Invalid concept ID' } }, 400);
  }
  await conceptService.delete(id);
  return c.json({ success: true, data: null });
});
