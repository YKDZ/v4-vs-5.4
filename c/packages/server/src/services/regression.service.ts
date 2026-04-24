import type { DB } from '../db/index.js';
import { TermEntryRepository } from '../repositories/term-entry.repository.js';
import { RegressionRepository } from '../repositories/regression.repository.js';
import { extractTerms, textContainsTerm } from '../utils/term-extractor.js';
import type {
  RegressionReport,
  RegressionResultItem,
  RegressionSummary,
  RegressionVerifyInput,
} from '@termbase/shared';

/**
 * Regression engine (simplified Terminology Verifier):
 *  - Collects all source-lang + target-lang terms, grouped by concept.
 *  - Extracts source terms from source text.
 *  - For each source term occurrence, looks up the expected target term
 *    (preferred > admitted) for the same concept, then checks whether the
 *    target text uses it (exact / fuzzy / no_match), or reports `missing` if
 *    the concept has no target-language term at all.
 *  - Also detects use of `deprecated` target terms in the target text and
 *    flags them as errors.
 */
export class RegressionService {
  private termRepo: TermEntryRepository;
  private regRepo: RegressionRepository;
  constructor(db: DB) {
    this.termRepo = new TermEntryRepository(db);
    this.regRepo = new RegressionRepository(db);
  }

  async verify(input: RegressionVerifyInput): Promise<RegressionReport> {
    const sourceTerms = await this.termRepo.listAllForLang(input.sourceLang);
    const targetTerms = await this.termRepo.listAllForLang(input.targetLang);

    // Group by concept
    const targetsByConcept = new Map<number, { text: string; status: string | null }[]>();
    for (const t of targetTerms) {
      const arr = targetsByConcept.get(t.conceptId) ?? [];
      arr.push({ text: t.termText, status: t.status });
      targetsByConcept.set(t.conceptId, arr);
    }

    const sourceTermTexts = sourceTerms.map((t) => t.termText);
    const extractions = extractTerms(input.sourceText, sourceTermTexts);

    const results: RegressionResultItem[] = [];
    const deprecatedHitsRecorded = new Set<string>();

    for (const ext of extractions) {
      // Find which concepts this source term belongs to (there may be multiple concepts
      // sharing the same surface form; we pick all, but report against the first).
      const matchingSources = sourceTerms.filter((s) => s.termText.toLowerCase() === ext.term.toLowerCase());
      const concepts = [...new Set(matchingSources.map((m) => m.conceptId))];

      if (concepts.length === 0) continue;

      let bestFinding: RegressionResultItem | null = null;

      for (const conceptId of concepts) {
        const targets = targetsByConcept.get(conceptId) ?? [];
        if (targets.length === 0) {
          const finding: RegressionResultItem = {
            sourceTerm: ext.original,
            expectedTerm: null,
            actualTerm: null,
            matchType: 'missing',
            matchScore: 0,
            status: 'error',
          };
          bestFinding = mergeFinding(bestFinding, finding);
          continue;
        }

        const preferred = pickExpectedTerm(targets);
        const check = textContainsTerm(input.targetText, preferred, input.matchThreshold);
        let finding: RegressionResultItem;
        if (check.matchType === 'exact') {
          finding = {
            sourceTerm: ext.original,
            expectedTerm: preferred,
            actualTerm: preferred,
            matchType: 'exact',
            matchScore: 1,
            status: 'pass',
          };
        } else if (check.matchType === 'fuzzy') {
          finding = {
            sourceTerm: ext.original,
            expectedTerm: preferred,
            actualTerm: preferred,
            matchType: 'fuzzy',
            matchScore: Number(check.score.toFixed(4)),
            status: 'warning',
          };
        } else {
          // See if any other (non-deprecated) target term for this concept matches
          const altHit = findAnyAlternativeUsed(input.targetText, targets, input.matchThreshold);
          finding = {
            sourceTerm: ext.original,
            expectedTerm: preferred,
            actualTerm: altHit ?? null,
            matchType: 'no_match',
            matchScore: Number(check.score.toFixed(4)),
            status: 'warning',
          };
        }
        bestFinding = mergeFinding(bestFinding, finding);
      }
      if (bestFinding) results.push(bestFinding);
    }

    // Deprecated-term usage check (independent pass)
    for (const [, arr] of targetsByConcept) {
      for (const t of arr) {
        if (t.status === 'deprecated' && !deprecatedHitsRecorded.has(t.text)) {
          const check = textContainsTerm(input.targetText, t.text, 1); // require exact
          if (check.matchType === 'exact') {
            deprecatedHitsRecorded.add(t.text);
            results.push({
              sourceTerm: '(target)',
              expectedTerm: null,
              actualTerm: t.text,
              matchType: 'no_match',
              matchScore: 0,
              status: 'error',
            });
          }
        }
      }
    }

    const summary = summarize(results);

    const persisted = input.persist
      ? await this.regRepo.createReport({
          reportName: input.reportName,
          sourceText: input.sourceText,
          targetText: input.targetText,
          sourceLang: input.sourceLang,
          targetLang: input.targetLang,
          matchThreshold: input.matchThreshold,
          summary,
          results,
        })
      : null;

    return {
      id: persisted?.id ?? 0,
      reportName: input.reportName,
      sourceText: input.sourceText,
      targetText: input.targetText,
      sourceLang: input.sourceLang,
      targetLang: input.targetLang,
      matchThreshold: input.matchThreshold,
      createdAt: persisted?.createdAt?.toISOString?.() ?? new Date().toISOString(),
      summary,
      results,
    };
  }

  async listReports() {
    return this.regRepo.list();
  }

  async getReport(id: number) {
    return this.regRepo.getDetail(id);
  }
}

function pickExpectedTerm(targets: { text: string; status: string | null }[]): string {
  const pref = targets.find((t) => t.status === 'preferred');
  if (pref) return pref.text;
  const admit = targets.find((t) => t.status === 'admitted' || t.status === null);
  if (admit) return admit.text;
  return targets[0].text;
}

function findAnyAlternativeUsed(
  targetText: string,
  targets: { text: string; status: string | null }[],
  threshold: number,
): string | null {
  for (const t of targets) {
    if (t.status === 'deprecated') continue;
    const check = textContainsTerm(targetText, t.text, threshold);
    if (check.matchType === 'exact' || check.matchType === 'fuzzy') return t.text;
  }
  return null;
}

function mergeFinding(current: RegressionResultItem | null, next: RegressionResultItem): RegressionResultItem {
  if (!current) return next;
  const rank = (s: string) => (s === 'pass' ? 0 : s === 'warning' ? 1 : 2);
  // Prefer the more severe status; if tied, prefer exact over missing/no_match
  if (rank(next.status) < rank(current.status)) return current;
  if (rank(next.status) > rank(current.status)) return next;
  return current;
}

function summarize(results: RegressionResultItem[]): RegressionSummary {
  const total = results.length;
  const exact = results.filter((r) => r.matchType === 'exact').length;
  const fuzzy = results.filter((r) => r.matchType === 'fuzzy').length;
  const no = results.filter((r) => r.matchType === 'no_match').length;
  const missing = results.filter((r) => r.matchType === 'missing').length;
  const score = total === 0 ? 1 : (exact + fuzzy * 0.5) / total;
  return {
    totalTermsChecked: total,
    exactMatches: exact,
    fuzzyMatches: fuzzy,
    noMatches: no,
    missing,
    consistencyScore: Number(score.toFixed(4)),
  };
}
