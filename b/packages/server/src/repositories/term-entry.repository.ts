import type { CreateTermEntryInput, UpdateTermEntryInput } from '@termbase/shared';
import { and, count, eq, ilike } from 'drizzle-orm';
import type { Database } from '../db/index';
import { concepts, languageSections, termEntries } from '../db/schema/index';

export class TermEntryRepository {
  constructor(private readonly db: Database) {}

  async listByConceptId(conceptId: number, languageCode?: string) {
    const sections = await this.db.query.languageSections.findMany({
      where: languageCode
        ? and(eq(languageSections.conceptId, conceptId), eq(languageSections.languageCode, languageCode))
        : eq(languageSections.conceptId, conceptId),
      orderBy: (table, operators) => [operators.asc(table.languageCode)],
      with: {
        termEntries: {
          orderBy: (table, operators) => [operators.asc(table.termText)],
        },
      },
    });

    return sections.map((section) => ({
      id: section.id,
      conceptId: section.conceptId,
      languageCode: section.languageCode,
      createdAt: section.createdAt,
      termEntries: section.termEntries.map((term) => ({
        id: term.id,
        languageSectionId: term.languageSectionId,
        termText: term.termText,
        partOfSpeech: term.partOfSpeech,
        termType: term.termType,
        status: term.status,
        contextExample: term.contextExample,
        definitionOverride: term.definitionOverride,
        source: term.source,
        createdAt: term.createdAt,
        updatedAt: term.updatedAt,
      })),
    }));
  }

  async create(conceptId: number, input: CreateTermEntryInput) {
    return this.db.transaction(async (tx) => {
      const concept = await tx.query.concepts.findFirst({ where: eq(concepts.id, conceptId) });
      if (!concept) {
        return null;
      }

      let section = await tx.query.languageSections.findFirst({
        where: and(
          eq(languageSections.conceptId, conceptId),
          eq(languageSections.languageCode, input.languageCode),
        ),
      });

      if (!section) {
        [section] = await tx
          .insert(languageSections)
          .values({
            conceptId,
            languageCode: input.languageCode,
          })
          .returning();
      }

      const [term] = await tx
        .insert(termEntries)
        .values({
          languageSectionId: section.id,
          termText: input.termText,
          partOfSpeech: input.partOfSpeech ?? null,
          termType: input.termType ?? 'fullForm',
          status: input.status ?? 'preferred',
          contextExample: input.contextExample ?? null,
          definitionOverride: input.definitionOverride ?? null,
          source: input.source ?? null,
        })
        .returning();

      return term;
    });
  }

  async update(id: number, input: UpdateTermEntryInput) {
    const [term] = await this.db
      .update(termEntries)
      .set({
        termText: input.termText,
        partOfSpeech: input.partOfSpeech,
        termType: input.termType,
        status: input.status,
        contextExample: input.contextExample,
        definitionOverride: input.definitionOverride,
        source: input.source,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(termEntries.id, id))
      .returning();

    return term ?? null;
  }

  async delete(id: number) {
    const rows = await this.db.delete(termEntries).where(eq(termEntries.id, id)).returning({ id: termEntries.id });
    return rows.length > 0;
  }

  async search(query: { q: string; lang?: string; page: number; pageSize: number }) {
    const whereClause = query.lang
      ? and(ilike(termEntries.termText, `%${query.q}%`), eq(languageSections.languageCode, query.lang))
      : ilike(termEntries.termText, `%${query.q}%`);

    const totalRows = await this.db
      .select({ value: count() })
      .from(termEntries)
      .innerJoin(languageSections, eq(termEntries.languageSectionId, languageSections.id))
      .where(whereClause);

    const rows = await this.db
      .select({
        id: termEntries.id,
        termText: termEntries.termText,
        termType: termEntries.termType,
        status: termEntries.status,
        conceptId: languageSections.conceptId,
        languageCode: languageSections.languageCode,
        conceptDefinition: concepts.definition,
        subjectField: concepts.subjectField,
      })
      .from(termEntries)
      .innerJoin(languageSections, eq(termEntries.languageSectionId, languageSections.id))
      .innerJoin(concepts, eq(languageSections.conceptId, concepts.id))
      .where(whereClause)
      .limit(query.pageSize)
      .offset((query.page - 1) * query.pageSize);

    return {
      items: rows,
      total: Number(totalRows[0]?.value ?? 0),
    };
  }
}
