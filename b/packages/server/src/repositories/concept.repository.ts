import type {
  Concept,
  ConceptListItem,
  ConceptQueryInput,
  CreateConceptInput,
  TermStatus,
  TermType,
  UpdateConceptInput,
} from '@termbase/shared';
import { termStatuses, termTypes } from '@termbase/shared';
import { count, eq, ilike, or } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import type { Database } from '../db/index';
import { concepts, languageSections, termEntries } from '../db/schema/index';

function isTermType(value: string): value is TermType {
  return termTypes.some((item) => item === value);
}

function isTermStatus(value: string): value is TermStatus {
  return termStatuses.some((item) => item === value);
}

export class ConceptRepository {
  constructor(private readonly db: Database) {}

  async count() {
    const rows = await this.db.select({ value: count() }).from(concepts);
    return Number(rows[0]?.value ?? 0);
  }

  async list(query: ConceptQueryInput): Promise<{ items: ConceptListItem[]; total: number }> {
    const searchFilter = query.search
      ? or(
          ilike(concepts.definition, `%${query.search}%`),
          ilike(concepts.subjectField, `%${query.search}%`),
          ilike(concepts.note, `%${query.search}%`),
        )
      : undefined;

    const totalRows = searchFilter
      ? await this.db.select({ value: count() }).from(concepts).where(searchFilter)
      : await this.db.select({ value: count() }).from(concepts);

    const rows = await this.db.query.concepts.findMany({
      where: searchFilter,
      orderBy: (table, operators) => [operators.desc(table.createdAt)],
      limit: query.pageSize,
      offset: (query.page - 1) * query.pageSize,
      with: {
        languageSections: {
          orderBy: (table, operators) => [operators.asc(table.languageCode)],
          with: {
            termEntries: true,
          },
        },
      },
    });

    return {
      total: Number(totalRows[0]?.value ?? 0),
      items: rows.map((conceptRow) => {
        const item = {
          id: conceptRow.id,
          uuid: conceptRow.uuid,
          definition: conceptRow.definition,
          subjectField: conceptRow.subjectField,
          note: conceptRow.note,
          createdAt: conceptRow.createdAt,
          updatedAt: conceptRow.updatedAt,
          languageCodes: conceptRow.languageSections.map((section) => section.languageCode),
          termCount: conceptRow.languageSections.reduce(
            (total, section) => total + section.termEntries.length,
            0,
          ),
        } satisfies ConceptListItem;

        return item;
      }),
    };
  }

  async getById(id: number): Promise<Concept | null> {
    const conceptRow = await this.db.query.concepts.findFirst({
      where: eq(concepts.id, id),
      with: {
        languageSections: {
          orderBy: (table, operators) => [operators.asc(table.languageCode)],
          with: {
            termEntries: {
              orderBy: (table, operators) => [operators.asc(table.termText)],
            },
          },
        },
      },
    });

    if (!conceptRow) {
      return null;
    }

    return {
      id: conceptRow.id,
      uuid: conceptRow.uuid,
      definition: conceptRow.definition,
      subjectField: conceptRow.subjectField,
      note: conceptRow.note,
      createdAt: conceptRow.createdAt,
      updatedAt: conceptRow.updatedAt,
      languageSections: conceptRow.languageSections.map((section) => ({
        id: section.id,
        conceptId: section.conceptId,
        languageCode: section.languageCode,
        createdAt: section.createdAt,
          termEntries: section.termEntries.map((term) => ({
            id: term.id,
            languageSectionId: term.languageSectionId,
            termText: term.termText,
            partOfSpeech: term.partOfSpeech,
            termType: isTermType(term.termType) ? term.termType : 'variant',
            status: isTermStatus(term.status) ? term.status : 'admitted',
            contextExample: term.contextExample,
            definitionOverride: term.definitionOverride,
            source: term.source,
            createdAt: term.createdAt,
            updatedAt: term.updatedAt,
        })),
      })),
    } satisfies Concept;
  }

  async findAllDetailed() {
    const rows = await this.db.query.concepts.findMany({
      orderBy: (table, operators) => [operators.desc(table.createdAt)],
      with: {
        languageSections: {
          orderBy: (table, operators) => [operators.asc(table.languageCode)],
          with: {
            termEntries: {
              orderBy: (table, operators) => [operators.asc(table.termText)],
            },
          },
        },
      },
    });

    return Promise.all(rows.map((conceptRow) => this.getById(conceptRow.id))).then((items) =>
      items.filter((item): item is Concept => item !== null),
    );
  }

  async create(input: CreateConceptInput): Promise<Concept> {
    const conceptId = await this.db.transaction(async (tx) => {
      const [conceptRow] = await tx
        .insert(concepts)
        .values({
          uuid: randomUUID(),
          definition: input.definition,
          subjectField: input.subjectField,
          note: input.note ?? null,
        })
        .returning({ id: concepts.id });

      for (const section of input.languageSections) {
        const [languageSectionRow] = await tx
          .insert(languageSections)
          .values({
            conceptId: conceptRow.id,
            languageCode: section.languageCode,
          })
          .returning({ id: languageSections.id });

        if (section.termEntries.length > 0) {
          await tx.insert(termEntries).values(
            section.termEntries.map((term) => ({
              languageSectionId: languageSectionRow.id,
              termText: term.termText,
              partOfSpeech: term.partOfSpeech ?? null,
              termType: term.termType ?? 'fullForm',
              status: term.status ?? 'preferred',
              contextExample: term.contextExample ?? null,
              definitionOverride: term.definitionOverride ?? null,
              source: term.source ?? null,
            })),
          );
        }
      }

      return conceptRow.id;
    });

    const created = await this.getById(conceptId);
    if (!created) {
      throw new Error('Failed to load created concept');
    }

    return created;
  }

  async update(id: number, input: UpdateConceptInput): Promise<Concept | null> {
    const existing = await this.getById(id);
    if (!existing) {
      return null;
    }

    await this.db.transaction(async (tx) => {
      await tx
        .update(concepts)
        .set({
          definition: input.definition ?? existing.definition,
          subjectField: input.subjectField ?? existing.subjectField,
          note: input.note ?? existing.note,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(concepts.id, id));

      if (input.languageSections) {
        await tx.delete(languageSections).where(eq(languageSections.conceptId, id));

        for (const section of input.languageSections) {
          const [languageSectionRow] = await tx
            .insert(languageSections)
            .values({
              conceptId: id,
              languageCode: section.languageCode,
            })
            .returning({ id: languageSections.id });

          if (section.termEntries.length > 0) {
            await tx.insert(termEntries).values(
              section.termEntries.map((term) => ({
                languageSectionId: languageSectionRow.id,
                termText: term.termText,
                partOfSpeech: term.partOfSpeech ?? null,
                termType: term.termType ?? 'fullForm',
                status: term.status ?? 'preferred',
                contextExample: term.contextExample ?? null,
                definitionOverride: term.definitionOverride ?? null,
                source: term.source ?? null,
              })),
            );
          }
        }
      }
    });

    return this.getById(id);
  }

  async delete(id: number) {
    const rows = await this.db.delete(concepts).where(eq(concepts.id, id)).returning({ id: concepts.id });
    return rows.length > 0;
  }
}
