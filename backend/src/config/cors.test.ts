import cors from 'cors';
import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createCorsOriginCallback, parseCorsOrigins } from './cors.js';

describe('CORS configuration', () => {
  it('uses localhost origins in development and requires explicit HTTPS origins in production', () => {
    expect(parseCorsOrigins(undefined, 'development')).toEqual([
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ]);
    expect(parseCorsOrigins('https://shop.example.com,https://admin.example.com', 'production')).toEqual([
      'https://shop.example.com',
      'https://admin.example.com',
    ]);
  });

  it('requires an explicit origin list in production', () => {
    expect(() => parseCorsOrigins(undefined, 'production')).toThrow(/CORS_ORIGINS/);
  });

  it.each([
    ['*', 'production'],
    ['http://shop.example.com', 'production'],
    ['https://shop.example.com/path', 'development'],
    ['not-an-origin', 'development'],
  ])('rejects unsafe CORS configuration %s in %s', (origins, environment) => {
    expect(() => parseCorsOrigins(origins, environment)).toThrow();
  });

  it('sends CORS headers only for permitted origins and rejects unlisted origins', async () => {
    const app = express();
    app.use(cors({ origin: createCorsOriginCallback(['http://localhost:3000']), credentials: true }));
    app.get('/check', (_req, res) => res.json({ ok: true }));
    app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      const statusCode = typeof error === 'object' && error !== null && 'statusCode' in error
        ? Number(error.statusCode)
        : 500;
      res.status(statusCode).json({ error: 'Origin rejected' });
    });

    const allowed = await request(app).get('/check').set('Origin', 'http://localhost:3000');
    expect(allowed.status).toBe(200);
    expect(allowed.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    expect(allowed.headers['access-control-allow-credentials']).toBe('true');

    const rejected = await request(app).get('/check').set('Origin', 'https://attacker.example');
    expect(rejected.status).toBe(403);
  });
});
