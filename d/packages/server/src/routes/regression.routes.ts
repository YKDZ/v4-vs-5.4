import { regressionReportListQuerySchema, verifyRegressionSchema } from "@termbase/shared";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { RegressionService } from "../services/regression.service";
import { successResponse } from "../utils/api-response";

const reportIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export function createRegressionRoutes(regressionService: RegressionService) {
  const route = new Hono();

  route.post(
    "/regression/verify",
    zValidator("json", verifyRegressionSchema),
    async (c) => {
      const payload = c.req.valid("json");
      const report = await regressionService.verify(payload);
      return c.json(successResponse(report), 201);
    },
  );

  route.get(
    "/regression/reports",
    zValidator("query", regressionReportListQuerySchema),
    async (c) => {
      const query = c.req.valid("query");
      const reports = await regressionService.listReports(query.page, query.pageSize);
      return c.json(
        successResponse(reports.items, {
          page: query.page,
          pageSize: query.pageSize,
          total: reports.total,
        }),
      );
    },
  );

  route.get(
    "/regression/reports/:id",
    zValidator("param", reportIdParamSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const report = await regressionService.getReportById(id);
      return c.json(successResponse(report));
    },
  );

  return route;
}
