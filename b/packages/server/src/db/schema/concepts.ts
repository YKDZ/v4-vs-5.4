import { index, pgTable, serial, text, timestamp, unique, varchar } from 'drizzle-orm/pg-core';

export const concepts = pgTable(
  'concepts',
  {
    id: serial('id').primaryKey(),
    uuid: varchar('uuid', { length: 36 }).notNull(),
    definition: text('definition').notNull(),
    subjectField: varchar('subject_field', { length: 255 }).notNull(),
    note: text('note'),
    createdAt: timestamp('created_at', { mode: 'string', withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'string', withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    conceptsUuidUnique: unique('concepts_uuid_unique').on(table.uuid),
    conceptsSubjectFieldIndex: index('concepts_subject_field_idx').on(table.subjectField),
  }),
);
