import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { DB } from '../db/index.js';
import { TermEntryService } from '../services/term-entry.service.js';
import {
  createTermEntrySchema,
  updateTermEntrySchema,
  searchTermsQuerySchema,
} from '@termbase/shared';
import { okJson } from '../middleware/error-handler.js';

export function createTermEntryRoutes(db: DB) {
  const svc = new TermEntryService(db);
  const app = new Hono();

  // mounted at /concepts/:conceptId/terms and /terms
  app.get(
    '/concepts/:conceptId/terms',
    zValidator('param', z.object({ conceptId: z.coerce.number().int().positive() })),
    zValidator('query', z.object({ lang: z.string().optional() })),
    async (c) => {
      const { conceptId } = c.req.valid('param');
      const { lang } = c.req.valid('query');
      const rows = await svc.listByConcept(conceptId, lang);
      return okJson(c, rows);
    },
  );

  app.post(
    '/concepts/:conceptId/terms',
    zValidator('param', z.object({ conceptId: z.coerce.number().int().positive() })),
    zValidator('json', createTermEntrySchema),
    async (c) => {
      const { conceptId } = c.req.valid('param');
      const body = c.req.valid('json');
      const data = await svc.addToConcept(conceptId, body);
      return okJson(c, data, undefined, 201);
    },
  );

  app.put(
    '/terms/:id',
    zValidator('param', z.object({ id: z.coerce.number().int().positive() })),
    zValidator('json', updateTermEntrySchema),
    async (c) => {
      const { id } = c.req.valid('param');
      const body = c.req.valid('json');
      const data = await svc.update(id, body);
      return okJson(c, data);
    },
  );

  app.delete(
    '/terms/:id',
    zValidator('param', z.object({ id: z.coerce.number().int().positive() })),
    async (c) => {
      const { id } = c.req.valid('param');
      await svc.remove(id);
      return okJson(c, { deleted: true });
    },
  );

  app.get('/terms/search', zValidator('query', searchTermsQuerySchema), async (c) => {
    const q = c.req.valid('query');
    const { rows, total } = await svc.search(q);
    return okJson(c, rows, { page: q.page, pageSize: q.pageSize, total });
  });

  return app;
}
