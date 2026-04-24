import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { DB } from '../db/index.js';
import { ConceptService } from '../services/concept.service.js';
import {
  createConceptSchema,
  updateConceptSchema,
  listConceptsQuerySchema,
} from '@termbase/shared';
import { okJson } from '../middleware/error-handler.js';

export function createConceptRoutes(db: DB) {
  const svc = new ConceptService(db);
  const app = new Hono();

  app.get('/', zValidator('query', listConceptsQuerySchema), async (c) => {
    const q = c.req.valid('query');
    const { rows, total } = await svc.list(q);
    return okJson(c, rows, { page: q.page, pageSize: q.pageSize, total });
  });

  app.get('/:id', zValidator('param', z.object({ id: z.coerce.number().int().positive() })), async (c) => {
    const { id } = c.req.valid('param');
    const data = await svc.getDetail(id);
    return okJson(c, data);
  });

  app.post('/', zValidator('json', createConceptSchema), async (c) => {
    const body = c.req.valid('json');
    const data = await svc.create(body);
    return okJson(c, data, undefined, 201);
  });

  app.put(
    '/:id',
    zValidator('param', z.object({ id: z.coerce.number().int().positive() })),
    zValidator('json', updateConceptSchema),
    async (c) => {
      const { id } = c.req.valid('param');
      const body = c.req.valid('json');
      const data = await svc.update(id, body);
      return okJson(c, data);
    },
  );

  app.delete('/:id', zValidator('param', z.object({ id: z.coerce.number().int().positive() })), async (c) => {
    const { id } = c.req.valid('param');
    await svc.remove(id);
    return okJson(c, { deleted: true });
  });

  return app;
}
