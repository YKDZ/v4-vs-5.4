import { findBestMatch } from './fuzzy-match.js';

export interface ExtractedTerm {
  term: string;
  startIndex: number;
  endIndex: number;
}

export function extractTermsFromText(
  text: string,
  knownTerms: string[],
): ExtractedTerm[] {
  const found: Map<string, ExtractedTerm> = new Map();
  const lowerText = text.toLowerCase();

  // Sort terms by length descending to match longest first (greedy)
  const sortedTerms = [...knownTerms].sort((a, b) => b.length - a.length);

  for (const term of sortedTerms) {
    const lowerTerm = term.toLowerCase();
    let idx = 0;
    while (idx < lowerText.length) {
      idx = lowerText.indexOf(lowerTerm, idx);
      if (idx === -1) break;

      // Check word boundary
      const before = idx > 0 ? lowerText[idx - 1] : ' ';
      const after = idx + lowerTerm.length < lowerText.length
        ? lowerText[idx + lowerTerm.length]
        : ' ';
      const isWordBoundary = /[\s,.;:!?()\[\]{}"'<>]/.test(before)
        && /[\s,.;:!?()\[\]{}"'<>]/.test(after);

      if (isWordBoundary && !found.has(lowerTerm)) {
        found.set(lowerTerm, {
          term: text.slice(idx, idx + lowerTerm.length),
          startIndex: idx,
          endIndex: idx + lowerTerm.length,
        });
      }
      idx += lowerTerm.length;
    }
  }

  return Array.from(found.values());
}

export function extractKnownTermsFromTextByFuzzy(
  text: string,
  knownTerms: string[],
  threshold: number = 0.75,
): { extracted: ExtractedTerm; match: ReturnType<typeof findBestMatch> }[] {
  // Split text into word n-grams (1-4 words)
  const words = text.split(/\s+/);
  const ngrams: string[] = [];

  for (let n = 1; n <= 4; n++) {
    for (let i = 0; i <= words.length - n; i++) {
      ngrams.push(words.slice(i, i + n).join(' '));
    }
  }

  const results: { extracted: ExtractedTerm; match: ReturnType<typeof findBestMatch> }[] = [];

  for (const ngram of ngrams) {
    // Skip very short n-grams
    if (ngram.length < 2) continue;

    const match = findBestMatch(ngram, knownTerms, threshold);
    if (match.matched) {
      const idx = text.toLowerCase().indexOf(ngram.toLowerCase());
      if (idx !== -1) {
        results.push({
          extracted: {
            term: text.slice(idx, idx + ngram.length),
            startIndex: idx,
            endIndex: idx + ngram.length,
          },
          match,
        });
      }
    }
  }

  // Deduplicate by matched term
  const seen = new Set<string>();
  return results.filter((r) => {
    const key = r.match.matchedTerm.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
