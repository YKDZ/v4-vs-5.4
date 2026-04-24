import { eq, desc, sql } from 'drizzle-orm';
import { db, schema } from '../db/index.js';

const { regressionReports, regressionResults } = schema;

export const regressionRepository = {
  async createReport(data: {
    reportName?: string;
    sourceText: string;
    targetText: string;
    sourceLang: string;
    targetLang: string;
    matchThreshold: number;
  }) {
    const [report] = await db.insert(regressionReports)
      .values({
        reportName: data.reportName ?? null,
        sourceText: data.sourceText,
        targetText: data.targetText,
        sourceLang: data.sourceLang,
        targetLang: data.targetLang,
        matchThreshold: data.matchThreshold,
      })
      .returning();
    return report;
  },

  async createResults(results: {
    reportId: number;
    sourceTerm: string;
    expectedTerm: string | null;
    actualTerm: string | null;
    matchType: string;
    matchScore: number;
    status: string;
  }[]) {
    if (results.length === 0) return [];
    return db.insert(regressionResults).values(results).returning();
  },

  async findAllReports(page: number = 1, pageSize: number = 20) {
    const offset = (page - 1) * pageSize;

    const [data, countResult] = await Promise.all([
      db.select().from(regressionReports)
        .orderBy(desc(regressionReports.createdAt))
        .limit(pageSize)
        .offset(offset),
      db.select({ count: sql<number>`count(*)::int` }).from(regressionReports),
    ]);

    return {
      data,
      total: countResult[0]?.count ?? 0,
      page,
      pageSize,
    };
  },

  async findReportById(id: number) {
    const reports = await db.select().from(regressionReports).where(eq(regressionReports.id, id)).limit(1);
    if (reports.length === 0) return null;

    const report = reports[0];
    const results = await db.select().from(regressionResults)
      .where(eq(regressionResults.reportId, id));

    return { ...report, results };
  },
};


