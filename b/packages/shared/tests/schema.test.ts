import { describe, expect, it } from 'vitest';
import { createConceptSchema, createTermEntrySchema, verifyRegressionSchema } from '../src/index';

describe('shared schemas', () => {
  it('normalizes concept payloads', () => {
    const payload = createConceptSchema.parse({
      definition: '  User interface  ',
      subjectField: ' UX ',
      note: ' ',
      languageSections: [
        {
          languageCode: 'en',
          termEntries: [
            {
              termText: ' User interface ',
              termType: 'fullForm',
              status: 'preferred',
            },
          ],
        },
      ],
    });

    expect(payload.definition).toBe('User interface');
    expect(payload.subjectField).toBe('UX');
    expect(payload.note).toBeNull();
  });

  it('requires a language code for term creation', () => {
    expect(() =>
      createTermEntrySchema.parse({
        languageCode: 'english',
        termText: 'interface',
        termType: 'fullForm',
        status: 'preferred',
      }),
    ).toThrow();
  });

  it('accepts regression thresholds within bounds', () => {
    const payload = verifyRegressionSchema.parse({
      reportName: 'manual regression',
      sourceText: 'user interface',
      targetText: '用户界面',
      sourceLang: 'en',
      targetLang: 'zh-CN',
      matchThreshold: 0.8,
    });

    expect(payload.matchThreshold).toBe(0.8);
  });
});
