import "dotenv/config";

import { getDb } from "../db";
import { concepts } from "../db/schema/concepts";
import { languageSections } from "../db/schema/language-sections";
import { termEntries } from "../db/schema/term-entries";

async function main() {
  const db = getDb();

  const seedConcepts = [
    {
      definition: "The visual layout and controls through which users interact with software.",
      subjectField: "software",
      note: "Core UX term",
      entries: [
        {
          languageCode: "en",
          terms: [
            { termText: "user interface", status: "preferred", termType: "fullForm", partOfSpeech: "noun" },
            { termText: "UI", status: "admitted", termType: "acronym", partOfSpeech: "noun" },
          ],
        },
        {
          languageCode: "zh-CN",
          terms: [
            { termText: "用户界面", status: "preferred", termType: "fullForm", partOfSpeech: "noun" },
            { termText: "用户接口", status: "deprecated", termType: "variant", partOfSpeech: "noun" },
          ],
        },
      ],
    },
    {
      definition: "A process of checking software quality against requirements.",
      subjectField: "software-testing",
      note: "QA term",
      entries: [
        {
          languageCode: "en",
          terms: [
            { termText: "quality assurance", status: "preferred", termType: "fullForm", partOfSpeech: "noun" },
            { termText: "QA", status: "admitted", termType: "acronym", partOfSpeech: "noun" },
          ],
        },
        {
          languageCode: "zh-CN",
          terms: [
            { termText: "质量保证", status: "preferred", termType: "fullForm", partOfSpeech: "noun" },
            { termText: "品质保障", status: "admitted", termType: "variant", partOfSpeech: "noun" },
          ],
        },
      ],
    },
    {
      definition: "A staged deployment strategy that gradually shifts users to a new release.",
      subjectField: "devops",
      note: "Release strategy",
      entries: [
        {
          languageCode: "en",
          terms: [
            { termText: "canary release", status: "preferred", termType: "fullForm", partOfSpeech: "noun" },
            { termText: "canary deployment", status: "admitted", termType: "variant", partOfSpeech: "noun" },
          ],
        },
        {
          languageCode: "zh-CN",
          terms: [
            { termText: "金丝雀发布", status: "preferred", termType: "fullForm", partOfSpeech: "noun" },
            { termText: "灰度发布", status: "admitted", termType: "variant", partOfSpeech: "noun" },
          ],
        },
      ],
    },
  ] as const;

  for (const conceptSeed of seedConcepts) {
    const [concept] = await db
      .insert(concepts)
      .values({
        definition: conceptSeed.definition,
        subjectField: conceptSeed.subjectField,
        note: conceptSeed.note,
      })
      .returning();

    for (const sectionSeed of conceptSeed.entries) {
      const [section] = await db
        .insert(languageSections)
        .values({
          conceptId: concept.id,
          languageCode: sectionSeed.languageCode,
        })
        .returning();

      await db.insert(termEntries).values(
        sectionSeed.terms.map((term) => ({
          languageSectionId: section.id,
          termText: term.termText,
          status: term.status,
          termType: term.termType,
          partOfSpeech: term.partOfSpeech,
        })),
      );
    }
  }
}

main()
  .then(() => {
    // eslint-disable-next-line no-console
    console.log("Seed completed.");
    process.exit(0);
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  });
