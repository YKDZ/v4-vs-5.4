export type MatchType = 'exact' | 'fuzzy' | 'no_match' | 'missing';
export type ResultStatus = 'pass' | 'warning' | 'error';

export interface RegressionResultItem {
  id?: number;
  sourceTerm: string;
  expectedTerm: string | null;
  actualTerm: string | null;
  matchType: MatchType;
  matchScore: number;
  status: ResultStatus;
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
