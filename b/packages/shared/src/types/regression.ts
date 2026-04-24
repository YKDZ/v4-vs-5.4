export const regressionMatchTypes = ['exact', 'fuzzy', 'no_match', 'missing'] as const;
export const regressionStatuses = ['pass', 'warning', 'error'] as const;

export type RegressionMatchType = (typeof regressionMatchTypes)[number];
export type RegressionStatus = (typeof regressionStatuses)[number];

export interface RegressionVerifyInput {
  reportName: string;
  sourceText: string;
  targetText: string;
  sourceLang: string;
  targetLang: string;
  matchThreshold?: number;
}

export interface RegressionResult {
  id: number;
  reportId: number;
  sourceTerm: string;
  expectedTerm: string | null;
  actualTerm: string | null;
  matchType: RegressionMatchType;
  matchScore: number;
  status: RegressionStatus;
}

export interface RegressionSummary {
  totalTermsChecked: number;
  exactMatches: number;
  fuzzyMatches: number;
  noMatches: number;
  missing: number;
  consistencyScore: number;
}

export interface RegressionReport {
  id: number;
  reportName: string;
  sourceText: string;
  targetText: string;
  sourceLang: string;
  targetLang: string;
  matchThreshold: number;
  createdAt: string;
  summary: RegressionSummary;
  results: RegressionResult[];
}
