import { index, integer, pgTable, real, serial, varchar } from 'drizzle-orm/pg-core';
import { regressionReports } from './regression-reports';

export const regressionResults = pgTable(
  'regression_results',
  {
    id: serial('id').primaryKey(),
    reportId: integer('report_id')
      .notNull()
      .references(() => regressionReports.id, { onDelete: 'cascade' }),
    sourceTerm: varchar('source_term', { length: 500 }).notNull(),
    expectedTerm: varchar('expected_term', { length: 500 }),
    actualTerm: varchar('actual_term', { length: 500 }),
    matchType: varchar('match_type', { length: 50 }).notNull(),
    matchScore: real('match_score').notNull(),
    status: varchar('status', { length: 50 }).notNull(),
  },
  (table) => ({
    regressionResultsReportIndex: index('regression_results_report_idx').on(table.reportId),
  }),
);
