export interface FuzzyMatchResult {
  matched: boolean;
  score: number;
  matchedTerm: string | null;
  matchType: 'exact' | 'fuzzy' | 'no_match';
}

export function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^\p{L}\p{N}\s]+/gu, ' ').replace(/\s+/g, ' ').trim();
}

export function levenshteinDistance(a: string, b: string) {
  if (a === b) {
    return 0;
  }

  if (a.length === 0) {
    return b.length;
  }

  if (b.length === 0) {
    return a.length;
  }

  const matrix = Array.from({ length: a.length + 1 }, () => Array<number>(b.length + 1).fill(0));

  for (let row = 0; row <= a.length; row += 1) {
    matrix[row][0] = row;
  }

  for (let column = 0; column <= b.length; column += 1) {
    matrix[0][column] = column;
  }

  for (let row = 1; row <= a.length; row += 1) {
    for (let column = 1; column <= b.length; column += 1) {
      const cost = a[row - 1] === b[column - 1] ? 0 : 1;
      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] + cost,
      );
    }
  }

  return matrix[a.length][b.length];
}

export function calculateSimilarity(a: string, b: string) {
  const normalizedA = normalizeText(a);
  const normalizedB = normalizeText(b);
  const maxLength = Math.max(normalizedA.length, normalizedB.length);

  if (maxLength === 0) {
    return 1;
  }

  const distance = levenshteinDistance(normalizedA, normalizedB);
  return 1 - distance / maxLength;
}

export function matchAgainstCandidates(
  input: string,
  candidates: string[],
  threshold: number,
): FuzzyMatchResult {
  const normalizedInput = normalizeText(input);

  let best: FuzzyMatchResult = {
    matched: false,
    score: 0,
    matchedTerm: null,
    matchType: 'no_match',
  };

  for (const candidate of candidates) {
    const normalizedCandidate = normalizeText(candidate);

    if (normalizedInput === normalizedCandidate) {
      return {
        matched: true,
        score: 1,
        matchedTerm: candidate,
        matchType: 'exact',
      };
    }

    const score = calculateSimilarity(normalizedInput, normalizedCandidate);
    if (score > best.score) {
      best = {
        matched: score >= threshold,
        score,
        matchedTerm: candidate,
        matchType: score >= threshold ? 'fuzzy' : 'no_match',
      };
    }
  }

  return best;
}
