import { Hono } from 'hono';
import { tbxService } from '../services/tbx.service.js';

export const tbxRoutes = new Hono();

tbxRoutes.post('/import', async (c) => {
  const contentType = c.req.header('content-type') ?? '';
  let xml: string;

  if (contentType.includes('multipart/form-data')) {
    const body = await c.req.parseBody();
    const file = body.file;
    if (file && typeof file !== 'string' && 'type' in file) {
      xml = await (file as File).text();
    } else if (typeof file === 'string') {
      xml = file;
    } else {
      return c.json({ success: false, error: { code: 'NO_FILE', message: 'No file uploaded' } }, 400);
    }
  } else {
    xml = await c.req.text();
  }

  const count = await tbxService.importFromXml(xml);
  return c.json({ success: true, data: { imported: count } }, 201);
});

tbxRoutes.get('/export', async (c) => {
  const xml = await tbxService.exportToXml();
  return c.text(xml, 200, { 'Content-Type': 'application/xml' });
});
