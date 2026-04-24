import type {
  CreateTermEntryInput,
  TermSearchQueryInput,
  UpdateTermEntryInput,
} from "@termbase/shared";
import { and, asc, eq, ilike } from "drizzle-orm";

import { languageSections } from "../db/schema/language-sections";
import { termEntries } from "../db/schema/term-entries";
import type { NodeDatabase } from "../types/database";

function toIso(value: Date): string {
  return value.toISOString();
}

export interface SourceTargetTermPair {
  conceptId: number;
  sourceTerm: string;
  expectedTerm: string | null;
  deprecatedTerms: string[];
}

function pickExpectedTerm(
  entries: Array<{ termText: string; status: string }>,
): string | null {
  const preferred = entries.find((entry) => entry.status === "preferred");
  if (preferred) {
    return preferred.termText;
  }

  const admitted = entries.find((entry) => entry.status === "admitted");
  if (admitted) {
    return admitted.termText;
  }

  return null;
}

export class TermEntryRepository {
  constructor(private readonly db: NodeDatabase) {}

  async listByConceptAndLanguage(conceptId: number, languageCode: string) {
    const section = await this.db.query.languageSections.findFirst({
      where: and(
        eq(languageSections.conceptId, conceptId),
        eq(languageSections.languageCode, languageCode),
      ),
      with: {
        termEntries: true,
      },
    });

    if (!section) {
      return [];
    }

    return section.termEntries
      .sort((a, b) => a.termText.localeCompare(b.termText))
      .map((entry) => ({
        ...entry,
        createdAt: toIso(entry.createdAt),
        updatedAt: toIso(entry.updatedAt),
      }));
  }

  private async findOrCreateLanguageSection(conceptId: number, languageCode: string) {
    const existing = await this.db.query.languageSections.findFirst({
      where: and(
        eq(languageSections.conceptId, conceptId),
        eq(languageSections.languageCode, languageCode),
      ),
    });

    if (existing) {
      return existing;
    }

    const [created] = await this.db
      .insert(languageSections)
      .values({
        conceptId,
        languageCode,
      })
      .returning();
    return created;
  }

  async create(conceptId: number, payload: CreateTermEntryInput) {
    const section = await this.findOrCreateLanguageSection(conceptId, payload.languageCode);

    const [created] = await this.db
      .insert(termEntries)
      .values({
        languageSectionId: section.id,
        termText: payload.termText,
        partOfSpeech: payload.partOfSpeech,
        termType: payload.termType,
        status: payload.status ?? "preferred",
        contextExample: payload.contextExample,
        definitionOverride: payload.definitionOverride,
        source: payload.source,
      })
      .returning();

    return {
      ...created,
      createdAt: toIso(created.createdAt),
      updatedAt: toIso(created.updatedAt),
    };
  }

  async update(id: number, payload: UpdateTermEntryInput) {
    const [updated] = await this.db
      .update(termEntries)
      .set({
        termText: payload.termText,
        partOfSpeech: payload.partOfSpeech,
        termType: payload.termType,
        status: payload.status,
        contextExample: payload.contextExample,
        definitionOverride: payload.definitionOverride,
        source: payload.source,
        updatedAt: new Date(),
      })
      .where(eq(termEntries.id, id))
      .returning();

    if (!updated) {
      return null;
    }

    return {
      ...updated,
      createdAt: toIso(updated.createdAt),
      updatedAt: toIso(updated.updatedAt),
    };
  }

  async delete(id: number): Promise<boolean> {
    const deleted = await this.db
      .delete(termEntries)
      .where(eq(termEntries.id, id))
      .returning({ id: termEntries.id });
    return deleted.length > 0;
  }

  async search(query: TermSearchQueryInput) {
    const rows = await this.db
      .select({
        id: termEntries.id,
        conceptId: languageSections.conceptId,
        languageCode: languageSections.languageCode,
        termText: termEntries.termText,
        status: termEntries.status,
      })
      .from(termEntries)
      .innerJoin(languageSections, eq(termEntries.languageSectionId, languageSections.id))
      .where(
        query.lang
          ? and(
              ilike(termEntries.termText, `%${query.q}%`),
              eq(languageSections.languageCode, query.lang),
            )
          : ilike(termEntries.termText, `%${query.q}%`),
      )
      .orderBy(asc(termEntries.termText))
      .limit(100);

    return rows;
  }

  async getSourceTargetTermPairs(
    sourceLang: string,
    targetLang: string,
  ): Promise<SourceTargetTermPair[]> {
    const sourceSections = await this.db.query.languageSections.findMany({
      where: eq(languageSections.languageCode, sourceLang),
      with: {
        termEntries: true,
      },
    });

    const targetSections = await this.db.query.languageSections.findMany({
      where: eq(languageSections.languageCode, targetLang),
      with: {
        termEntries: true,
      },
    });

    const targetByConcept = new Map<number, typeof targetSections[number]>();
    for (const section of targetSections) {
      targetByConcept.set(section.conceptId, section);
    }

    const pairs: SourceTargetTermPair[] = [];
    for (const sourceSection of sourceSections) {
      const sourceTerms = sourceSection.termEntries.filter(
        (entry) => entry.status !== "deprecated",
      );
      const targetSection = targetByConcept.get(sourceSection.conceptId);
      const targetTerms = targetSection?.termEntries ?? [];
      const expectedTerm = pickExpectedTerm(targetTerms);
      const deprecatedTerms = targetTerms
        .filter((entry) => entry.status === "deprecated")
        .map((entry) => entry.termText);

      for (const sourceTerm of sourceTerms) {
        pairs.push({
          conceptId: sourceSection.conceptId,
          sourceTerm: sourceTerm.termText,
          expectedTerm,
          deprecatedTerms,
        });
      }
    }

    return pairs;
  }
}
