import { sql } from 'drizzle-orm';
import { db } from './index.js';

export async function pushSchema() {
  try {
    // Create tables if they don't exist (using raw SQL for simplicity)
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS concepts (
        id SERIAL PRIMARY KEY,
        uuid UUID DEFAULT gen_random_uuid() NOT NULL UNIQUE,
        definition TEXT,
        subject_field VARCHAR(255),
        note TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS language_sections (
        id SERIAL PRIMARY KEY,
        concept_id INTEGER NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
        language_code VARCHAR(10) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS term_entries (
        id SERIAL PRIMARY KEY,
        language_section_id INTEGER NOT NULL REFERENCES language_sections(id) ON DELETE CASCADE,
        term_text VARCHAR(500) NOT NULL,
        part_of_speech VARCHAR(50),
        term_type VARCHAR(50),
        status VARCHAR(50) DEFAULT 'preferred',
        context_example TEXT,
        definition_override TEXT,
        source VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS regression_reports (
        id SERIAL PRIMARY KEY,
        report_name VARCHAR(255),
        source_text TEXT NOT NULL,
        target_text TEXT NOT NULL,
        source_lang VARCHAR(10) NOT NULL,
        target_lang VARCHAR(10) NOT NULL,
        match_threshold REAL DEFAULT 0.75 NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS regression_results (
        id SERIAL PRIMARY KEY,
        report_id INTEGER NOT NULL REFERENCES regression_reports(id) ON DELETE CASCADE,
        source_term VARCHAR(500) NOT NULL,
        expected_term VARCHAR(500),
        actual_term VARCHAR(500),
        match_type VARCHAR(50) NOT NULL,
        match_score REAL DEFAULT 0 NOT NULL,
        status VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    console.log('Database schema pushed successfully.');
  } catch (err) {
    console.error('Failed to push schema:', err);
    throw err;
  }
}
