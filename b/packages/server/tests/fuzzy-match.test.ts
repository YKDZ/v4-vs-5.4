import { describe, expect, it } from 'vitest';
import { calculateSimilarity, levenshteinDistance } from '../src/utils/fuzzy-match';
import { extractTermsFromText } from '../src/utils/term-extractor';

describe('fuzzy matching utilities', () => {
  it('computes edit distance', () => {
    expect(levenshteinDistance('interface', 'interfaces')).toBe(1);
  });

  it('returns high similarity for close variants', () => {
    expect(calculateSimilarity('user interface', 'user interfaces')).toBeGreaterThan(0.8);
  });

  it('extracts exact and fuzzy terms', () => {
    const matches = extractTermsFromText(
      'The user interfaes should remain consistent.',
      [{ conceptId: 1, termText: 'user interface' }],
      0.75,
    );

    expect(matches).toHaveLength(1);
    expect(matches[0].matchType).toBe('fuzzy');
  });
});
