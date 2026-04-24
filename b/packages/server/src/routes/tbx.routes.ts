import { Hono } from 'hono';
import { BadRequestError } from '../utils/errors';
import { successResponse } from '../utils/response';
import { getServices } from './helpers';

export const tbxRoutes = new Hono();

tbxRoutes.get('/tbx/export', async (c) => {
  const xml = await getServices(c).tbxService.exportXml();
  c.header('Content-Type', 'application/xml; charset=utf-8');
  c.header('Content-Disposition', 'attachment; filename="termbase-export.tbx.xml"');
  return c.body(xml);
});

tbxRoutes.post('/tbx/import', async (c) => {
  const contentType = c.req.header('content-type') ?? '';
  let xml = '';

  if (contentType.includes('multipart/form-data')) {
    const body = await c.req.parseBody();
    const file = body.file;

    if (!file || typeof (file as { text?: () => Promise<string> }).text !== 'function') {
      throw new BadRequestError('TBX file is required');
    }

    xml = await (file as { text: () => Promise<string> }).text();
  } else {
    xml = await c.req.text();
  }

  if (!xml.trim()) {
    throw new BadRequestError('TBX content is empty');
  }

  const result = await getServices(c).tbxService.importXml(xml);
  return c.json(successResponse(result), 201);
});
