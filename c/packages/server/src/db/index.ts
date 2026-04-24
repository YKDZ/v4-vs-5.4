import * as schema from './schema/index.js';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { PGlite } from '@electric-sql/pglite';
import pg from 'pg';
import fs from 'node:fs';

export type DB =
  | ReturnType<typeof drizzlePg<typeof schema>>
  | ReturnType<typeof drizzlePglite<typeof schema>>;

let _db: DB | null = null;
let _pglite: PGlite | null = null;
let _pool: pg.Pool | null = null;

export async function getDb(): Promise<DB> {
  if (_db) return _db;
  const url = process.env.DATABASE_URL;
  if (url) {
    _pool = new pg.Pool({ connectionString: url });
    _db = drizzlePg(_pool, { schema });
  } else {
    const dataDir = process.env.PGLITE_DATA_DIR; // undefined => in-memory
    if (dataDir) fs.mkdirSync(dataDir, { recursive: true });
    _pglite = new PGlite(dataDir);
    await _pglite.waitReady;
    _db = drizzlePglite(_pglite, { schema });
  }
  await applySchema();
  return _db;
}

export async function closeDb(): Promise<void> {
  if (_pool) await _pool.end();
  if (_pglite) await _pglite.close();
  _db = null;
  _pool = null;
  _pglite = null;
}

// Idempotent DDL used by both drivers. Keeps setup simple for tests & dev
// without requiring drizzle-kit / external migrations.
const DDL = `
CREATE TABLE IF NOT EXISTS concepts (
  id SERIAL PRIMARY KEY,
  uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  definition TEXT,
  subject_field VARCHAR(255),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS language_sections (
  id SERIAL PRIMARY KEY,
  concept_id INTEGER NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
  language_code VARCHAR(10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_concept_lang ON language_sections(concept_id, language_code);

CREATE TABLE IF NOT EXISTS term_entries (
  id SERIAL PRIMARY KEY,
  language_section_id INTEGER NOT NULL REFERENCES language_sections(id) ON DELETE CASCADE,
  term_text VARCHAR(500) NOT NULL,
  part_of_speech VARCHAR(50),
  term_type VARCHAR(50),
  status VARCHAR(50),
  context_example TEXT,
  definition_override TEXT,
  source VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_term_text ON term_entries(term_text);
CREATE INDEX IF NOT EXISTS idx_term_lang_section ON term_entries(language_section_id);

CREATE TABLE IF NOT EXISTS regression_reports (
  id SERIAL PRIMARY KEY,
  report_name VARCHAR(255) NOT NULL,
  source_text TEXT NOT NULL,
  target_text TEXT NOT NULL,
  source_lang VARCHAR(10) NOT NULL,
  target_lang VARCHAR(10) NOT NULL,
  match_threshold REAL NOT NULL DEFAULT 0.75,
  total_terms_checked INTEGER NOT NULL DEFAULT 0,
  exact_matches INTEGER NOT NULL DEFAULT 0,
  fuzzy_matches INTEGER NOT NULL DEFAULT 0,
  no_matches INTEGER NOT NULL DEFAULT 0,
  missing INTEGER NOT NULL DEFAULT 0,
  consistency_score REAL NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS regression_results (
  id SERIAL PRIMARY KEY,
  report_id INTEGER NOT NULL REFERENCES regression_reports(id) ON DELETE CASCADE,
  source_term VARCHAR(500) NOT NULL,
  expected_term VARCHAR(500),
  actual_term VARCHAR(500),
  match_type VARCHAR(50) NOT NULL,
  match_score REAL NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL
);
`;

async function applySchema(): Promise<void> {
  // Split into individual statements; pglite may not handle some multi-statement scripts.
  const stmts = DDL.split(/;\s*\n/).map((s) => s.trim()).filter(Boolean);
  if (!_db) throw new Error('db not initialized');
  if (_pglite) {
    for (const stmt of stmts) {
      await _pglite.exec(stmt + ';');
    }
  } else if (_pool) {
    for (const stmt of stmts) {
      await _pool.query(stmt + ';');
    }
  }
}

export { schema };
