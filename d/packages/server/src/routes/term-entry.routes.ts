import {
  createTermEntrySchema,
  termQuerySchema,
  termSearchQuerySchema,
  updateTermEntrySchema,
} from "@termbase/shared";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { TermEntryService } from "../services/term-entry.service";
import { successResponse } from "../utils/api-response";

const conceptIdParamSchema = z.object({
  conceptId: z.coerce.number().int().positive(),
});

const termIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export function createTermEntryRoutes(termEntryService: TermEntryService) {
  const route = new Hono();

  route.get(
    "/concepts/:conceptId/terms",
    zValidator("param", conceptIdParamSchema),
    zValidator("query", termQuerySchema),
    async (c) => {
      const { conceptId } = c.req.valid("param");
      const query = c.req.valid("query");
      const terms = await termEntryService.listByConceptAndLanguage(conceptId, query.lang);
      return c.json(successResponse(terms));
    },
  );

  route.post(
    "/concepts/:conceptId/terms",
    zValidator("param", conceptIdParamSchema),
    zValidator("json", createTermEntrySchema),
    async (c) => {
      const { conceptId } = c.req.valid("param");
      const payload = c.req.valid("json");
      const created = await termEntryService.create(conceptId, payload);
      return c.json(successResponse(created), 201);
    },
  );

  route.put(
    "/terms/:id",
    zValidator("param", termIdParamSchema),
    zValidator("json", updateTermEntrySchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const payload = c.req.valid("json");
      const updated = await termEntryService.update(id, payload);
      return c.json(successResponse(updated));
    },
  );

  route.delete("/terms/:id", zValidator("param", termIdParamSchema), async (c) => {
    const { id } = c.req.valid("param");
    await termEntryService.delete(id);
    return c.json(successResponse({ deleted: true }));
  });

  route.get(
    "/terms/search",
    zValidator("query", termSearchQuerySchema),
    async (c) => {
      const query = c.req.valid("query");
      const results = await termEntryService.search(query);
      return c.json(successResponse(results));
    },
  );

  return route;
}
