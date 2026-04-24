import 'dotenv/config';
import { serve } from '@hono/node-server';
import { createApp } from './app';
import { createServiceContainer } from './services/container';

async function main() {
  const services = await createServiceContainer({
    initializeDatabase: true,
    autoSeed: process.env.AUTO_SEED === 'true',
  });
  const app = createApp(services);
  const port = Number(process.env.PORT ?? 3000);

  const server = serve(
    {
      fetch: app.fetch,
      port,
    },
    (info) => {
      console.info(`Server listening on http://localhost:${info.port}`);
    },
  );

  const shutdown = async () => {
    server.close();
    await services.close();
    process.exit(0);
  };

  process.on('SIGINT', () => {
    void shutdown();
  });

  process.on('SIGTERM', () => {
    void shutdown();
  });
}

void main();
