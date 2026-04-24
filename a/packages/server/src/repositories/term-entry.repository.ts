import { eq, and, ilike, or, sql, desc } from 'drizzle-orm';
import { db, schema } from '../db/index.js';

const { termEntries, languageSections, concepts } = schema;

export const termEntryRepository = {
  async findByConceptAndLang(conceptId: number, lang?: string) {
    const conditions = [eq(languageSections.conceptId, conceptId)];
    if (lang) {
      conditions.push(eq(languageSections.languageCode, lang));
    }

    const sections = await db.select().from(languageSections)
      .where(and(...conditions));

    const sectionsWithTerms = await Promise.all(
      sections.map(async (section) => {
        const terms = await db.select().from(termEntries)
          .where(eq(termEntries.languageSectionId, section.id))
          .orderBy(desc(termEntries.createdAt));
        return { ...section, termEntries: terms };
      }),
    );

    return sectionsWithTerms;
  },

  async findById(id: number) {
    const results = await db.select().from(termEntries).where(eq(termEntries.id, id)).limit(1);
    if (results.length === 0) return null;

    const entry = results[0];
    const sectionResults = await db.select().from(languageSections)
      .where(eq(languageSections.id, entry.languageSectionId))
      .limit(1);

    if (sectionResults.length === 0) return { ...entry, languageSection: null };

    const section = sectionResults[0];
    const conceptResults = await db.select().from(concepts)
      .where(eq(concepts.id, section.conceptId))
      .limit(1);

    return {
      ...entry,
      languageSection: {
        ...section,
        concept: conceptResults[0] ?? null,
      },
    };
  },

  async search(query: string, lang?: string, page: number = 1, pageSize: number = 20) {
    const conditions = [ilike(termEntries.termText, `%${query}%`)];
    const offset = (page - 1) * pageSize;

    const allResults = await db.select().from(termEntries)
      .where(and(...conditions))
      .orderBy(desc(termEntries.createdAt));

    // Enrich with language section and concept
    const enriched = await Promise.all(
      allResults.map(async (entry) => {
        const sections = await db.select().from(languageSections)
          .where(eq(languageSections.id, entry.languageSectionId))
          .limit(1);
        const section = sections[0];
        if (!section) return { ...entry, languageSection: null };

        const conceptResults = await db.select().from(concepts)
          .where(eq(concepts.id, section.conceptId))
          .limit(1);

        return {
          ...entry,
          languageSection: {
            ...section,
            concept: conceptResults[0] ?? null,
          },
        };
      }),
    );

    const filtered = lang
      ? enriched.filter((t) => t.languageSection?.languageCode === lang)
      : enriched;

    const total = filtered.length;
    const paged = filtered.slice(offset, offset + pageSize);

    return { data: paged, total, page, pageSize };
  },

  async findOrCreateLanguageSection(conceptId: number, languageCode: string) {
    const [existing] = await db.select().from(languageSections)
      .where(and(
        eq(languageSections.conceptId, conceptId),
        eq(languageSections.languageCode, languageCode),
      ));

    if (existing) return existing;

    const [created] = await db.insert(languageSections)
      .values({ conceptId, languageCode })
      .returning();
    return created;
  },

  async create(languageSectionId: number, data: {
    termText: string;
    partOfSpeech?: string;
    termType?: string;
    status?: string;
    contextExample?: string;
    definitionOverride?: string;
    source?: string;
  }) {
    const [result] = await db.insert(termEntries)
      .values({
        languageSectionId,
        termText: data.termText,
        partOfSpeech: data.partOfSpeech ?? null,
        termType: data.termType ?? null,
        status: data.status ?? 'preferred',
        contextExample: data.contextExample ?? null,
        definitionOverride: data.definitionOverride ?? null,
        source: data.source ?? null,
      })
      .returning();
    return result;
  },

  async update(id: number, data: Record<string, unknown>) {
    const [result] = await db.update(termEntries)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(termEntries.id, id))
      .returning();
    return result;
  },

  async delete(id: number) {
    await db.delete(termEntries).where(eq(termEntries.id, id));
  },

  async findAllByLanguage(languageCode: string) {
    const sections = await db.select().from(languageSections)
      .where(eq(languageSections.languageCode, languageCode));

    if (sections.length === 0) return [];

    const sectionIds = sections.map((s) => s.id);

    const entries = await db.select().from(termEntries)
      .where(
        or(...sectionIds.map((id) => eq(termEntries.languageSectionId, id))),
      );

    // Enrich with language section info
    const sectionMap = new Map(sections.map((s) => [s.id, s]));
    return entries.map((e) => ({
      ...e,
      languageSection: {
        ...sectionMap.get(e.languageSectionId)!,
        concept: null,
      },
    }));
  },
};
