import { Hono } from 'hono';
import type { DB } from '../db/index.js';
import { TbxService } from '../services/tbx.service.js';
import { HttpError, okJson } from '../middleware/error-handler.js';

export function createTbxRoutes(db: DB) {
  const svc = new TbxService(db);
  const app = new Hono();

  app.get('/export', async (c) => {
    const xml = await svc.exportAll();
    return c.body(xml, 200, {
      'Content-Type': 'application/xml; charset=utf-8',
      'Content-Disposition': 'attachment; filename="termbase.tbx"',
    });
  });

  app.post('/import', async (c) => {
    const ct = c.req.header('content-type') ?? '';
    let xml = '';
    if (ct.includes('application/xml') || ct.includes('text/xml') || ct.includes('text/plain')) {
      xml = await c.req.text();
    } else if (ct.includes('application/json')) {
      const j = await c.req.json<{ xml?: string }>();
      xml = j.xml ?? '';
    } else if (ct.includes('multipart/form-data')) {
      const form = await c.req.formData();
      const file = form.get('file');
      if (file instanceof File) {
        xml = await file.text();
      }
    } else {
      // Accept raw body anyway
      xml = await c.req.text();
    }
    if (!xml) throw new HttpError(400, 'EMPTY_BODY', 'No TBX content provided');
    const result = await svc.importFromXml(xml);
    return okJson(c, result);
  });

  return app;
}
