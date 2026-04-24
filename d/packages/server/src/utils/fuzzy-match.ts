export interface FuzzyMatchResult {
  matched: boolean;
  score: number;
  matchedTerm: string | null;
  matchType: "exact" | "fuzzy" | "no_match";
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function levenshteinDistance(a: string, b: string): number {
  if (a === b) {
    return 0;
  }

  const matrix: number[][] = Array.from(
    { length: a.length + 1 },
    () => Array.from({ length: b.length + 1 }, () => 0),
  );

  for (let i = 0; i <= a.length; i += 1) {
    matrix[i][0] = i;
  }
  for (let j = 0; j <= b.length; j += 1) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[a.length][b.length];
}

export function similarity(a: string, b: string): number {
  const left = normalizeText(a);
  const right = normalizeText(b);

  if (!left && !right) {
    return 1;
  }

  if (!left || !right) {
    return 0;
  }

  const distance = levenshteinDistance(left, right);
  const maxLen = Math.max(left.length, right.length);
  return maxLen === 0 ? 1 : 1 - distance / maxLen;
}

export function fuzzyMatch(
  expected: string,
  candidates: string[],
  threshold = 0.75,
): FuzzyMatchResult {
  const expectedNormalized = normalizeText(expected);
  if (!expectedNormalized || candidates.length === 0) {
    return {
      matched: false,
      score: 0,
      matchedTerm: null,
      matchType: "no_match",
    };
  }

  let bestScore = 0;
  let bestTerm: string | null = null;

  for (const candidate of candidates) {
    const candidateNormalized = normalizeText(candidate);
    if (!candidateNormalized) {
      continue;
    }

    if (candidateNormalized.includes(expectedNormalized)) {
      return {
        matched: true,
        score: 1,
        matchedTerm: candidate,
        matchType: "exact",
      };
    }

    const score = similarity(expectedNormalized, candidateNormalized);
    if (score > bestScore) {
      bestScore = score;
      bestTerm = candidate;
    }
  }

  if (bestScore >= threshold && bestTerm) {
    return {
      matched: true,
      score: bestScore,
      matchedTerm: bestTerm,
      matchType: "fuzzy",
    };
  }

  return {
    matched: false,
    score: bestScore,
    matchedTerm: bestTerm,
    matchType: "no_match",
  };
}
