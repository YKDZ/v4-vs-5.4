import 'dotenv/config';
import { sql } from 'drizzle-orm';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema/index';
import { schemaSqlStatements } from './schema/sql';

export type Database = NodePgDatabase<typeof schema>;

export interface DatabaseContext {
  db: Database;
  close: () => Promise<void>;
}

interface CreateDatabaseContextOptions {
  connectionString?: string;
  pool?: Pool;
  initialize?: boolean;
}

interface SchemaExecutor {
  execute: (query: ReturnType<typeof sql.raw>) => Promise<unknown>;
}

export async function initializeDatabaseSchema(db: SchemaExecutor) {
  for (const statement of schemaSqlStatements) {
    await db.execute(sql.raw(statement));
  }
}

export async function createDatabaseContext(
  options: CreateDatabaseContextOptions = {},
): Promise<DatabaseContext> {
  const ownsPool = !options.pool;
  const pool =
    options.pool ??
    new Pool({
      connectionString:
        options.connectionString ??
        process.env.DATABASE_URL ??
        'postgres://postgres:postgres@localhost:5432/termbase',
    });

  const db = drizzle(pool, { schema });

  if (options.initialize ?? false) {
    await initializeDatabaseSchema(db);
  }

  return {
    db,
    close: async () => {
      if (ownsPool) {
        await pool.end();
      }
    },
  };
}
