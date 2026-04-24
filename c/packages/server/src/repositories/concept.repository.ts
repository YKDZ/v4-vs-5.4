import { and, eq, ilike, or, sql, desc } from 'drizzle-orm';
import type { DB } from '../db/index.js';
import { concepts, languageSections, termEntries } from '../db/schema/index.js';

export class ConceptRepository {
  constructor(private db: DB) {}

  async create(input: { definition?: string | null; subjectField?: string | null; note?: string | null }) {
    const [row] = await this.db
      .insert(concepts)
      .values({
        definition: input.definition ?? null,
        subjectField: input.subjectField ?? null,
        note: input.note ?? null,
      })
      .returning();
    return row;
  }

  async update(id: number, patch: { definition?: string | null; subjectField?: string | null; note?: string | null }) {
    const [row] = await this.db
      .update(concepts)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(concepts.id, id))
      .returning();
    return row ?? null;
  }

  async deleteById(id: number) {
    const rows = await this.db.delete(concepts).where(eq(concepts.id, id)).returning({ id: concepts.id });
    return rows.length > 0;
  }

  async getWithDetails(id: number) {
    return (this.db as any).query.concepts.findFirst({
      where: eq(concepts.id, id),
      with: {
        languageSections: {
          with: { termEntries: true },
        },
      },
    });
  }

  async list(params: { page: number; pageSize: number; q?: string; lang?: string }) {
    const { page, pageSize, q, lang } = params;
    const offset = (page - 1) * pageSize;

    const where = this.buildListWhere(q, lang);

    const totalRow = await this.db
      .select({ c: sql<number>`count(distinct ${concepts.id})` })
      .from(concepts)
      .leftJoin(languageSections, eq(languageSections.conceptId, concepts.id))
      .leftJoin(termEntries, eq(termEntries.languageSectionId, languageSections.id))
      .where(where);
    const total = Number(totalRow[0]?.c ?? 0);

    const rows = await this.db
      .selectDistinct({
        id: concepts.id,
        uuid: concepts.uuid,
        definition: concepts.definition,
        subjectField: concepts.subjectField,
        note: concepts.note,
        createdAt: concepts.createdAt,
        updatedAt: concepts.updatedAt,
      })
      .from(concepts)
      .leftJoin(languageSections, eq(languageSections.conceptId, concepts.id))
      .leftJoin(termEntries, eq(termEntries.languageSectionId, languageSections.id))
      .where(where)
      .orderBy(desc(concepts.id))
      .limit(pageSize)
      .offset(offset);

    return { rows, total };
  }

  private buildListWhere(q?: string, lang?: string) {
    const conds = [] as any[];
    if (q && q.trim()) {
      const pat = `%${q.trim()}%`;
      conds.push(
        or(
          ilike(concepts.definition, pat),
          ilike(concepts.subjectField, pat),
          ilike(concepts.note, pat),
          ilike(termEntries.termText, pat),
        ),
      );
    }
    if (lang && lang.trim()) {
      conds.push(eq(languageSections.languageCode, lang.trim()));
    }
    if (conds.length === 0) return undefined;
    return and(...conds);
  }

  async findOrCreateLanguageSection(conceptId: number, languageCode: string) {
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

  async exists(id: number): Promise<boolean> {
    const rows = await this.db.select({ id: concepts.id }).from(concepts).where(eq(concepts.id, id)).limit(1);
    return rows.length > 0;
  }
}
