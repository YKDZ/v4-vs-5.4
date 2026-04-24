import { calculateSimilarity, normalizeText } from './fuzzy-match';

export interface CandidateTerm {
  conceptId: number;
  termText: string;
}

export interface ExtractedTerm {
  conceptId: number;
  sourceTerm: string;
  matchedText: string;
  matchType: 'exact' | 'fuzzy';
  score: number;
}

function tokenize(value: string) {
  return normalizeText(value).split(' ').filter(Boolean);
}

export function extractTermsFromText(
  text: string,
  candidates: CandidateTerm[],
  threshold = 0.75,
): ExtractedTerm[] {
  const normalizedText = normalizeText(text);
  const tokens = tokenize(text);
  const results = new Map<string, ExtractedTerm>();

  const sortedCandidates = [...candidates].sort((left, right) => right.termText.length - left.termText.length);

  for (const candidate of sortedCandidates) {
    const normalizedCandidate = normalizeText(candidate.termText);

    if (!normalizedCandidate) {
      continue;
    }

    if (normalizedText.includes(normalizedCandidate)) {
      results.set(`${candidate.conceptId}:${candidate.termText}`, {
        conceptId: candidate.conceptId,
        sourceTerm: candidate.termText,
        matchedText: candidate.termText,
        matchType: 'exact',
        score: 1,
      });
      continue;
    }

    const candidateTokens = normalizedCandidate.split(' ').filter(Boolean);
    const targetWindowSize = Math.max(candidateTokens.length, 1);
    let bestScore = 0;
    let bestWindow = '';

    for (let windowSize = Math.max(1, targetWindowSize - 1); windowSize <= targetWindowSize + 1; windowSize += 1) {
      for (let index = 0; index <= tokens.length - windowSize; index += 1) {
        const window = tokens.slice(index, index + windowSize).join(' ');
        const score = calculateSimilarity(window, normalizedCandidate);

        if (score > bestScore) {
          bestScore = score;
          bestWindow = window;
        }
      }
    }

    if (bestScore >= threshold) {
      results.set(`${candidate.conceptId}:${candidate.termText}`, {
        conceptId: candidate.conceptId,
        sourceTerm: candidate.termText,
        matchedText: bestWindow || candidate.termText,
        matchType: 'fuzzy',
        score: bestScore,
      });
    }
  }

  return [...results.values()];
}
