import { pgTable, serial, integer, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { languageSections } from './language-sections.js';

export const termEntries = pgTable('term_entries', {
  id: serial('id').primaryKey(),
  languageSectionId: integer('language_section_id').notNull().references(() => languageSections.id, { onDelete: 'cascade' }),
  termText: varchar('term_text', { length: 500 }).notNull(),
  partOfSpeech: varchar('part_of_speech', { length: 50 }),
  termType: varchar('term_type', { length: 50 }),
  status: varchar('status', { length: 50 }).default('preferred'),
  contextExample: text('context_example'),
  definitionOverride: text('definition_override'),
  source: varchar('source', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
