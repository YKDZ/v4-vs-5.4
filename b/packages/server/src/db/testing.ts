import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { initializeDatabaseSchema, type DatabaseContext } from './index';
import * as schema from './schema/index';

export async function createTestDatabaseContext(): Promise<DatabaseContext> {
  const client = new PGlite();
  const db = drizzle(client, { schema });

  await initializeDatabaseSchema(db);

  return {
    db: db as unknown as DatabaseContext['db'],
    close: async () => {
      await client.close();
    },
  };
}
