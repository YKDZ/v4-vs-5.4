import { importTbxSchema } from "@termbase/shared";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

import { TbxService } from "../services/tbx.service";
import { successResponse } from "../utils/api-response";

export function createTbxRoutes(tbxService: TbxService) {
  const route = new Hono();

  route.post(
    "/tbx/import",
    zValidator("json", importTbxSchema),
    async (c) => {
      const payload = c.req.valid("json");
      const imported = await tbxService.importTbx(payload.tbxContent);
      return c.json(successResponse(imported), 201);
    },
  );

  route.get("/tbx/export", async (c) => {
    const xml = await tbxService.exportTbx();
    c.header("Content-Type", "application/xml; charset=utf-8");
    c.header("Content-Disposition", 'attachment; filename="termbase.tbx"');
    return c.body(xml, 200);
  });

  return route;
}
