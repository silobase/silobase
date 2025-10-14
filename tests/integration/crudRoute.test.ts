import { describe, it, beforeAll, afterAll, expect, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';

let app: FastifyInstance;

describe('CRUD Routes', () => {
  beforeAll(async () => {
    // Set up environment variables before imports
    process.env.DB_CLIENT = 'sqlite';
    process.env.DB_NAME = ':memory:'; // In-memory SQLite
    process.env.API_KEY_FULL = 'test-full-key';

    // Clear module cache so config picks up the new envs
    vi.resetModules();

    // Import app *after* setting envs
    const { default: createApp } = await import('../../src/core/app.ts');
    const { setupTestDB } = await import('../helpers/dbSetup.ts');

    app = await createApp();
    await setupTestDB(app);
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('should create a new record', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/rest/v1/users',
      headers: { 'x-api-key': 'test-full-key' },
      payload: { name: 'Alice', age: 25 },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body).toHaveProperty('data');
  });
});
