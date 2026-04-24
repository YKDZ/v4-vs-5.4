import { and, eq, ilike, sql } from 'drizzle-orm';
import type { DB } from '../db/index.js';
import { languageSections, termEntries } from '../db/schema/index.js';
import type { CreateTermEntryInput, UpdateTermEntryInput } from '@termbase/shared';

export class TermEntryRepository {
  constructor(private db: DB) {}

  async createForConcept(conceptId: number, input: CreateTermEntryInput) {
    const section = await this.findOrCreateLanguageSection(conceptId, input.languageCode);
    const [row] = await this.db
      .insert(termEntries)
      .values({
        languageSectionId: section.id,
        termText: input.termText,
        partOfSpeech: input.partOfSpeech ?? null,
        termType: input.termType ?? null,
        status: input.status ?? null,
        contextExample: input.contextExample ?? null,
        definitionOverride: input.definitionOverride ?? null,
        source: input.source ?? null,
      })
      .returning();
    return row;
  }

  async update(id: number, patch: UpdateTermEntryInput) {
    const [row] = await this.db
      .update(termEntries)
      .set({
        termText: patch.termText,
        partOfSpeech: patch.partOfSpeech,
        termType: patch.termType,
        status: patch.status,
        contextExample: patch.contextExample,
        definitionOverride: patch.definitionOverride,
        source: patch.source,
        updatedAt: new Date(),
      })
      .where(eq(termEntries.id, id))
      .returning();
    return row ?? null;
  }

  async deleteById(id: number) {
    const rows = await this.db.delete(termEntries).where(eq(termEntries.id, id)).returning({ id: termEntries.id });
    return rows.length > 0;
  }

  async listByConceptAndLang(conceptId: number, lang?: string) {
    const conds = [eq(languageSections.conceptId, conceptId)];
    if (lang) conds.push(eq(languageSections.languageCode, lang));
    return this.db
      .select({
        id: termEntries.id,
        languageSectionId: termEntries.languageSectionId,
        termText: termEntries.termText,
        partOfSpeech: termEntries.partOfSpeech,
        termType: termEntries.termType,
        status: termEntries.status,
        contextExample: termEntries.contextExample,
        definitionOverride: termEntries.definitionOverride,
        source: termEntries.source,
        createdAt: termEntries.createdAt,
        updatedAt: termEntries.updatedAt,
        languageCode: languageSections.languageCode,
      })
      .from(termEntries)
      .innerJoin(languageSections, eq(termEntries.languageSectionId, languageSections.id))
      .where(and(...conds));
  }

  async search(params: { q: string; lang?: string; page: number; pageSize: number }) {
    const pat = `%${params.q.trim()}%`;
    const conds = [ilike(termEntries.termText, pat)];
    if (params.lang) conds.push(eq(languageSections.languageCode, params.lang));
    const where = and(...conds);

    const totalRow = await this.db
      .select({ c: sql<number>`count(*)` })
      .from(termEntries)
      .innerJoin(languageSections, eq(termEntries.languageSectionId, languageSections.id))
      .where(where);
    const total = Number(totalRow[0]?.c ?? 0);

    const offset = (params.page - 1) * params.pageSize;
    const rows = await this.db
      .select({
        id: termEntries.id,
        termText: termEntries.termText,
        status: termEntries.status,
        termType: termEntries.termType,
        languageCode: languageSections.languageCode,
        conceptId: languageSections.conceptId,
      })
      .from(termEntries)
      .innerJoin(languageSections, eq(termEntries.languageSectionId, languageSections.id))
      .where(where)
      .limit(params.pageSize)
      .offset(offset);
    return { rows, total };
  }

  async listAllForLang(lang: string) {
    return this.db
      .select({
        conceptId: languageSections.conceptId,
        termId: termEntries.id,
        termText: termEntries.termText,
        status: termEntries.status,
      })
      .from(termEntries)
      .innerJoin(languageSections, eq(termEntries.languageSectionId, languageSections.id))
      .where(eq(languageSections.languageCode, lang));
  }

  private async findOrCreateLanguageSection(conceptId: number, languageCode: string) {
    const existing = await this.db
      .select()
      .from(languageSections)
      .where(and(eq(languageSections.conceptId, conceptId), eq(languageSections.languageCode, languageCode)))
      .limit(1);
    if (existing.length > 0) return existing[0];
    const [row] = await this.db
      .insert(languageSections)
      .values({ conceptId, languageCode })
      .returning();
    return row;
  }
}
