import { index, integer, pgTable, serial, timestamp, unique, varchar } from 'drizzle-orm/pg-core';
import { concepts } from './concepts';

export const languageSections = pgTable(
  'language_sections',
  {
    id: serial('id').primaryKey(),
    conceptId: integer('concept_id')
      .notNull()
      .references(() => concepts.id, { onDelete: 'cascade' }),
    languageCode: varchar('language_code', { length: 10 }).notNull(),
    createdAt: timestamp('created_at', { mode: 'string', withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    languageSectionsConceptLanguageUnique: unique('language_sections_concept_language_unique').on(
      table.conceptId,
      table.languageCode,
    ),
    languageSectionsConceptIndex: index('language_sections_concept_idx').on(table.conceptId),
  }),
);
