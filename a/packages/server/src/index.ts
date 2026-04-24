import 'dotenv/config';
import { serve } from '@hono/node-server';
import { createApp } from './app.js';
import { pushSchema } from './db/push-schema.js';

const app = createApp();

await pushSchema();

const port = Number(process.env.PORT) || 3000;

serve({
  fetch: app.fetch,
  port,
});

console.log(`Server running at http://localhost:${port}`);
