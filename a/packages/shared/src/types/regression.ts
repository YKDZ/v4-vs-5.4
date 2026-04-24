export interface RegressionReport {
  id: number;
  reportName: string;
  sourceText: string;
  targetText: string;
  sourceLang: string;
  targetLang: string;
  matchThreshold: number;
  createdAt: string;
  results?: RegressionResult[];
  summary?: RegressionSummary;
}

export interface RegressionResult {
  id: number;
  reportId: number;
  sourceTerm: string;
  expectedTerm: string | null;
  actualTerm: string | null;
  matchType: 'exact' | 'fuzzy' | 'no_match' | 'missing';
  matchScore: number;
  status: 'pass' | 'warning' | 'error';
}

export interface RegressionSummary {
  totalTermsChecked: number;
  exactMatches: number;
  fuzzyMatches: number;
  noMatches: number;
  missing: number;
  consistencyScore: number;
}

export interface RegressionRequest {
  sourceText: string;
  targetText: string;
  sourceLang: string;
  targetLang: string;
  reportName?: string;
  matchThreshold?: number;
}

export interface FuzzyMatchResult {
  matched: boolean;
  score: number;
  matchedTerm: string;
  matchType: 'exact' | 'fuzzy' | 'no_match';
}
