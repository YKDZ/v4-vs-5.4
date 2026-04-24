import { normalizeForCompare, similarity } from './fuzzy-match.js';

/**
 * Extract known terms from text.
 * - Supports multi-word term matching (phrases)
 * - Case-insensitive, with simple word-boundary behavior for Latin scripts
 *   and substring-scan fallback for scripts without spaces (CJK)
 */
export interface ExtractedTerm {
  term: string;      // canonical form from the termbase
  original: string;  // the form found in the source text
  start: number;
  end: number;
}

export function extractTerms(text: string, knownTerms: string[]): ExtractedTerm[] {
  if (!text || knownTerms.length === 0) return [];
  const sorted = [...new Set(knownTerms)].sort((a, b) => b.length - a.length);
  const found: ExtractedTerm[] = [];
  const lower = text.toLowerCase();
  const taken: boolean[] = new Array(text.length).fill(false);

  for (const term of sorted) {
    const needle = term.toLowerCase();
    if (!needle) continue;
    let from = 0;
    while (from <= lower.length - needle.length) {
      const idx = lower.indexOf(needle, from);
      if (idx === -1) break;
      if (isWordBoundary(text, idx, idx + needle.length) && !rangeTaken(taken, idx, idx + needle.length)) {
        found.push({
          term,
          original: text.slice(idx, idx + needle.length),
          start: idx,
          end: idx + needle.length,
        });
        for (let i = idx; i < idx + needle.length; i++) taken[i] = true;
      }
      from = idx + needle.length;
    }
  }
  found.sort((a, b) => a.start - b.start);
  return found;
}

function rangeTaken(taken: boolean[], s: number, e: number): boolean {
  for (let i = s; i < e; i++) if (taken[i]) return true;
  return false;
}

function isWordBoundary(text: string, start: number, end: number): boolean {
  // If the matched region contains non-ASCII letters (e.g. CJK), treat as boundary-free.
  const inside = text.slice(start, end);
  if (/[\u3000-\u9fff\uac00-\ud7af]/.test(inside)) return true;
  const before = start === 0 ? '' : text[start - 1];
  const after = end >= text.length ? '' : text[end];
  const wordChar = /[A-Za-z0-9_]/;
  const boundary = (ch: string) => !ch || !wordChar.test(ch);
  return boundary(before) && boundary(after);
}

/**
 * Checks whether target text contains `term` (exact or fuzzy).
 */
export function textContainsTerm(
  text: string,
  term: string,
  threshold: number,
): { present: boolean; score: number; matchType: 'exact' | 'fuzzy' | 'no_match' } {
  if (!term) return { present: false, score: 0, matchType: 'no_match' };
  const normText = text.toLowerCase();
  const normTerm = term.toLowerCase();
  if (normText.includes(normTerm)) {
    return { present: true, score: 1, matchType: 'exact' };
  }
  // sliding-window fuzzy: try windows of term.length and +-2 chars in target
  const lens = [normTerm.length - 1, normTerm.length, normTerm.length + 1].filter((l) => l > 0);
  let bestScore = 0;
  for (const L of lens) {
    for (let i = 0; i + L <= normText.length; i++) {
      const win = normText.slice(i, i + L);
      const s = similarity(normalizeForCompare(win), normalizeForCompare(normTerm));
      if (s > bestScore) bestScore = s;
      if (bestScore >= 0.999) break;
    }
  }
  if (bestScore >= threshold) return { present: true, score: bestScore, matchType: 'fuzzy' };
  return { present: false, score: bestScore, matchType: 'no_match' };
}
