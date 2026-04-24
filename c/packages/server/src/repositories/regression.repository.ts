import { desc, eq } from 'drizzle-orm';
import type { DB } from '../db/index.js';
import { regressionReports, regressionResults } from '../db/schema/index.js';
import type { RegressionResultItem, RegressionSummary } from '@termbase/shared';

export class RegressionRepository {
  constructor(private db: DB) {}

  async createReport(input: {
    reportName: string;
    sourceText: string;
    targetText: string;
    sourceLang: string;
    targetLang: string;
    matchThreshold: number;
    summary: RegressionSummary;
    results: RegressionResultItem[];
  }) {
    const [report] = await this.db
      .insert(regressionReports)
      .values({
        reportName: input.reportName,
        sourceText: input.sourceText,
        targetText: input.targetText,
        sourceLang: input.sourceLang,
        targetLang: input.targetLang,
        matchThreshold: input.matchThreshold,
        totalTermsChecked: input.summary.totalTermsChecked,
        exactMatches: input.summary.exactMatches,
        fuzzyMatches: input.summary.fuzzyMatches,
        noMatches: input.summary.noMatches,
        missing: input.summary.missing,
        consistencyScore: input.summary.consistencyScore,
      })
      .returning();

    if (input.results.length > 0) {
      await this.db.insert(regressionResults).values(
        input.results.map((r) => ({
          reportId: report.id,
          sourceTerm: r.sourceTerm,
          expectedTerm: r.expectedTerm,
          actualTerm: r.actualTerm,
          matchType: r.matchType,
          matchScore: r.matchScore,
          status: r.status,
        })),
      );
    }
    return report;
  }

  async list() {
    return this.db.select().from(regressionReports).orderBy(desc(regressionReports.id));
  }

  async getDetail(id: number) {
    return (this.db as any).query.regressionReports.findFirst({
      where: eq(regressionReports.id, id),
      with: { results: true },
    });
  }
}
