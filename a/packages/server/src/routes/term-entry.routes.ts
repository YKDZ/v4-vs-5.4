import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createTermEntrySchema, updateTermEntrySchema, termSearchSchema } from '@termbase/shared';
import { termEntryService } from '../services/term-entry.service.js';

export const termEntryRoutes = new Hono();

// Get terms by concept
termEntryRoutes.get('/concepts/:conceptId/terms', async (c) => {
  const conceptId = Number(c.req.param('conceptId'));
  if (isNaN(conceptId)) {
    return c.json({ success: false, error: { code: 'INVALID_ID', message: 'Invalid concept ID' } }, 400);
  }
  const lang = c.req.query('lang');
  const sections = await termEntryService.listByConcept(conceptId, lang ?? undefined);
  return c.json({ success: true, data: sections });
});

// Create term entry
termEntryRoutes.post('/concepts/:conceptId/terms', zValidator('json', createTermEntrySchema), async (c) => {
  const conceptId = Number(c.req.param('conceptId'));
  if (isNaN(conceptId)) {
    return c.json({ success: false, error: { code: 'INVALID_ID', message: 'Invalid concept ID' } }, 400);
  }
  const data = c.req.valid('json');
  const entry = await termEntryService.create(conceptId, data);
  return c.json({ success: true, data: entry }, 201);
});

// Update term entry
termEntryRoutes.put('/terms/:id', zValidator('json', updateTermEntrySchema), async (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) {
    return c.json({ success: false, error: { code: 'INVALID_ID', message: 'Invalid term entry ID' } }, 400);
  }
  const data = c.req.valid('json');
  const entry = await termEntryService.update(id, data);
  return c.json({ success: true, data: entry });
});

// Delete term entry
termEntryRoutes.delete('/terms/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) {
    return c.json({ success: false, error: { code: 'INVALID_ID', message: 'Invalid term entry ID' } }, 400);
  }
  await termEntryService.delete(id);
  return c.json({ success: true, data: null });
});

// Search terms
termEntryRoutes.get('/terms/search', zValidator('query', termSearchSchema), async (c) => {
  const { q, lang, page, pageSize } = c.req.valid('query');
  const result = await termEntryService.search(q, lang, page, pageSize);
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
