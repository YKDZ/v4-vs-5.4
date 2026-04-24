import type {
  RegressionMatchType,
  RegressionReport,
  RegressionResult,
  RegressionStatus,
  RegressionSummary,
  VerifyRegressionInput,
} from '@termbase/shared';
import { regressionMatchTypes, regressionStatuses } from '@termbase/shared';
import { ConceptRepository } from '../repositories/concept.repository';
import { RegressionRepository } from '../repositories/regression.repository';
import { extractTermsFromText } from '../utils/term-extractor';

export class RegressionService {
  constructor(
    private readonly conceptRepository: ConceptRepository,
    private readonly regressionRepository: RegressionRepository,
  ) {}

  private buildSummary(results: RegressionResult[]): RegressionSummary {
    const totalTermsChecked = results.length;
    const exactMatches = results.filter((result) => result.matchType === 'exact').length;
    const fuzzyMatches = results.filter((result) => result.matchType === 'fuzzy').length;
    const noMatches = results.filter((result) => result.matchType === 'no_match').length;
    const missing = results.filter((result) => result.matchType === 'missing').length;

    return {
      totalTermsChecked,
      exactMatches,
      fuzzyMatches,
      noMatches,
      missing,
      consistencyScore:
        totalTermsChecked === 0
          ? 1
          : Number(((exactMatches + fuzzyMatches * 0.8) / totalTermsChecked).toFixed(3)),
    };
  }

  private toReport(
    reportRow: {
      id: number;
      reportName: string;
      sourceText: string;
      targetText: string;
      sourceLang: string;
      targetLang: string;
      matchThreshold: number;
      createdAt: string;
    },
    resultRows: Array<{
      id: number;
      reportId: number;
      sourceTerm: string;
      expectedTerm: string | null;
      actualTerm: string | null;
      matchType: string;
      matchScore: number;
      status: string;
    }>,
  ): RegressionReport {
    const isRegressionMatchType = (value: string): value is RegressionMatchType =>
      regressionMatchTypes.some((item) => item === value);
    const isRegressionStatus = (value: string): value is RegressionStatus =>
      regressionStatuses.some((item) => item === value);

    const results = resultRows.map((row) => ({
      id: row.id,
      reportId: row.reportId,
      sourceTerm: row.sourceTerm,
      expectedTerm: row.expectedTerm,
      actualTerm: row.actualTerm,
      matchType: isRegressionMatchType(row.matchType) ? row.matchType : 'no_match',
      matchScore: row.matchScore,
      status: isRegressionStatus(row.status) ? row.status : 'warning',
    })) satisfies RegressionResult[];

    return {
      id: reportRow.id,
      reportName: reportRow.reportName,
      sourceText: reportRow.sourceText,
      targetText: reportRow.targetText,
      sourceLang: reportRow.sourceLang,
      targetLang: reportRow.targetLang,
      matchThreshold: reportRow.matchThreshold,
      createdAt: reportRow.createdAt,
      summary: this.buildSummary(results),
      results,
    };
  }

  async verify(input: VerifyRegressionInput) {
    const concepts = await this.conceptRepository.findAllDetailed();
    const candidateTerms = concepts.flatMap((concept) =>
      concept.languageSections
        .filter((section) => section.languageCode === input.sourceLang)
        .flatMap((section) =>
          section.termEntries.map((term) => ({
            conceptId: concept.id,
            termText: term.termText,
          })),
        ),
    );

    const extractedTerms = extractTermsFromText(input.sourceText, candidateTerms, input.matchThreshold);
    const results = extractedTerms.map((match) => {
      const concept = concepts.find((item) => item.id === match.conceptId);
      const targetSection = concept?.languageSections.find((section) => section.languageCode === input.targetLang);
      const preferredTerms = targetSection?.termEntries.filter((term) => term.status === 'preferred') ?? [];
      const admittedTerms = targetSection?.termEntries.filter((term) => term.status === 'admitted') ?? [];
      const deprecatedTerms = targetSection?.termEntries.filter((term) => term.status === 'deprecated') ?? [];

      if (!targetSection || preferredTerms.length === 0) {
        return {
          sourceTerm: match.sourceTerm,
          expectedTerm: null,
          actualTerm: null,
          matchType: 'missing',
          matchScore: 0,
          status: 'error',
        };
      }

      const preferredMatches = extractTermsFromText(
        input.targetText,
        [...preferredTerms, ...admittedTerms].map((term) => ({
          conceptId: concept!.id,
          termText: term.termText,
        })),
        input.matchThreshold,
      );
      const deprecatedMatches = extractTermsFromText(
        input.targetText,
        deprecatedTerms.map((term) => ({
          conceptId: concept!.id,
          termText: term.termText,
        })),
        input.matchThreshold,
      );

      if (preferredMatches.some((item) => item.matchType === 'exact')) {
        const exact = preferredMatches.find((item) => item.matchType === 'exact')!;
        return {
          sourceTerm: match.sourceTerm,
          expectedTerm: preferredTerms[0].termText,
          actualTerm: exact.sourceTerm,
          matchType: 'exact',
          matchScore: 1,
          status: 'pass',
        };
      }

      if (deprecatedMatches.length > 0) {
        const deprecated = deprecatedMatches[0];
        return {
          sourceTerm: match.sourceTerm,
          expectedTerm: preferredTerms[0].termText,
          actualTerm: deprecated.sourceTerm,
          matchType: 'no_match',
          matchScore: deprecated.score,
          status: 'error',
        };
      }

      if (preferredMatches.length > 0) {
        const fuzzy = preferredMatches[0];
        return {
          sourceTerm: match.sourceTerm,
          expectedTerm: preferredTerms[0].termText,
          actualTerm: fuzzy.sourceTerm,
          matchType: 'fuzzy',
          matchScore: Number(fuzzy.score.toFixed(3)),
          status: 'pass',
        };
      }

      return {
        sourceTerm: match.sourceTerm,
        expectedTerm: preferredTerms[0].termText,
        actualTerm: null,
        matchType: 'no_match',
        matchScore: 0,
        status: 'warning',
      };
    });

    const stored = await this.regressionRepository.createReport(input, results);
    return this.toReport(stored.report, stored.results);
  }

  async listReports() {
    const reports = await this.regressionRepository.listReports();
    return reports.map((report) => this.toReport(report, report.results));
  }

  async getReportById(id: number) {
    const report = await this.regressionRepository.getReportById(id);
    if (!report) {
      return null;
    }

    return this.toReport(report, report.results);
  }
}
