import type {
  RegressionResultItem,
  RegressionSummary,
  VerifyRegressionInput,
} from "@termbase/shared";

import type { SourceTargetTermPair } from "../repositories/term-entry.repository";
import { AppError } from "../types/app-error";
import { fuzzyMatch } from "../utils/fuzzy-match";
import { extractTermsFromText } from "../utils/term-extractor";

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function regexContains(text: string, term: string): boolean {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`\\b${escaped}\\b`, "iu");
  return pattern.test(text);
}

function createCandidatePhrases(text: string, term: string): string[] {
  const normalizedText = normalize(text);
  const textTokens = normalizedText.split(" ").filter(Boolean);
  const termTokensCount = Math.max(1, normalize(term).split(" ").filter(Boolean).length);
  const sizes = [Math.max(1, termTokensCount - 1), termTokensCount, termTokensCount + 1];
  const phrases = new Set<string>();

  for (const size of sizes) {
    if (textTokens.length < size) {
      continue;
    }
    for (let i = 0; i <= textTokens.length - size; i += 1) {
      phrases.add(textTokens.slice(i, i + size).join(" "));
    }
  }

  return [...phrases];
}

function calculateSummary(results: RegressionResultItem[]): RegressionSummary {
  const exactMatches = results.filter((item) => item.matchType === "exact").length;
  const fuzzyMatches = results.filter((item) => item.matchType === "fuzzy").length;
  const noMatches = results.filter((item) => item.matchType === "no_match").length;
  const missing = results.filter((item) => item.matchType === "missing").length;
  const totalTermsChecked = results.length;
  const consistencyScore =
    totalTermsChecked === 0
      ? 1
      : Number(
          (
            (exactMatches + fuzzyMatches * 0.8) /
            totalTermsChecked
          ).toFixed(3),
        );

  return {
    totalTermsChecked,
    exactMatches,
    fuzzyMatches,
    noMatches,
    missing,
    consistencyScore,
  };
}

function pickTermPair(sourceTerm: string, pairs: SourceTargetTermPair[]) {
  return pairs.find((pair) => pair.sourceTerm === sourceTerm);
}

interface TermPairReader {
  getSourceTargetTermPairs(sourceLang: string, targetLang: string): Promise<SourceTargetTermPair[]>;
}

interface RegressionReportStore {
  createReport(payload: {
    reportName: string;
    sourceText: string;
    targetText: string;
    sourceLang: string;
    targetLang: string;
    matchThreshold: number;
    results: RegressionResultItem[];
  }): Promise<
    | {
        id: number;
        reportName: string;
        sourceText: string;
        targetText: string;
        sourceLang: string;
        targetLang: string;
        matchThreshold: number;
        createdAt: string;
        results: RegressionResultItem[];
      }
    | null
  >;
  listReports(page: number, pageSize: number): Promise<{
    items: Array<{
      id: number;
      reportName: string;
      sourceText: string;
      targetText: string;
      sourceLang: string;
      targetLang: string;
      matchThreshold: number;
      createdAt: string;
    }>;
    total: number;
  }>;
  getReportById(id: number): Promise<
    | {
        id: number;
        reportName: string;
        sourceText: string;
        targetText: string;
        sourceLang: string;
        targetLang: string;
        matchThreshold: number;
        createdAt: string;
        results: RegressionResultItem[];
      }
    | null
  >;
}

export class RegressionService {
  constructor(
    private readonly termEntryRepository: TermPairReader,
    private readonly regressionRepository: RegressionReportStore,
  ) {}

  async verify(payload: VerifyRegressionInput) {
    const threshold = payload.matchThreshold ?? 0.75;
    const pairs = await this.termEntryRepository.getSourceTargetTermPairs(
      payload.sourceLang,
      payload.targetLang,
    );

    if (pairs.length === 0) {
      throw new AppError(
        "SOURCE_TERMBASE_EMPTY",
        `No source terms found for language ${payload.sourceLang}`,
        400,
      );
    }

    const sourceTerms = [...new Set(pairs.map((item) => item.sourceTerm))];
    const extractedTerms = extractTermsFromText(payload.sourceText, sourceTerms, threshold);
    const normalizedTargetText = normalize(payload.targetText);

    const results: RegressionResultItem[] = extractedTerms.map((extracted) => {
      const pair = pickTermPair(extracted.sourceTerm, pairs);
      if (!pair || !pair.expectedTerm) {
        return {
          sourceTerm: extracted.sourceTerm,
          expectedTerm: null,
          actualTerm: null,
          matchType: "missing",
          matchScore: 0,
          status: "error",
        };
      }

      const deprecatedUsed = pair.deprecatedTerms.find((term) =>
        regexContains(normalizedTargetText, normalize(term)),
      );
      if (deprecatedUsed) {
        return {
          sourceTerm: extracted.sourceTerm,
          expectedTerm: pair.expectedTerm,
          actualTerm: deprecatedUsed,
          matchType: "no_match",
          matchScore: 0,
          status: "warning",
        };
      }

      if (regexContains(normalizedTargetText, normalize(pair.expectedTerm))) {
        return {
          sourceTerm: extracted.sourceTerm,
          expectedTerm: pair.expectedTerm,
          actualTerm: pair.expectedTerm,
          matchType: "exact",
          matchScore: 1,
          status: "pass",
        };
      }

      const targetCandidates = createCandidatePhrases(payload.targetText, pair.expectedTerm);
      const fuzzyResult = fuzzyMatch(pair.expectedTerm, targetCandidates, threshold);
      if (fuzzyResult.matched) {
        return {
          sourceTerm: extracted.sourceTerm,
          expectedTerm: pair.expectedTerm,
          actualTerm: fuzzyResult.matchedTerm,
          matchType: fuzzyResult.matchType === "exact" ? "exact" : "fuzzy",
          matchScore: Number(fuzzyResult.score.toFixed(3)),
          status: fuzzyResult.matchType === "exact" ? "pass" : "warning",
        };
      }

      return {
        sourceTerm: extracted.sourceTerm,
        expectedTerm: pair.expectedTerm,
        actualTerm: fuzzyResult.matchedTerm,
        matchType: "no_match",
        matchScore: Number(fuzzyResult.score.toFixed(3)),
        status: "warning",
      };
    });

    const saved = await this.regressionRepository.createReport({
      reportName: payload.reportName,
      sourceText: payload.sourceText,
      targetText: payload.targetText,
      sourceLang: payload.sourceLang,
      targetLang: payload.targetLang,
      matchThreshold: threshold,
      results,
    });

    if (!saved) {
      throw new AppError("REPORT_SAVE_FAILED", "Failed to save report", 500);
    }

    return {
      ...saved,
      summary: calculateSummary(saved.results),
    };
  }

  async listReports(page: number, pageSize: number) {
    return this.regressionRepository.listReports(page, pageSize);
  }

  async getReportById(id: number) {
    const report = await this.regressionRepository.getReportById(id);
    if (!report) {
      throw new AppError("REPORT_NOT_FOUND", `Report ${id} not found`, 404);
    }
    return {
      ...report,
      summary: calculateSummary(report.results),
    };
  }
}
