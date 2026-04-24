import type { RegressionResultItem } from "@termbase/shared";
import { count, desc, eq } from "drizzle-orm";

import { regressionReports } from "../db/schema/regression-reports";
import { regressionResults } from "../db/schema/regression-results";
import type { NodeDatabase } from "../types/database";

function toIso(value: Date): string {
  return value.toISOString();
}

export interface CreateRegressionReportInput {
  reportName: string;
  sourceText: string;
  targetText: string;
  sourceLang: string;
  targetLang: string;
  matchThreshold: number;
  results: RegressionResultItem[];
}

function mapResultRow(row: {
  sourceTerm: string;
  expectedTerm: string | null;
  actualTerm: string | null;
  matchType: string;
  matchScore: number;
  status: string;
}): RegressionResultItem {
  return {
    sourceTerm: row.sourceTerm,
    expectedTerm: row.expectedTerm,
    actualTerm: row.actualTerm,
    matchType: row.matchType as RegressionResultItem["matchType"],
    matchScore: Number(row.matchScore),
    status: row.status as RegressionResultItem["status"],
  };
}

export class RegressionRepository {
  constructor(private readonly db: NodeDatabase) {}

  async createReport(payload: CreateRegressionReportInput) {
    const createdId = await this.db.transaction(async (tx) => {
      const [report] = await tx
        .insert(regressionReports)
        .values({
          reportName: payload.reportName,
          sourceText: payload.sourceText,
          targetText: payload.targetText,
          sourceLang: payload.sourceLang,
          targetLang: payload.targetLang,
          matchThreshold: payload.matchThreshold,
        })
        .returning({ id: regressionReports.id });

      if (payload.results.length > 0) {
        await tx.insert(regressionResults).values(
          payload.results.map((result) => ({
            reportId: report.id,
            sourceTerm: result.sourceTerm,
            expectedTerm: result.expectedTerm,
            actualTerm: result.actualTerm,
            matchType: result.matchType,
            matchScore: result.matchScore,
            status: result.status,
          })),
        );
      }

      return report.id;
    });

    return this.getReportById(createdId);
  }

  async listReports(page: number, pageSize: number) {
    const offset = (page - 1) * pageSize;
    const rows = await this.db
      .select()
      .from(regressionReports)
      .orderBy(desc(regressionReports.createdAt))
      .limit(pageSize)
      .offset(offset);

    const totalRows = await this.db.select({ value: count() }).from(regressionReports);

    return {
      items: rows.map((row) => ({
        ...row,
        createdAt: toIso(row.createdAt),
      })),
      total: Number(totalRows[0]?.value ?? 0),
    };
  }

  async getReportById(id: number) {
    const report = await this.db.query.regressionReports.findFirst({
      where: eq(regressionReports.id, id),
      with: {
        results: true,
      },
    });

    if (!report) {
      return null;
    }

    return {
      ...report,
      createdAt: toIso(report.createdAt),
      results: report.results.map((item) => mapResultRow(item)),
    };
  }
}
