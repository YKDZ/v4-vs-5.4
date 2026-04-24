import { serve } from '@hono/node-server';
import { createApp } from './app.js';
import { getDb } from './db/index.js';

async function main() {
  const db = await getDb();
  const app = createApp(db);
  const port = Number(process.env.PORT ?? 3000);
  serve({ fetch: app.fetch, port }, (info) => {
    // eslint-disable-next-line no-console
    console.log(`[server] listening on http://localhost:${info.port}`);
    // eslint-disable-next-line no-console
    console.log(
      process.env.DATABASE_URL
        ? '[server] using PostgreSQL via DATABASE_URL'
        : '[server] using embedded pglite database',
    );
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Fatal:', err);
  process.exit(1);
});
