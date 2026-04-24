import { sql } from "drizzle-orm";
import { pgTable, serial, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const concepts = pgTable("concepts", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  definition: text("definition").notNull(),
  subjectField: varchar("subject_field", { length: 255 }),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`now()`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`now()`)
    .notNull(),
});
