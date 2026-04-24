import type { FuzzyMatchResult } from '@termbase/shared';

function levenshteinDistance(a: string, b: string): number {
  const aLen = a.length;
  const bLen = b.length;
  if (aLen === 0) return bLen;
  if (bLen === 0) return aLen;

  let prev = Array.from({ length: bLen + 1 }, (_, i) => i);
  let curr = new Array(bLen + 1);

  for (let i = 1; i <= aLen; i++) {
    curr[0] = i;
    for (let j = 1; j <= bLen; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        curr[j - 1] + 1,
        prev[j] + 1,
        prev[j - 1] + cost,
      );
    }
    [prev, curr] = [curr, prev];
  }

  return prev[bLen];
}

export function fuzzyMatch(
  candidate: string,
  target: string,
  threshold: number = 0.75,
): FuzzyMatchResult {
  const normalizedCandidate = candidate.toLowerCase().trim();
  const normalizedTarget = target.toLowerCase().trim();

  if (normalizedCandidate === normalizedTarget) {
    return {
      matched: true,
      score: 1.0,
      matchedTerm: target,
      matchType: 'exact',
    };
  }

  const maxLen = Math.max(normalizedCandidate.length, normalizedTarget.length);
  if (maxLen === 0) {
    return {
      matched: false,
      score: 0,
      matchedTerm: target,
      matchType: 'no_match',
    };
  }

  const distance = levenshteinDistance(normalizedCandidate, normalizedTarget);
  const score = 1 - distance / maxLen;

  if (score >= threshold) {
    return {
      matched: true,
      score: Math.round(score * 100) / 100,
      matchedTerm: target,
      matchType: 'fuzzy',
    };
  }

  return {
    matched: false,
    score: Math.round(score * 100) / 100,
    matchedTerm: target,
    matchType: 'no_match',
  };
}

export function findBestMatch(
  candidate: string,
  targets: string[],
  threshold: number = 0.75,
): FuzzyMatchResult {
  let best: FuzzyMatchResult = {
    matched: false,
    score: 0,
    matchedTerm: '',
    matchType: 'no_match',
  };

  for (const target of targets) {
    const result = fuzzyMatch(candidate, target, threshold);
    if (result.score > best.score) {
      best = result;
    }
    if (best.matchType === 'exact') break;
  }

  return best;
}
