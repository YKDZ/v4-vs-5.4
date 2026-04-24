export const schemaSqlStatements = [
  `CREATE TABLE IF NOT EXISTS concepts (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(36) NOT NULL UNIQUE,
    definition TEXT NOT NULL,
    subject_field VARCHAR(255) NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS concepts_subject_field_idx ON concepts(subject_field)`,
  `CREATE TABLE IF NOT EXISTS language_sections (
    id SERIAL PRIMARY KEY,
    concept_id INTEGER NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT language_sections_concept_language_unique UNIQUE (concept_id, language_code)
  )`,
  `CREATE INDEX IF NOT EXISTS language_sections_concept_idx ON language_sections(concept_id)`,
  `CREATE TABLE IF NOT EXISTS term_entries (
    id SERIAL PRIMARY KEY,
    language_section_id INTEGER NOT NULL REFERENCES language_sections(id) ON DELETE CASCADE,
    term_text VARCHAR(500) NOT NULL,
    part_of_speech VARCHAR(50),
    term_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    context_example TEXT,
    definition_override TEXT,
    source VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS term_entries_language_section_idx ON term_entries(language_section_id)`,
  `CREATE INDEX IF NOT EXISTS term_entries_term_text_idx ON term_entries(term_text)`,
  `CREATE INDEX IF NOT EXISTS term_entries_status_idx ON term_entries(status)`,
  `CREATE TABLE IF NOT EXISTS regression_reports (
    id SERIAL PRIMARY KEY,
    report_name VARCHAR(255) NOT NULL,
    source_text TEXT NOT NULL,
    target_text TEXT NOT NULL,
    source_lang VARCHAR(10) NOT NULL,
    target_lang VARCHAR(10) NOT NULL,
    match_threshold REAL NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS regression_results (
    id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES regression_reports(id) ON DELETE CASCADE,
    source_term VARCHAR(500) NOT NULL,
    expected_term VARCHAR(500),
    actual_term VARCHAR(500),
    match_type VARCHAR(50) NOT NULL,
    match_score REAL NOT NULL,
    status VARCHAR(50) NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS regression_results_report_idx ON regression_results(report_id)`,
];
