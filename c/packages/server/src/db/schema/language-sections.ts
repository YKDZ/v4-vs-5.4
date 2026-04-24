import { pgTable, serial, integer, varchar, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { concepts } from './concepts.js';

export const languageSections = pgTable(
  'language_sections',
  {
    id: serial('id').primaryKey(),
    conceptId: integer('concept_id')
      .notNull()
      .references(() => concepts.id, { onDelete: 'cascade' }),
    languageCode: varchar('language_code', { length: 10 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    uniqConceptLang: uniqueIndex('uniq_concept_lang').on(t.conceptId, t.languageCode),
  }),
);
