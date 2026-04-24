import { eq } from 'drizzle-orm';
import type { Database } from '../db/index';
import { regressionReports, regressionResults } from '../db/schema/index';

interface CreateReportInput {
  reportName: string;
  sourceText: string;
  targetText: string;
  sourceLang: string;
  targetLang: string;
  matchThreshold: number;
}

interface CreateResultInput {
  sourceTerm: string;
  expectedTerm: string | null;
  actualTerm: string | null;
  matchType: string;
  matchScore: number;
  status: string;
}

export class RegressionRepository {
  constructor(private readonly db: Database) {}

  async createReport(report: CreateReportInput, results: CreateResultInput[]) {
    const [createdReport] = await this.db.insert(regressionReports).values(report).returning();
    const createdResults =
      results.length > 0
        ? await this.db
            .insert(regressionResults)
            .values(results.map((result) => ({ ...result, reportId: createdReport.id })))
            .returning()
        : [];

    return {
      report: createdReport,
      results: createdResults,
    };
  }

  async listReports() {
    return this.db.query.regressionReports.findMany({
      orderBy: (table, operators) => [operators.desc(table.createdAt)],
      with: {
        results: true,
      },
    });
  }

  async getReportById(id: number) {
    return this.db.query.regressionReports.findFirst({
      where: eq(regressionReports.id, id),
      with: {
        results: true,
      },
    });
  }
}
