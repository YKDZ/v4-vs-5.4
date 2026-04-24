import { eq, ilike, or, sql, desc } from 'drizzle-orm';
import { db, schema } from '../db/index.js';

const { concepts, languageSections, termEntries } = schema;

export const conceptRepository = {
  async findAll(page: number = 1, pageSize: number = 20, search?: string) {
    const conditions = search
      ? or(
          ilike(concepts.definition, `%${search}%`),
          ilike(concepts.subjectField, `%${search}%`),
          ilike(concepts.note, `%${search}%`),
        )
      : undefined;

    const offset = (page - 1) * pageSize;

    const [data, countResult] = await Promise.all([
      db.select().from(concepts)
        .where(conditions)
        .limit(pageSize)
        .offset(offset)
        .orderBy(desc(concepts.updatedAt)),
      db.select({ count: sql<number>`count(*)::int` }).from(concepts).where(conditions),
    ]);

    // Load relations separately to avoid drizzle query API issues
    const conceptsWithRelations = await Promise.all(
      data.map(async (concept) => {
        const sections = await db.select().from(languageSections)
          .where(eq(languageSections.conceptId, concept.id));

        const sectionsWithTerms = await Promise.all(
          sections.map(async (section) => {
            const terms = await db.select().from(termEntries)
              .where(eq(termEntries.languageSectionId, section.id))
              .orderBy(desc(termEntries.createdAt));
            return { ...section, termEntries: terms };
          }),
        );

        return { ...concept, languageSections: sectionsWithTerms };
      }),
    );

    return {
      data: conceptsWithRelations,
      total: countResult[0]?.count ?? 0,
      page,
      pageSize,
    };
  },

  async findById(id: number) {
    const results = await db.select().from(concepts).where(eq(concepts.id, id)).limit(1);
    if (results.length === 0) return null;

    const concept = results[0];
    const sections = await db.select().from(languageSections)
      .where(eq(languageSections.conceptId, concept.id));

    const sectionsWithTerms = await Promise.all(
      sections.map(async (section) => {
        const terms = await db.select().from(termEntries)
          .where(eq(termEntries.languageSectionId, section.id))
          .orderBy(desc(termEntries.createdAt));
        return { ...section, termEntries: terms };
      }),
    );

    return { ...concept, languageSections: sectionsWithTerms };
  },

  async findByUuid(uuid: string) {
    const results = await db.select().from(concepts).where(eq(concepts.uuid, uuid)).limit(1);
    if (results.length === 0) return null;

    const concept = results[0];
    const sections = await db.select().from(languageSections)
      .where(eq(languageSections.conceptId, concept.id));

    const sectionsWithTerms = await Promise.all(
      sections.map(async (section) => {
        const terms = await db.select().from(termEntries)
          .where(eq(termEntries.languageSectionId, section.id))
          .orderBy(desc(termEntries.createdAt));
        return { ...section, termEntries: terms };
      }),
    );

    return { ...concept, languageSections: sectionsWithTerms };
  },

  async create(data: { definition?: string; subjectField?: string; note?: string }) {
    const [result] = await db.insert(concepts).values({
      definition: data.definition ?? null,
      subjectField: data.subjectField ?? null,
      note: data.note ?? null,
    }).returning();
    return result;
  },

  async update(id: number, data: { definition?: string | null; subjectField?: string | null; note?: string | null }) {
    const [result] = await db.update(concepts)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(concepts.id, id))
      .returning();
    return result;
  },

  async delete(id: number) {
    await db.delete(concepts).where(eq(concepts.id, id));
  },
};
