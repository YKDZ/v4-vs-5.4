import { sql } from "drizzle-orm";
import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { languageSections } from "./language-sections";

export const termEntries = pgTable("term_entries", {
  id: serial("id").primaryKey(),
  languageSectionId: integer("language_section_id")
    .references(() => languageSections.id, { onDelete: "cascade" })
    .notNull(),
  termText: varchar("term_text", { length: 500 }).notNull(),
  partOfSpeech: varchar("part_of_speech", { length: 50 }),
  termType: varchar("term_type", { length: 50 }),
  status: varchar("status", { length: 50 }).notNull().default("preferred"),
  contextExample: text("context_example"),
  definitionOverride: text("definition_override"),
  source: varchar("source", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`now()`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`now()`)
    .notNull(),
});
