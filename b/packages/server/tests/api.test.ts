import type { CreateConceptInput, VerifyRegressionInput } from '@termbase/shared';
import { afterEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { createTestDatabaseContext } from '../src/db/testing';
import { createServiceContainer, type ServiceContainer } from '../src/services/container';

const cleanups: Array<() => Promise<void>> = [];

afterEach(async () => {
  while (cleanups.length > 0) {
    const cleanup = cleanups.pop();
    if (cleanup) {
      await cleanup();
    }
  }
});

async function createTestApp(seed = false) {
  const databaseContext = await createTestDatabaseContext();
  const services = await createServiceContainer({
    databaseContext,
  });

  if (seed) {
    await services.seedIfEmpty();
  }

  cleanups.push(() => services.close());

  return {
    app: createApp(services),
    services,
  };
}

describe('server API', () => {
  it('supports concept and term CRUD flows', async () => {
    const { app } = await createTestApp();
    const payload: CreateConceptInput = {
      definition: 'A visible action control inside a screen.',
      subjectField: 'Design Systems',
      note: 'Used in component libraries.',
      languageSections: [
        {
          languageCode: 'en',
          termEntries: [
            {
              termText: 'action button',
              termType: 'fullForm',
              status: 'preferred',
              partOfSpeech: 'noun',
            },
          ],
        },
      ],
    };

    const createResponse = await app.request('/api/v1/concepts', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const created = await createResponse.json();

    expect(createResponse.status).toBe(201);
    expect(created.data.subjectField).toBe('Design Systems');

    const conceptId = created.data.id as number;

    const createTermResponse = await app.request(`/api/v1/concepts/${conceptId}/terms`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        languageCode: 'zh-CN',
        termText: '操作按钮',
        termType: 'fullForm',
        status: 'preferred',
        partOfSpeech: '名词',
      }),
    });

    expect(createTermResponse.status).toBe(201);

    const conceptResponse = await app.request(`/api/v1/concepts/${conceptId}`);
    const concept = await conceptResponse.json();

    expect(concept.data.languageSections).toHaveLength(2);

    const zhSection = concept.data.languageSections.find((section: { languageCode: string }) => section.languageCode === 'zh-CN');
    expect(zhSection.termEntries[0].termText).toBe('操作按钮');

    const termId = zhSection.termEntries[0].id as number;

    const updateTermResponse = await app.request(`/api/v1/terms/${termId}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        termText: '主操作按钮',
        status: 'preferred',
      }),
    });

    expect(updateTermResponse.status).toBe(200);

    const deleteTermResponse = await app.request(`/api/v1/terms/${termId}`, {
      method: 'DELETE',
    });
    expect(deleteTermResponse.status).toBe(200);
  });

  it('creates regression reports with mismatches for deprecated target terms', async () => {
    const { app } = await createTestApp(true);
    const payload: VerifyRegressionInput = {
      reportName: 'deprecated target check',
      sourceLang: 'en',
      targetLang: 'zh-CN',
      sourceText: 'The user interface requires login for each telemetry event.',
      targetText: '用户接口需要登陆才能处理遥信事件。',
      matchThreshold: 0.75,
    };

    const response = await app.request('/api/v1/regression/verify', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const report = await response.json();

    expect(response.status).toBe(201);
    expect(report.data.results.length).toBeGreaterThanOrEqual(3);
    expect(report.data.results.some((result: { status: string }) => result.status === 'error')).toBe(true);
  });

  it('round-trips TBX export and import', async () => {
    const seeded = await createTestApp(true);
    const exportedResponse = await seeded.app.request('/api/v1/tbx/export');
    const xml = await exportedResponse.text();

    expect(exportedResponse.status).toBe(200);
    expect(xml).toContain('<tbx');

    const imported = await createTestApp();
    const importResponse = await imported.app.request('/api/v1/tbx/import', {
      method: 'POST',
      headers: { 'content-type': 'application/xml' },
      body: xml,
    });
    const importPayload = await importResponse.json();

    expect(importResponse.status).toBe(201);
    expect(importPayload.data.importedConcepts).toBeGreaterThanOrEqual(3);

    const listResponse = await imported.app.request('/api/v1/concepts?page=1&pageSize=10');
    const listPayload = await listResponse.json();

    expect(listPayload.meta.total).toBe(importPayload.data.importedConcepts);
  });
});
