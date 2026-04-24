import { pgTable, serial, integer, varchar, timestamp } from 'drizzle-orm/pg-core';
import { concepts } from './concepts.js';

export const languageSections = pgTable('language_sections', {
  id: serial('id').primaryKey(),
  conceptId: integer('concept_id').notNull().references(() => concepts.id, { onDelete: 'cascade' }),
  languageCode: varchar('language_code', { length: 10 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
