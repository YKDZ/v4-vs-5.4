import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';
import 'dotenv/config';

async function main() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool);

  // Push schema directly to database (no migration files needed)
  // Migration files can be added later with drizzle-kit generate
  console.log('Database migration would run here.');
  console.log('Using direct schema push for development.');

  await pool.end();
}

main().catch(console.error);
