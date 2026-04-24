import { pgTable, serial, varchar, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const concepts = pgTable('concepts', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  definition: text('definition'),
  subjectField: varchar('subject_field', { length: 255 }),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
