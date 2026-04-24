export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const m = a.length;
  const n = b.length;
  const prev = new Array<number>(n + 1);
  const curr = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= n; j++) prev[j] = curr[j];
  }
  return prev[n];
}

export function similarity(a: string, b: string): number {
  if (!a && !b) return 1;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

export interface FuzzyMatchResult {
  matched: boolean;
  score: number;
  matchedTerm: string;
  matchType: 'exact' | 'fuzzy' | 'no_match';
}

export function fuzzyMatch(
  candidate: string,
  terms: string[],
  threshold: number,
): FuzzyMatchResult {
  const normCand = normalizeForCompare(candidate);
  let bestTerm = '';
  let bestScore = 0;
  for (const t of terms) {
    const s = similarity(normCand, normalizeForCompare(t));
    if (s > bestScore) {
      bestScore = s;
      bestTerm = t;
      if (s === 1) break;
    }
  }
  if (bestScore === 1) {
    return { matched: true, score: 1, matchedTerm: bestTerm, matchType: 'exact' };
  }
  if (bestScore >= threshold) {
    return { matched: true, score: bestScore, matchedTerm: bestTerm, matchType: 'fuzzy' };
  }
  return { matched: false, score: bestScore, matchedTerm: bestTerm, matchType: 'no_match' };
}

export function normalizeForCompare(s: string): string {
  return s.trim().toLowerCase();
}
