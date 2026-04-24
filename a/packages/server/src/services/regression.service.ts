import type { RegressionVerifyInput, RegressionReport, RegressionSummary, RegressionResult } from '@termbase/shared';
import { termEntryService } from './term-entry.service.js';
import { regressionRepository } from '../repositories/regression.repository.js';
import { findBestMatch } from '../utils/fuzzy-match.js';
import type { FuzzyMatchResult } from '@termbase/shared';

export const regressionService = {
  async verify(input: RegressionVerifyInput): Promise<RegressionReport> {
    const {
      sourceText,
      targetText,
      sourceLang,
      targetLang,
      reportName,
      matchThreshold = 0.75,
    } = input;

    // Get source→target term mappings
    const sourceToTargets = await termEntryService.getTargetTermsForLanguage(
      sourceLang,
      targetLang,
    );

    // Get all known source terms
    const knownSourceTerms = Array.from(sourceToTargets.keys());

    // Get all target terms used in the termbase (to check for deprecated usage)
    const allTargetTerms = await termEntryService.getAllTermsByLanguage(targetLang);

    // Create report
    const report = await regressionRepository.createReport({
      reportName,
      sourceText,
      targetText,
      sourceLang,
      targetLang,
      matchThreshold,
    });

    // Extract terms from source by checking which known terms appear
    const results: {
      reportId: number;
      sourceTerm: string;
      expectedTerm: string | null;
      actualTerm: string | null;
      matchType: string;
      matchScore: number;
      status: string;
    }[] = [];

    for (const sourceTerm of knownSourceTerms) {
      // Check if source term appears in source text
      if (!sourceText.toLowerCase().includes(sourceTerm.toLowerCase())) continue;

      const expectedTerms = sourceToTargets.get(sourceTerm) ?? [];

      if (expectedTerms.length === 0) {
        // Missing target language translation
        results.push({
          reportId: report.id,
          sourceTerm,
          expectedTerm: null,
          actualTerm: null,
          matchType: 'missing',
          matchScore: 0,
          status: 'error',
        });
        continue;
      }

      // Check if any expected term appears in target text
      let bestMatch: FuzzyMatchResult = {
        matched: false,
        score: 0,
        matchedTerm: '',
        matchType: 'no_match',
      };

      for (const expected of expectedTerms) {
        const match = findBestMatch(expected, [expected], matchThreshold);
        // Actually check in target text
        const checkMatch = findBestMatch(expected, [targetText], matchThreshold);

        // Check if the expected term (or close variant) appears in target text
        const lowerTarget = targetText.toLowerCase();
        if (lowerTarget.includes(expected.toLowerCase())) {
          bestMatch = {
            matched: true,
            score: 1.0,
            matchedTerm: expected,
            matchType: 'exact',
          };
          break;
        }
      }

      // If no exact match found, try fuzzy match against target text
      if (!bestMatch.matched) {
        bestMatch = findBestMatch(targetText, expectedTerms, matchThreshold);
      }

      if (bestMatch.matched) {
        const isDeprecated = checkIfDeprecated(bestMatch.matchedTerm, expectedTerms);
        results.push({
          reportId: report.id,
          sourceTerm,
          expectedTerm: expectedTerms[0],
          actualTerm: bestMatch.matchedTerm,
          matchType: bestMatch.matchType,
          matchScore: bestMatch.score,
          status: isDeprecated ? 'error' : bestMatch.matchType === 'exact' ? 'pass' : 'warning',
        });
      } else {
        results.push({
          reportId: report.id,
          sourceTerm,
          expectedTerm: expectedTerms[0],
          actualTerm: null,
          matchType: 'no_match',
          matchScore: 0,
          status: 'warning',
        });
      }
    }

    // Store results
    await regressionRepository.createResults(results);

    // Get full report
    const fullReport = await regressionRepository.findReportById(report.id);

    const summary = computeSummary(results);
    return {
      ...fullReport!,
      results: fullReport!.results.map(mapResult),
      summary,
    };
  },

  async listReports(page: number = 1, pageSize: number = 20) {
    return regressionRepository.findAllReports(page, pageSize);
  },

  async getReportById(id: number) {
    const report = await regressionRepository.findReportById(id);
    if (!report) return null;

    const summary = computeSummary(report.results ?? []);
    return {
      ...report,
      results: report.results.map(mapResult),
      summary,
    };
  },
};

function computeSummary(results: { matchType: string; matchScore: number }[]): RegressionSummary {
  const totalTermsChecked = results.length;
  const exactMatches = results.filter((r) => r.matchType === 'exact').length;
  const fuzzyMatches = results.filter((r) => r.matchType === 'fuzzy').length;
  const noMatches = results.filter((r) => r.matchType === 'no_match').length;
  const missing = results.filter((r) => r.matchType === 'missing').length;

  const consistencyScore = totalTermsChecked > 0
    ? Math.round(((exactMatches + fuzzyMatches * 0.5) / totalTermsChecked) * 1000) / 1000
    : 0;

  return { totalTermsChecked, exactMatches, fuzzyMatches, noMatches, missing, consistencyScore };
}

function mapResult(r: Record<string, unknown>): RegressionResult {
  return {
    id: r.id as number,
    reportId: r.reportId as number,
    sourceTerm: r.sourceTerm as string,
    expectedTerm: r.expectedTerm as string | null,
    actualTerm: r.actualTerm as string | null,
    matchType: r.matchType as RegressionResult['matchType'],
    matchScore: r.matchScore as number,
    status: r.status as RegressionResult['status'],
  };
}

function checkIfDeprecated(matchedTerm: string, expectedTerms: string[]): boolean {
  if (expectedTerms.length <= 1) return false;
  return matchedTerm !== expectedTerms[0];
}
