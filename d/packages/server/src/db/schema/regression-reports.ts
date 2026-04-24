import { sql } from "drizzle-orm";
import { pgTable, real, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const regressionReports = pgTable("regression_reports", {
  id: serial("id").primaryKey(),
  reportName: varchar("report_name", { length: 255 }).notNull(),
  sourceText: text("source_text").notNull(),
  targetText: text("target_text").notNull(),
  sourceLang: varchar("source_lang", { length: 10 }).notNull(),
  targetLang: varchar("target_lang", { length: 10 }).notNull(),
  matchThreshold: real("match_threshold").notNull().default(0.75),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`now()`)
    .notNull(),
});
