import type { CreateConceptInput } from '@termbase/shared';

export const seedConcepts: CreateConceptInput[] = [
  {
    definition: 'The visual and interactive layer through which a user interacts with software.',
    subjectField: 'User Experience',
    note: 'Includes primary preferred and admitted variants.',
    languageSections: [
      {
        languageCode: 'en',
        termEntries: [
          { termText: 'user interface', termType: 'fullForm', status: 'preferred', partOfSpeech: 'noun' },
          { termText: 'UI', termType: 'acronym', status: 'admitted', partOfSpeech: 'noun' },
        ],
      },
      {
        languageCode: 'zh-CN',
        termEntries: [
          { termText: '用户界面', termType: 'fullForm', status: 'preferred', partOfSpeech: '名词' },
          { termText: '界面层', termType: 'variant', status: 'admitted', partOfSpeech: '名词' },
          { termText: '用户接口', termType: 'variant', status: 'deprecated', partOfSpeech: '名词' },
        ],
      },
      {
        languageCode: 'ja',
        termEntries: [
          { termText: 'ユーザーインターフェース', termType: 'fullForm', status: 'preferred', partOfSpeech: '名詞' },
          { termText: 'UI', termType: 'acronym', status: 'admitted', partOfSpeech: '名詞' },
        ],
      },
    ],
  },
  {
    definition: 'A software feature that authenticates users before granting access.',
    subjectField: 'Security',
    note: 'Authentication-related controlled terminology.',
    languageSections: [
      {
        languageCode: 'en',
        termEntries: [
          { termText: 'login', termType: 'fullForm', status: 'preferred', partOfSpeech: 'noun' },
          { termText: 'sign in', termType: 'variant', status: 'admitted', partOfSpeech: 'verb' },
        ],
      },
      {
        languageCode: 'zh-CN',
        termEntries: [
          { termText: '登录', termType: 'fullForm', status: 'preferred', partOfSpeech: '动词' },
          { termText: '登入', termType: 'variant', status: 'admitted', partOfSpeech: '动词' },
          { termText: '登陆', termType: 'variant', status: 'deprecated', partOfSpeech: '动词' },
        ],
      },
      {
        languageCode: 'fr',
        termEntries: [
          { termText: 'connexion', termType: 'fullForm', status: 'preferred', partOfSpeech: 'nom' },
          { termText: 'se connecter', termType: 'variant', status: 'admitted', partOfSpeech: 'verbe' },
        ],
      },
    ],
  },
  {
    definition: 'A measurable event collected to observe system behavior and performance.',
    subjectField: 'Observability',
    note: 'Used in product analytics and telemetry.',
    languageSections: [
      {
        languageCode: 'en',
        termEntries: [
          { termText: 'telemetry event', termType: 'fullForm', status: 'preferred', partOfSpeech: 'noun' },
          { termText: 'event signal', termType: 'variant', status: 'admitted', partOfSpeech: 'noun' },
        ],
      },
      {
        languageCode: 'zh-CN',
        termEntries: [
          { termText: '遥测事件', termType: 'fullForm', status: 'preferred', partOfSpeech: '名词' },
          { termText: '监测事件', termType: 'variant', status: 'admitted', partOfSpeech: '名词' },
          { termText: '遥信事件', termType: 'variant', status: 'deprecated', partOfSpeech: '名词' },
        ],
      },
      {
        languageCode: 'de',
        termEntries: [
          { termText: 'Telemetrieereignis', termType: 'fullForm', status: 'preferred', partOfSpeech: 'Substantiv' },
          { termText: 'Ereignissignal', termType: 'variant', status: 'admitted', partOfSpeech: 'Substantiv' },
        ],
      },
    ],
  },
];
