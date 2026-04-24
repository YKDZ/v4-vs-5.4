export type RegressionMatchType = "exact" | "fuzzy" | "no_match" | "missing";
export type RegressionStatus = "pass" | "warning" | "error";

export interface RegressionVerifyPayload {
  reportName: string;
  sourceText: string;
  targetText: string;
  sourceLang: string;
  targetLang: string;
  matchThreshold?: number;
}

export interface RegressionResultItem {
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
  results: RegressionResultItem[];
}
