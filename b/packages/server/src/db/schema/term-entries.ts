import { index, integer, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { languageSections } from './language-sections';

export const termEntries = pgTable(
  'term_entries',
  {
    id: serial('id').primaryKey(),
    languageSectionId: integer('language_section_id')
      .notNull()
      .references(() => languageSections.id, { onDelete: 'cascade' }),
    termText: varchar('term_text', { length: 500 }).notNull(),
    partOfSpeech: varchar('part_of_speech', { length: 50 }),
    termType: varchar('term_type', { length: 50 }).notNull(),
    status: varchar('status', { length: 50 }).notNull(),
    contextExample: text('context_example'),
    definitionOverride: text('definition_override'),
    source: varchar('source', { length: 255 }),
    createdAt: timestamp('created_at', { mode: 'string', withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'string', withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    termEntriesLanguageSectionIndex: index('term_entries_language_section_idx').on(table.languageSectionId),
    termEntriesTermTextIndex: index('term_entries_term_text_idx').on(table.termText),
    termEntriesStatusIndex: index('term_entries_status_idx').on(table.status),
  }),
);
