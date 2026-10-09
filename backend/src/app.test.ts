import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from './app.js';

describe('ZeroWaste backend scaffold', () => {
  it('returns backend health status', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });

  it('returns dashboard summary payload', async () => {
    const response = await request(app).get('/api/dashboard/summary');
    expect(response.status).toBe(200);
    expect(response.body.totalStores).toBeGreaterThan(0);
  });

  it('returns inventory list', async () => {
    const response = await request(app).get('/api/inventory');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
