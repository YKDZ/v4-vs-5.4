import { pgTable, serial, integer, varchar, text, real, timestamp } from 'drizzle-orm/pg-core';

export const regressionReports = pgTable('regression_reports', {
  id: serial('id').primaryKey(),
  reportName: varchar('report_name', { length: 255 }).notNull(),
  sourceText: text('source_text').notNull(),
  targetText: text('target_text').notNull(),
  sourceLang: varchar('source_lang', { length: 10 }).notNull(),
  targetLang: varchar('target_lang', { length: 10 }).notNull(),
  matchThreshold: real('match_threshold').notNull().default(0.75),
  totalTermsChecked: integer('total_terms_checked').notNull().default(0),
  exactMatches: integer('exact_matches').notNull().default(0),
  fuzzyMatches: integer('fuzzy_matches').notNull().default(0),
  noMatches: integer('no_matches').notNull().default(0),
  missing: integer('missing').notNull().default(0),
  consistencyScore: real('consistency_score').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
