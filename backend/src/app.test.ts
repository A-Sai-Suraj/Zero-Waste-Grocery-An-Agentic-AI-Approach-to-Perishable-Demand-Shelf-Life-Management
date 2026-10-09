import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from './app.js';

describe('ZeroWaste backend scaffold', () => {
  it('allows the configured local frontend origin', async () => {
    const response = await request(app).get('/api/v1/health').set('Origin', 'http://localhost:3000');
    expect(response.status).toBe(200);
    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
  });

  it('rejects unconfigured cross-origin requests', async () => {
    const response = await request(app).get('/api/v1/health').set('Origin', 'https://attacker.example');
    expect(response.status).toBe(403);
    expect(response.body.error).toMatch(/origin is not allowed/i);
  });

  it('returns backend health status', async () => {
    const response = await request(app).get('/api/v1/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('demo');
  });

  it('returns dashboard summary payload', async () => {
    const response = await request(app).get('/api/v1/dashboard/summary');
    expect(response.status).toBe(200);
    expect(response.body.totalStores).toBeGreaterThan(0);
  });

  it('does not count an unknown store in the dashboard summary', async () => {
    const response = await request(app).get('/api/v1/dashboard/summary?storeId=unknown-store');
    expect(response.status).toBe(200);
    expect(response.body.totalStores).toBe(0);
  });

  it('returns paginated inventory results', async () => {
    const response = await request(app).get('/api/v1/inventory?page=1&limit=2');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.pagination).toMatchObject({ page: 1, limit: 2 });
  });

  it('applies inventory product filters', async () => {
    const response = await request(app).get('/api/v1/inventory?productId=SKU-002');
    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data.every((item: { productId: string }) => item.productId === 'SKU-002')).toBe(true);
  });

  it('rejects invalid inventory filters', async () => {
    const response = await request(app).get('/api/v1/inventory?limit=0');
    expect(response.status).toBe(400);
  });

  it('rejects invalid inventory ingestion instead of accepting arbitrary JSON', async () => {
    const response = await request(app).post('/api/v1/ingestion/inventory').send({ quantity: -8 });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid inventory payload');
  });

  it('rejects invalid payloads on the inventory batch ingestion route', async () => {
    const response = await request(app).post('/api/v1/inventory/ingest').send({ quantity: -8 });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid inventory ingestion payload');
  });

  it('preserves the supplied batch ID on inventory ingestion', async () => {
    const batchId = `BATCH-TEST-${Date.now()}`;
    const response = await request(app).post('/api/v1/inventory/ingest').send({
      batchId,
      productId: 'SKU-001',
      storeId: 'STORE-01',
      quantity: 4,
      expiryDate: '2026-10-20',
    });
    expect(response.status).toBe(201);
    expect(response.body.accepted).toBe(1);

    const lookup = await request(app).get(`/api/v1/inventory/${batchId}`);
    expect(lookup.status).toBe(200);
    expect(lookup.body.id).toBe(batchId);
  });

  it('rejects malformed receipt ingestion instead of accepting it', async () => {
    const response = await request(app).post('/api/v1/ingestion/receipts').send({});
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid receipt payload');
  });

  it('does not claim sales persistence when the demo database is unavailable', async () => {
    const response = await request(app).post('/api/v1/ingestion/sales').send({
      storeId: 'STORE-01',
      productId: 'SKU-001',
      quantity: 1,
      revenue: 3.5,
      soldAt: '2026-10-09T00:00:00Z',
    });
    expect(response.status).toBe(503);
    expect(response.body.error).toMatch(/database is not configured/i);
  });

  it('returns consistent inventory ingestion counts and record data for new and duplicate requests', async () => {
    const idempotencyKey = `inventory-ingestion-test-${Date.now()}`;
    const payload = {
      idempotencyKey,
      batchId: `BATCH-INGEST-TEST-${Date.now()}`,
      productId: 'SKU-001',
      storeId: 'STORE-01',
      quantity: 4,
      expiryDate: '2026-10-20',
    };

    const first = await request(app).post('/api/v1/ingestion/inventory').send(payload);
    expect(first.status).toBe(201);
    expect(first.body).toMatchObject({
      accepted: 1,
      rejected: 0,
      duplicate: false,
      status: 'demo_only',
    });
    expect(first.body.data.id).toBe(payload.batchId);

    const duplicate = await request(app).post('/api/v1/ingestion/inventory').send(payload);
    expect(duplicate.status).toBe(200);
    expect(duplicate.body).toMatchObject({
      accepted: 0,
      rejected: 0,
      duplicate: true,
      status: 'duplicate',
    });
    expect(duplicate.body.data.id).toBe(payload.batchId);
  });

  it('approves recommendation workflow', async () => {
    const createResponse = await request(app).post('/api/v1/recommendations/generate').send({
      storeId: 'STORE-01',
      productId: 'SKU-001',
      actionType: 'replenish',
      quantity: 40,
      reason: 'Weekend demand spike',
      confidence: 0.82,
      evidence: 'Demand forecast signal',
    });
    expect(createResponse.status).toBe(201);

    const id = createResponse.body.id;
    const approveResponse = await request(app).patch(`/api/v1/recommendations/${id}/approve`).send({ approved: true, comments: 'Approved by planner' });
    expect(approveResponse.status).toBe(200);
    expect(approveResponse.body.recommendation.status).toBe('approved');
  });

  it('rejects contradictory planner decision flags without changing state', async () => {
    const createResponse = await request(app).post('/api/v1/recommendations/generate').send({
      storeId: 'STORE-01',
      productId: 'SKU-001',
      actionType: 'replenish',
    });
    const id = createResponse.body.id;

    const approveResponse = await request(app).patch(`/api/v1/recommendations/${id}/approve`).send({ approved: false });
    const rejectResponse = await request(app).patch(`/api/v1/recommendations/${id}/reject`).send({ approved: true });

    expect(approveResponse.status).toBe(400);
    expect(rejectResponse.status).toBe(400);
    const current = await request(app).get(`/api/v1/recommendations/${id}`);
    expect(current.body.status).toBe('draft');
  });

  it('does not allow rejected recommendations to be approved or modified', async () => {
    const createResponse = await request(app).post('/api/v1/recommendations/generate').send({
      storeId: 'STORE-01',
      productId: 'SKU-001',
      actionType: 'replenish',
    });
    const id = createResponse.body.id;
    await request(app).patch(`/api/v1/recommendations/${id}/reject`).send({ approved: false });

    const approveResponse = await request(app).patch(`/api/v1/recommendations/${id}/approve`).send({ approved: true });
    const modifyResponse = await request(app).patch(`/api/v1/recommendations/${id}/modify`).send({ quantity: 5 });

    expect(approveResponse.status).toBe(409);
    expect(modifyResponse.status).toBe(409);
  });
});
