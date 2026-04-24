import { getDb } from './index.js';
import { ConceptRepository } from '../repositories/concept.repository.js';
import { TermEntryRepository } from '../repositories/term-entry.repository.js';

async function main() {
  const db = await getDb();
  const conceptRepo = new ConceptRepository(db);
  const termRepo = new TermEntryRepository(db);

  const samples = [
    {
      definition: 'The visual part of an application that a user interacts with.',
      subjectField: 'Software Engineering',
      note: 'Abbreviated as UI.',
      terms: [
        { lang: 'en', text: 'user interface', pos: 'noun', type: 'fullForm', status: 'preferred' },
        { lang: 'en', text: 'UI', pos: 'noun', type: 'acronym', status: 'admitted' },
        { lang: 'zh-CN', text: '用户界面', pos: 'noun', type: 'fullForm', status: 'preferred' },
        { lang: 'zh-CN', text: '用户接口', pos: 'noun', type: 'variant', status: 'deprecated' },
      ],
    },
    {
      definition: 'A database operation to retrieve data.',
      subjectField: 'Databases',
      note: null,
      terms: [
        { lang: 'en', text: 'query', pos: 'noun', type: 'fullForm', status: 'preferred' },
        { lang: 'zh-CN', text: '查询', pos: 'noun', type: 'fullForm', status: 'preferred' },
      ],
    },
    {
      definition: 'A structured collection of related terms for a domain.',
      subjectField: 'Terminology Management',
      note: null,
      terms: [
        { lang: 'en', text: 'termbase', pos: 'noun', type: 'fullForm', status: 'preferred' },
        { lang: 'en', text: 'terminology database', pos: 'noun', type: 'variant', status: 'admitted' },
        { lang: 'zh-CN', text: '术语库', pos: 'noun', type: 'fullForm', status: 'preferred' },
      ],
    },
  ] as const;

  for (const s of samples) {
    const c = await conceptRepo.create({
      definition: s.definition,
      subjectField: s.subjectField,
      note: s.note,
    });
    for (const t of s.terms) {
      await termRepo.createForConcept(c.id, {
        languageCode: t.lang,
        termText: t.text,
        partOfSpeech: t.pos,
        termType: t.type as any,
        status: t.status as any,
        contextExample: null,
        definitionOverride: null,
        source: null,
      });
    }
  }
  // eslint-disable-next-line no-console
  console.log(`Seeded ${samples.length} concepts with terms.`);
  process.exit(0);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
