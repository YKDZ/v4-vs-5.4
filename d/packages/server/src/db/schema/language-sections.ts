import { sql } from "drizzle-orm";
import { integer, pgTable, serial, timestamp, unique, varchar } from "drizzle-orm/pg-core";

import { concepts } from "./concepts";

export const languageSections = pgTable(
  "language_sections",
  {
    id: serial("id").primaryKey(),
    conceptId: integer("concept_id")
      .references(() => concepts.id, { onDelete: "cascade" })
      .notNull(),
    languageCode: varchar("language_code", { length: 10 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
  },
  (table) => ({
    conceptLanguageUnique: unique("language_sections_concept_lang_uk").on(
      table.conceptId,
      table.languageCode,
    ),
  }),
);
