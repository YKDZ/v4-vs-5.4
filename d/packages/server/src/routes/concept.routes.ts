import {
  conceptListQuerySchema,
  createConceptSchema,
  updateConceptSchema,
} from "@termbase/shared";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { ConceptService } from "../services/concept.service";
import { successResponse } from "../utils/api-response";

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export function createConceptRoutes(conceptService: ConceptService) {
  const route = new Hono();

  route.get("/", zValidator("query", conceptListQuerySchema), async (c) => {
    const query = c.req.valid("query");
    const result = await conceptService.list(query);
    return c.json(
      successResponse(result.items, {
        page: query.page,
        pageSize: query.pageSize,
        total: result.total,
      }),
    );
  });

  route.get("/:id", zValidator("param", idParamSchema), async (c) => {
    const { id } = c.req.valid("param");
    const concept = await conceptService.getById(id);
    return c.json(successResponse(concept));
  });

  route.post("/", zValidator("json", createConceptSchema), async (c) => {
    const payload = c.req.valid("json");
    const created = await conceptService.create(payload);
    return c.json(successResponse(created), 201);
  });

  route.put(
    "/:id",
    zValidator("param", idParamSchema),
    zValidator("json", updateConceptSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const payload = c.req.valid("json");
      const updated = await conceptService.update(id, payload);
      return c.json(successResponse(updated));
    },
  );

  route.delete("/:id", zValidator("param", idParamSchema), async (c) => {
    const { id } = c.req.valid("param");
    await conceptService.delete(id);
    return c.json(successResponse({ deleted: true }));
  });

  return route;
}
