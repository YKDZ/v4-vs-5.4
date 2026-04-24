import 'dotenv/config';
import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { pushSchema } from './push-schema.js';
import * as schema from './schema/index.js';

const { concepts, languageSections, termEntries } = schema;

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

async function seed() {
  console.log('Pushing schema...');
  await pushSchema();

  // Clear existing data
  await db.delete(schema.regressionResults);
  await db.delete(schema.regressionReports);
  await db.delete(schema.termEntries);
  await db.delete(schema.languageSections);
  await db.delete(schema.concepts);

  console.log('Seeding concepts...');

  // Concept 1: User Interface
  const [ui] = await db.insert(concepts).values({
    definition: 'The means by which a user interacts with a computer system',
    subjectField: 'computer science',
    note: 'Core concept in human-computer interaction',
  }).returning();

  const [uiEn] = await db.insert(languageSections).values({
    conceptId: ui.id,
    languageCode: 'en',
  }).returning();

  const [uiZh] = await db.insert(languageSections).values({
    conceptId: ui.id,
    languageCode: 'zh-CN',
  }).returning();

  const [uiJa] = await db.insert(languageSections).values({
    conceptId: ui.id,
    languageCode: 'ja',
  }).returning();

  await db.insert(termEntries).values([
    { languageSectionId: uiEn.id, termText: 'user interface', status: 'preferred', partOfSpeech: 'noun', termType: 'fullForm' },
    { languageSectionId: uiEn.id, termText: 'UI', status: 'admitted', partOfSpeech: 'noun', termType: 'acronym' },
    { languageSectionId: uiZh.id, termText: '用户界面', status: 'preferred', partOfSpeech: 'noun', termType: 'fullForm' },
    { languageSectionId: uiZh.id, termText: '人机界面', status: 'admitted', partOfSpeech: 'noun', termType: 'variant' },
    { languageSectionId: uiJa.id, termText: 'ユーザーインターフェース', status: 'preferred', partOfSpeech: 'noun', termType: 'fullForm' },
    { languageSectionId: uiJa.id, termText: 'UI', status: 'admitted', partOfSpeech: 'noun', termType: 'acronym' },
  ]);

  // Concept 2: Algorithm
  const [algo] = await db.insert(concepts).values({
    definition: 'A step-by-step procedure for solving a problem',
    subjectField: 'computer science',
    note: 'Fundamental concept in programming',
  }).returning();

  const [algoEn] = await db.insert(languageSections).values({
    conceptId: algo.id,
    languageCode: 'en',
  }).returning();

  const [algoZh] = await db.insert(languageSections).values({
    conceptId: algo.id,
    languageCode: 'zh-CN',
  }).returning();

  await db.insert(termEntries).values([
    { languageSectionId: algoEn.id, termText: 'algorithm', status: 'preferred', partOfSpeech: 'noun', termType: 'fullForm' },
    { languageSectionId: algoZh.id, termText: '算法', status: 'preferred', partOfSpeech: 'noun', termType: 'fullForm' },
    { languageSectionId: algoZh.id, termText: '演算法', status: 'admitted', partOfSpeech: 'noun', termType: 'variant' },
  ]);

  // Concept 3: Database
  const [dbC] = await db.insert(concepts).values({
    definition: 'An organized collection of structured data',
    subjectField: 'computer science',
    note: '',
  }).returning();

  const [dbEn] = await db.insert(languageSections).values({
    conceptId: dbC.id,
    languageCode: 'en',
  }).returning();

  const [dbZh] = await db.insert(languageSections).values({
    conceptId: dbC.id,
    languageCode: 'zh-CN',
  }).returning();

  await db.insert(termEntries).values([
    { languageSectionId: dbEn.id, termText: 'database', status: 'preferred', partOfSpeech: 'noun', termType: 'fullForm' },
    { languageSectionId: dbEn.id, termText: 'DB', status: 'admitted', partOfSpeech: 'noun', termType: 'acronym' },
    { languageSectionId: dbZh.id, termText: '数据库', status: 'preferred', partOfSpeech: 'noun', termType: 'fullForm' },
    { languageSectionId: dbZh.id, termText: '资料库', status: 'deprecated', partOfSpeech: 'noun', termType: 'variant' },
  ]);

  // Concept 4: Regression
  const [reg] = await db.insert(concepts).values({
    definition: 'A statistical method to determine the relationship between variables, or return to a previous state after changes',
    subjectField: 'software engineering',
    note: 'Has two distinct meanings in software context',
  }).returning();

  const [regEn] = await db.insert(languageSections).values({
    conceptId: reg.id,
    languageCode: 'en',
  }).returning();

  const [regZh] = await db.insert(languageSections).values({
    conceptId: reg.id,
    languageCode: 'zh-CN',
  }).returning();

  await db.insert(termEntries).values([
    { languageSectionId: regEn.id, termText: 'regression', status: 'preferred', partOfSpeech: 'noun', termType: 'fullForm' },
    { languageSectionId: regEn.id, termText: 'regression testing', status: 'preferred', partOfSpeech: 'noun', termType: 'fullForm' },
    { languageSectionId: regZh.id, termText: '回归', status: 'preferred', partOfSpeech: 'noun', termType: 'fullForm' },
    { languageSectionId: regZh.id, termText: '回归测试', status: 'preferred', partOfSpeech: 'noun', termType: 'fullForm' },
  ]);

  // Concept 5: Machine Learning
  const [ml] = await db.insert(concepts).values({
    definition: 'A subset of artificial intelligence that enables systems to learn from data',
    subjectField: 'artificial intelligence',
  }).returning();

  const [mlEn] = await db.insert(languageSections).values({
    conceptId: ml.id,
    languageCode: 'en',
  }).returning();

  const [mlZh] = await db.insert(languageSections).values({
    conceptId: ml.id,
    languageCode: 'zh-CN',
  }).returning();

  const [mlJa] = await db.insert(languageSections).values({
    conceptId: ml.id,
    languageCode: 'ja',
  }).returning();

  await db.insert(termEntries).values([
    { languageSectionId: mlEn.id, termText: 'machine learning', status: 'preferred', partOfSpeech: 'noun', termType: 'fullForm' },
    { languageSectionId: mlEn.id, termText: 'ML', status: 'admitted', partOfSpeech: 'noun', termType: 'acronym' },
    { languageSectionId: mlZh.id, termText: '机器学习', status: 'preferred', partOfSpeech: 'noun', termType: 'fullForm' },
    { languageSectionId: mlZh.id, termText: '机械学习', status: 'deprecated', partOfSpeech: 'noun', termType: 'variant' },
    { languageSectionId: mlJa.id, termText: '機械学習', status: 'preferred', partOfSpeech: 'noun', termType: 'fullForm' },
    { languageSectionId: mlJa.id, termText: 'マシンラーニング', status: 'admitted', partOfSpeech: 'noun', termType: 'variant' },
  ]);

  // Concept 6: Framework
  const [fw] = await db.insert(concepts).values({
    definition: 'A reusable software environment that provides functionality as part of a larger software platform',
    subjectField: 'software engineering',
  }).returning();

  const [fwEn] = await db.insert(languageSections).values({
    conceptId: fw.id,
    languageCode: 'en',
  }).returning();

  const [fwZh] = await db.insert(languageSections).values({
    conceptId: fw.id,
    languageCode: 'zh-CN',
  }).returning();

  await db.insert(termEntries).values([
    { languageSectionId: fwEn.id, termText: 'framework', status: 'preferred', partOfSpeech: 'noun', termType: 'fullForm' },
    { languageSectionId: fwZh.id, termText: '框架', status: 'preferred', partOfSpeech: 'noun', termType: 'fullForm' },
    { languageSectionId: fwZh.id, termText: '架构', status: 'admitted', partOfSpeech: 'noun', termType: 'variant' },
  ]);

  console.log('Seed complete! Created concepts:');
  console.log(`  - UI (en, zh-CN, ja) - 6 term entries`);
  console.log(`  - Algorithm (en, zh-CN) - 3 term entries`);
  console.log(`  - Database (en, zh-CN) - 4 term entries`);
  console.log(`  - Regression (en, zh-CN) - 4 term entries`);
  console.log(`  - Machine Learning (en, zh-CN, ja) - 6 term entries`);
  console.log(`  - Framework (en, zh-CN) - 3 term entries`);
  console.log(`Total: 6 concepts, 26 term entries`);

  await pool.end();
}

seed().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
