import type { ConceptListQueryInput, CreateConceptInput, UpdateConceptInput } from "@termbase/shared";
import { count, desc, ilike, or, eq } from "drizzle-orm";

import { type NodeDatabase } from "../types/database";
import { concepts } from "../db/schema/concepts";

function toIso(value: Date): string {
  return value.toISOString();
}

export class ConceptRepository {
  constructor(private readonly db: NodeDatabase) {}

  async list(query: ConceptListQueryInput) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const offset = (page - 1) * pageSize;

    const whereClause = query.q
      ? or(
          ilike(concepts.definition, `%${query.q}%`),
          ilike(concepts.subjectField, `%${query.q}%`),
          ilike(concepts.note, `%${query.q}%`),
        )
      : undefined;

    const rows = await this.db
      .select()
      .from(concepts)
      .where(whereClause)
      .orderBy(desc(concepts.updatedAt))
      .limit(pageSize)
      .offset(offset);

    const totalResult = await this.db
      .select({ value: count() })
      .from(concepts)
      .where(whereClause);

    return {
      items: rows.map((item) => ({
        ...item,
        createdAt: toIso(item.createdAt),
        updatedAt: toIso(item.updatedAt),
      })),
      total: Number(totalResult[0]?.value ?? 0),
    };
  }

  async getById(id: number) {
    const row = await this.db.query.concepts.findFirst({
      where: eq(concepts.id, id),
      with: {
        languageSections: {
          with: {
            termEntries: true,
          },
        },
      },
    });

    if (!row) {
      return null;
    }

    return {
      ...row,
      createdAt: toIso(row.createdAt),
      updatedAt: toIso(row.updatedAt),
      languageSections: row.languageSections.map((section) => ({
        ...section,
        createdAt: toIso(section.createdAt),
        termEntries: section.termEntries.map((term) => ({
          ...term,
          createdAt: toIso(term.createdAt),
          updatedAt: toIso(term.updatedAt),
        })),
      })),
    };
  }

  async create(payload: CreateConceptInput) {
    const [created] = await this.db
      .insert(concepts)
      .values({
        definition: payload.definition,
        subjectField: payload.subjectField,
        note: payload.note,
      })
      .returning();

    return {
      ...created,
      createdAt: toIso(created.createdAt),
      updatedAt: toIso(created.updatedAt),
    };
  }

  async update(id: number, payload: UpdateConceptInput) {
    const [updated] = await this.db
      .update(concepts)
      .set({
        definition: payload.definition,
        subjectField: payload.subjectField,
        note: payload.note,
        updatedAt: new Date(),
      })
      .where(eq(concepts.id, id))
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

  async delete(id: number) {
    const deletedRows = await this.db
      .delete(concepts)
      .where(eq(concepts.id, id))
      .returning({ id: concepts.id });
    return deletedRows.length > 0;
  }

  async exists(id: number): Promise<boolean> {
    const row = await this.db
      .select({ id: concepts.id })
      .from(concepts)
      .where(eq(concepts.id, id))
      .limit(1);
    return row.length > 0;
  }
}
