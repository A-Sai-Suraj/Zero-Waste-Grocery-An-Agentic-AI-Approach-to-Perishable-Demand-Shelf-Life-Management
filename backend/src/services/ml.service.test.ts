import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { once } from 'node:events';
import { afterEach, describe, expect, it } from 'vitest';
import { createMlAdapter } from './ml.service.js';

const servers: Server[] = [];

async function startServer(
  handler: (request: IncomingMessage, response: ServerResponse) => void,
): Promise<{ baseUrl: string; server: Server }> {
  const server = createServer(handler);
  const listening = once(server, 'listening');
  server.listen(0, '127.0.0.1');
  await listening;
  servers.push(server);
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Local ML test server did not bind a TCP port');
  return { baseUrl: `http://127.0.0.1:${address.port}`, server };
}

afterEach(async () => {
  await Promise.all(servers.splice(0).map(async (server) => {
    server.closeAllConnections();
    if (server.listening) await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }));
});

describe('FastAPI adapter contract', () => {
  it('sends the demand payload and validates the documented response', async () => {
    const { baseUrl } = await startServer(async (request, response) => {
      let body = '';
      for await (const chunk of request) body += chunk;
      expect(request.url).toBe('/api/forecast/demand');
      expect(JSON.parse(body)).toMatchObject({
        store_id: 'store-test',
        product_id: 'product-test',
        horizon_days: 7,
        features: { trailing_30_day_quantity: 22 },
      });
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({
        store_id: 'store-test',
        product_id: 'product-test',
        forecast_qty: 18.5,
        confidence: 0.88,
        horizon_days: 7,
        model_name: 'contract-test-model',
      }));
    });
    const result = await createMlAdapter(baseUrl).requestForecast({
      store_id: 'store-test',
      product_id: 'product-test',
      horizon_days: 7,
      features: { trailing_30_day_quantity: 22 },
    });
    expect(result.model_name).toBe('contract-test-model');
    expect(result.forecast_qty).toBe(18.5);
  });

  it('sends and validates the spoilage-risk contract', async () => {
    const { baseUrl } = await startServer(async (request, response) => {
      let body = '';
      for await (const chunk of request) body += chunk;
      expect(request.url).toBe('/api/spoilage/risk');
      expect(JSON.parse(body)).toMatchObject({
        batch_id: 'batch-test',
        inventory_qty: 10,
        days_to_expiry: 2,
        product_id: 'product-test',
        store_id: 'store-test',
      });
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({
        batch_id: 'batch-test',
        risk_score: 88,
        risk_level: 'high',
        days_to_expiry: 2,
        model_name: 'contract-test-spoilage-model',
      }));
    });
    const result = await createMlAdapter(baseUrl).requestSpoilageRisk({
      batch_id: 'batch-test',
      inventory_qty: 10,
      days_to_expiry: 2,
      product_id: 'product-test',
      store_id: 'store-test',
    });
    expect(result.risk_level).toBe('high');
    expect(result.risk_score).toBe(88);
  });

  it('rejects malformed model responses', async () => {
    const { baseUrl } = await startServer((_request, response) => {
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ risk_score: 'not-a-number' }));
    });
    await expect(createMlAdapter(baseUrl).requestSpoilageRisk({
      batch_id: 'batch-test',
      inventory_qty: 10,
      days_to_expiry: 2,
      product_id: 'product-test',
      store_id: 'store-test',
    })).rejects.toMatchObject({ statusCode: 502 });
  });

  it('maps upstream HTTP errors and request timeouts to gateway errors', async () => {
    const upstreamError = await startServer((_request, response) => {
      response.writeHead(500, { 'Content-Type': 'application/json' });
      response.end('{"detail":"internal"}');
    });
    await expect(createMlAdapter(upstreamError.baseUrl).requestForecast({
      store_id: 'store-test',
      product_id: 'product-test',
      horizon_days: 7,
      features: {},
    })).rejects.toMatchObject({ statusCode: 502 });

    const slow = await startServer((_request, response) => {
      setTimeout(() => {
        if (!response.destroyed) response.end('{}');
      }, 100);
    });
    await expect(createMlAdapter(slow.baseUrl, 15).requestForecast({
      store_id: 'store-test',
      product_id: 'product-test',
      horizon_days: 7,
      features: {},
    })).rejects.toMatchObject({ statusCode: 504 });
  });
});
