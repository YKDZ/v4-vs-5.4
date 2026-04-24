import { pgTable, serial, varchar, text, real, timestamp } from 'drizzle-orm/pg-core';

export const regressionReports = pgTable('regression_reports', {
  id: serial('id').primaryKey(),
  reportName: varchar('report_name', { length: 255 }),
  sourceText: text('source_text').notNull(),
  targetText: text('target_text').notNull(),
  sourceLang: varchar('source_lang', { length: 10 }).notNull(),
  targetLang: varchar('target_lang', { length: 10 }).notNull(),
  matchThreshold: real('match_threshold').default(0.75).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
