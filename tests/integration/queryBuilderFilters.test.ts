import { describe, it, beforeAll, afterAll, expect, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { queryCases } from './cases/queryCases.ts';

let app: FastifyInstance;

describe('GET /rest/v1/:table - buildFiltersToRaw full coverage', () => {
  beforeAll(async () => {
    process.env.DB_CLIENT = 'sqlite';
    process.env.DB_NAME = ':memory:';
    process.env.API_KEY_FULL = 'test-full-key';
    vi.resetModules();

    const { default: createApp } = await import('../../src/core/app.ts');
    const { setupTestDB } = await import('../helpers/dbSetup.ts');

    app = await createApp();
    await setupTestDB(app);
  });

  afterAll(async () => {
    await app.close();
  });

  for (const c of queryCases) {
    if (c.url2) {
      it(c.name, async () => {
        const res1 = await app.inject({
          method: 'GET',
          url: c.url1,
          headers: { 'x-api-key': 'test-full-key' },
        });
        const res2 = await app.inject({
          method: 'GET',
          url: c.url2,
          headers: { 'x-api-key': 'test-full-key' },
        });

        expect(res1.statusCode).toBe(200);
        expect(res2.statusCode).toBe(200);

        const data1 = res1.json().rows || [];
        const data2 = res2.json().rows || [];

        c.expectFn(data1, data2);
      });
    } else {
      it(c.name, async () => {
        const res = await app.inject({
          method: 'GET',
          url: c.url,
          headers: { 'x-api-key': 'test-full-key' },
        });

        expect(res.statusCode).toBe(200);
        const body = res.json();
        const data = body.rows || body.data?.rows || [];
        c.expectFn(data, []);
      });
    }
  }
});
