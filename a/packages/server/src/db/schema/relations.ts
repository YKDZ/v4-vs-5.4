import { relations } from 'drizzle-orm';
import { concepts } from './concepts.js';
import { languageSections } from './language-sections.js';
import { termEntries } from './term-entries.js';
import { regressionReports } from './regression-reports.js';
import { regressionResults } from './regression-results.js';

export const conceptsRelations = relations(concepts, ({ many }) => ({
  languageSections: many(languageSections),
}));

export const languageSectionsRelations = relations(languageSections, ({ one, many }) => ({
  concept: one(concepts, {
    fields: [languageSections.conceptId],
    references: [concepts.id],
  }),
  termEntries: many(termEntries),
}));

export const termEntriesRelations = relations(termEntries, ({ one }) => ({
  languageSection: one(languageSections, {
    fields: [termEntries.languageSectionId],
    references: [languageSections.id],
  }),
}));

export const regressionReportsRelations = relations(regressionReports, ({ many }) => ({
  results: many(regressionResults),
}));

export const regressionResultsRelations = relations(regressionResults, ({ one }) => ({
  report: one(regressionReports, {
    fields: [regressionResults.reportId],
    references: [regressionReports.id],
  }),
}));
