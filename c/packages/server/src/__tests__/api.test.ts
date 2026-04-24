import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createApp } from '../app.js';
import { closeDb, getDb } from '../db/index.js';

let app: ReturnType<typeof createApp>;

async function j<T = any>(res: Response): Promise<T> {
  return (await res.json()) as T;
}

beforeAll(async () => {
  // Force fresh in-memory pglite for the test run
  delete process.env.DATABASE_URL;
  delete process.env.PGLITE_DATA_DIR;
  const db = await getDb();
  app = createApp(db);
});

afterAll(async () => {
  await closeDb();
});

async function call(path: string, init?: RequestInit) {
  return app.request(path, init);
}

describe('Termbase API integration', () => {
  let conceptId = 0;

  it('creates a concept', async () => {
    const res = await call('/api/v1/concepts', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        definition: 'Visual interface of an app.',
        subjectField: 'Software',
      }),
    });
    expect(res.status).toBe(201);
    const body = await j(res);
    expect(body.success).toBe(true);
    expect(body.data.id).toBeGreaterThan(0);
    conceptId = body.data.id;
  });

  it('adds multilingual terms', async () => {
    const make = (payload: any) =>
      call(`/api/v1/concepts/${conceptId}/terms`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
    const r1 = await make({
      languageCode: 'en',
      termText: 'user interface',
      termType: 'fullForm',
      status: 'preferred',
    });
    expect(r1.status).toBe(201);
    const r2 = await make({
      languageCode: 'en',
      termText: 'UI',
      termType: 'acronym',
      status: 'admitted',
    });
    expect(r2.status).toBe(201);
    const r3 = await make({
      languageCode: 'zh-CN',
      termText: '用户界面',
      termType: 'fullForm',
      status: 'preferred',
    });
    expect(r3.status).toBe(201);
    const r4 = await make({
      languageCode: 'zh-CN',
      termText: '用户接口',
      termType: 'variant',
      status: 'deprecated',
    });
    expect(r4.status).toBe(201);
  });

  it('fetches concept detail with nested sections/terms', async () => {
    const res = await call(`/api/v1/concepts/${conceptId}`);
    const body = await j(res);
    expect(body.success).toBe(true);
    expect(body.data.languageSections).toHaveLength(2);
    const en = body.data.languageSections.find((s: any) => s.languageCode === 'en');
    const zh = body.data.languageSections.find((s: any) => s.languageCode === 'zh-CN');
    expect(en.termEntries).toHaveLength(2);
    expect(zh.termEntries).toHaveLength(2);
  });

  it('lists concepts with pagination and search', async () => {
    const res = await call('/api/v1/concepts?page=1&pageSize=10&q=界面');
    const body = await j(res);
    expect(body.success).toBe(true);
    expect(body.data.length).toBeGreaterThanOrEqual(1);
    expect(body.meta.total).toBeGreaterThanOrEqual(1);
  });

  it('searches terms by text', async () => {
    const res = await call('/api/v1/terms/search?q=user');
    const body = await j(res);
    expect(body.success).toBe(true);
    expect(body.data.find((r: any) => r.termText === 'user interface')).toBeTruthy();
  });

  it('performs regression verification (exact + no_match + deprecated)', async () => {
    // Source uses "user interface" and "UI". Target uses "用户接口" (deprecated) instead of "用户界面".
    const res = await call('/api/v1/regression/verify', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        reportName: 'UI regression',
        sourceText: 'Click the user interface. The UI is easy.',
        targetText: '点击用户接口。用户接口很易用。',
        sourceLang: 'en',
        targetLang: 'zh-CN',
        matchThreshold: 0.75,
        persist: true,
      }),
    });
    expect(res.status).toBe(200);
    const body = await j(res);
    expect(body.success).toBe(true);
    const report = body.data;
    expect(report.summary.totalTermsChecked).toBeGreaterThan(0);
    // The "user interface" occurrence should be flagged as no_match (target is deprecated)
    const findings = report.results as any[];
    expect(findings.some((r) => r.matchType === 'no_match' && r.expectedTerm === '用户界面')).toBe(true);
    // Deprecated-term usage should be flagged too
    expect(findings.some((r) => r.status === 'error' && r.actualTerm === '用户接口')).toBe(true);
    expect(report.id).toBeGreaterThan(0);
  });

  it('lists and fetches regression reports', async () => {
    const list = await j(await call('/api/v1/regression/reports'));
    expect(list.data.length).toBeGreaterThanOrEqual(1);
    const id = list.data[0].id;
    const detail = await j(await call(`/api/v1/regression/reports/${id}`));
    expect(detail.data.results.length).toBeGreaterThan(0);
  });

  it('exports TBX, clears, re-imports, and preserves terms', async () => {
    const exportRes = await call('/api/v1/tbx/export');
    const xml = await exportRes.text();
    expect(xml).toContain('<martif');
    expect(xml).toContain('user interface');

    // Clear & re-import via service (we expose import via HTTP)
    const { TbxService } = await import('../services/tbx.service.js');
    const db = await getDb();
    const svc = new TbxService(db);
    await svc.clearAll();

    const importRes = await call('/api/v1/tbx/import', {
      method: 'POST',
      headers: { 'content-type': 'application/xml' },
      body: xml,
    });
    expect(importRes.status).toBe(200);
    const body = await j(importRes);
    expect(body.data.importedConcepts).toBeGreaterThanOrEqual(1);
    expect(body.data.importedTerms).toBeGreaterThanOrEqual(4);

    // After re-import the "user interface" term should still be searchable
    const search = await j(await call('/api/v1/terms/search?q=user%20interface'));
    expect(search.data.find((r: any) => r.termText === 'user interface')).toBeTruthy();
  });

  it('updates and deletes a concept', async () => {
    // Create a fresh concept to avoid dependency on prior test state
    const createRes = await call('/api/v1/concepts', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ definition: 'Temporary concept' }),
    });
    const { data: created } = await j(createRes);

    const upd = await call(`/api/v1/concepts/${created.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ note: 'Updated via test' }),
    });
    expect(upd.status).toBe(200);
    const updBody = await j(upd);
    expect(updBody.data.note).toBe('Updated via test');

    const del = await call(`/api/v1/concepts/${created.id}`, { method: 'DELETE' });
    expect(del.status).toBe(200);

    const after = await call(`/api/v1/concepts/${created.id}`);
    expect(after.status).toBe(404);
  });

  it('returns standardized error on unknown concept', async () => {
    const res = await call('/api/v1/concepts/999999');
    expect(res.status).toBe(404);
    const body = await j(res);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('CONCEPT_NOT_FOUND');
  });
});

describe('Fuzzy match utility', () => {
  it('computes levenshtein correctly', async () => {
    const { levenshtein, similarity, fuzzyMatch } = await import('../utils/fuzzy-match.js');
    expect(levenshtein('kitten', 'sitting')).toBe(3);
    expect(similarity('abc', 'abc')).toBe(1);
    const m = fuzzyMatch('colour', ['color', 'hello'], 0.7);
    expect(m.matched).toBe(true);
    expect(m.matchedTerm).toBe('color');
    expect(m.matchType).toBe('fuzzy');
  });
});
