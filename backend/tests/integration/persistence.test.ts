import { randomUUID } from 'node:crypto';
import { createServer } from 'node:net';
import { spawn, type ChildProcess } from 'node:child_process';
import { PrismaClient } from '@prisma/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import prisma from '../../src/config/prisma.js';
import { catalogService } from '../../src/services/catalog.service.js';
import { auditQueryService } from '../../src/services/audit-query.service.js';
import { dashboardService } from '../../src/services/dashboard.service.js';
import { ingestionService } from '../../src/services/ingestion.service.js';
import { inventoryService } from '../../src/services/inventory.service.js';
import { recommendationService } from '../../src/services/recommendation.service.js';

const runId = randomUUID();
const storeId = `it-store-${runId}`;
const productId = `it-product-${runId}`;
const sourcePrefix = `integration:${runId}`;
const cleanup = new PrismaClient();
let recommendationId: string | undefined;
let rejectedRecommendationId: string | undefined;
let restartBatchId: string | undefined;
let restartRecommendationId: string | undefined;
let concurrentRecommendationId: string | undefined;
let fixturesCreated = false;

describe('PostgreSQL persistence integration', () => {
  beforeAll(async () => {
    if (
      !process.env.DATABASE_URL ||
      process.env.DATABASE_ENV !== 'test' ||
      process.env.NODE_ENV !== 'test' ||
      process.env.ALLOW_DATABASE_INTEGRATION_TESTS !== 'true' ||
      process.env.DATABASE_TARGET_CONFIRMATION !== 'I_HAVE_VERIFIED_THIS_IS_NOT_PRODUCTION' ||
      process.env.DEMO_MODE === 'true'
    ) {
      throw new Error('Refusing database writes without explicit verified test database opt-in');
    }
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$transaction([
      prisma.store.create({ data: { id: storeId, name: `Integration ${runId}`, region: 'test' } }),
      prisma.product.create({
        data: { id: productId, sku: `IT-${runId}`, name: 'Integration Product', category: 'test', unit: 'unit' },
      }),
    ]);
    fixturesCreated = true;
  }, 30000);

  afterAll(async () => {
    if (fixturesCreated) await cleanup.$transaction(async (tx) => {
      if (recommendationId || rejectedRecommendationId || restartRecommendationId || concurrentRecommendationId) {
        const ids = [recommendationId, rejectedRecommendationId, restartRecommendationId, concurrentRecommendationId]
          .filter((id): id is string => Boolean(id));
        await tx.auditLog.deleteMany({ where: { recommendationId: { in: ids } } });
        await tx.executionRecord.deleteMany({ where: { recommendationId: { in: ids } } });
        await tx.plannerDecisionRecord.deleteMany({ where: { recommendationId: { in: ids } } });
        await tx.recommendationRevision.deleteMany({ where: { recommendationId: { in: ids } } });
        await tx.recommendationAction.deleteMany({ where: { recommendationId: { in: ids } } });
        await tx.recommendation.deleteMany({ where: { id: { in: ids } } });
      }
      const inventory = await tx.inventoryBatch.findMany({ where: { storeId }, select: { id: true } });
      const batchIds = [...inventory.map(({ id }) => id), ...(restartBatchId ? [restartBatchId] : [])];
      const sales = await tx.salesRecord.findMany({ where: { storeId }, select: { id: true } });
      const receipts = await tx.receipt.findMany({ where: { storeId }, select: { id: true } });
      const waste = await tx.wasteRecord.findMany({ where: { storeId }, select: { id: true } });
      const promotions = await tx.promotion.findMany({ where: { storeId }, select: { id: true } });
      const ids = [...batchIds, ...sales.map(({ id }) => id), ...receipts.map(({ id }) => id), ...waste.map(({ id }) => id), ...promotions.map(({ id }) => id)];
      await tx.auditLog.deleteMany({ where: { entityId: { in: ids } } });
      await tx.spoilageRisk.deleteMany({ where: { batchId: { in: batchIds } } });
      await tx.wasteRecord.deleteMany({ where: { storeId } });
      await tx.receiptLine.deleteMany({ where: { receipt: { storeId } } });
      await tx.receipt.deleteMany({ where: { storeId } });
      await tx.promotion.deleteMany({ where: { storeId } });
      await tx.salesRecord.deleteMany({ where: { storeId } });
      await tx.inventoryBatch.deleteMany({ where: { storeId } });
      await tx.demandForecast.deleteMany({ where: { storeId } });
      await tx.auditLog.deleteMany({ where: { entityId: { in: [storeId, productId] } } });
      await tx.product.deleteMany({ where: { id: productId } });
      await tx.store.deleteMany({ where: { id: storeId } });
    });
    await prisma.$disconnect();
    await cleanup.$disconnect();
  }, 30000);

  it('persists ingestion, planner decisions, execution and audit data across a fresh client connection', async () => {
    const inventory = await ingestionService.inventory({
      idempotencyKey: `${sourcePrefix}:inventory`,
      storeId,
      productId,
      quantity: 24,
      expiryDate: '2026-12-31',
    });
    expect(inventory.duplicate).toBe(false);
    expect(inventory.record.storeId).toBe(storeId);

    const duplicateInventory = await ingestionService.inventory({
      idempotencyKey: `${sourcePrefix}:inventory`,
      storeId,
      productId,
      quantity: 24,
      expiryDate: '2026-12-31',
    });
    expect(duplicateInventory.duplicate).toBe(true);
    expect(duplicateInventory.record.id).toBe(inventory.record.id);
    await expect(ingestionService.sales({
      idempotencyKey: `${sourcePrefix}:invalid-foreign-key`,
      storeId: `${storeId}-missing`,
      productId,
      quantity: 1,
      revenue: 1,
      soldAt: new Date().toISOString(),
    })).rejects.toMatchObject({ code: 'P2003' });

    const sales = await ingestionService.sales({
      idempotencyKey: `${sourcePrefix}:sales`,
      storeId,
      productId,
      quantity: 3,
      revenue: 12.5,
      soldAt: new Date().toISOString(),
    });
    expect(sales.record.quantity).toBe(3);
    const duplicateSales = await ingestionService.sales({
      idempotencyKey: `${sourcePrefix}:sales`,
      storeId,
      productId,
      quantity: 3,
      revenue: 12.5,
      soldAt: new Date().toISOString(),
    });
    expect(duplicateSales.duplicate).toBe(true);
    expect(duplicateSales.record.id).toBe(sales.record.id);

    const receipt = await ingestionService.receipt({
      idempotencyKey: `${sourcePrefix}:receipt`,
      storeId,
      supplierName: 'Integration Supplier',
      orderDate: new Date().toISOString(),
      totalCost: 8,
      lines: [{ productId, batchId: inventory.record.id, quantity: 2, unitCost: 4 }],
    });
    expect(receipt.record.lines).toHaveLength(1);
    expect((await ingestionService.receipt({
      idempotencyKey: `${sourcePrefix}:receipt`,
      storeId,
      supplierName: 'Integration Supplier',
      orderDate: new Date().toISOString(),
      totalCost: 8,
      lines: [{ productId, batchId: inventory.record.id, quantity: 2, unitCost: 4 }],
    })).duplicate).toBe(true);

    const promotion = await ingestionService.promotion({
      idempotencyKey: `${sourcePrefix}:promotion`,
      storeId,
      productId,
      name: 'Integration promotion',
      discountPct: 10,
      startsAt: new Date().toISOString(),
    });
    expect(promotion.record.productId).toBe(productId);
    expect((await ingestionService.promotion({
      idempotencyKey: `${sourcePrefix}:promotion`,
      storeId,
      productId,
      name: 'Integration promotion',
      discountPct: 10,
      startsAt: new Date().toISOString(),
    })).duplicate).toBe(true);

    const waste = await ingestionService.waste({
      idempotencyKey: `${sourcePrefix}:waste`,
      storeId,
      productId,
      batchId: inventory.record.id,
      quantity: 1,
      reason: 'Integration test fixture',
      recordedAt: new Date().toISOString(),
    });
    expect(waste.record.quantity).toBe(1);
    expect((await ingestionService.waste({
      idempotencyKey: `${sourcePrefix}:waste`,
      storeId,
      productId,
      batchId: inventory.record.id,
      quantity: 1,
      reason: 'Integration test fixture',
      recordedAt: new Date().toISOString(),
    })).duplicate).toBe(true);

    const recommendation = await recommendationService.create({
      storeId,
      productId,
      actionType: 'markdown',
      quantity: 2,
      reason: 'Integration test recommendation',
    });
    recommendationId = recommendation.id;
    await recommendationService.modify(recommendation.id, { quantity: 3 }, 'integration-test', 'revision fixture');
    await recommendationService.approve(recommendation.id, 'integration-test', 'approval fixture');
    expect((await recommendationService.execute(recommendation.id, 'integration-test')).executed).toBe(true);
    expect((await recommendationService.execute(recommendation.id, 'integration-test')).executed).toBe(false);
    expect((await prisma.auditLog.findMany({
      where: { recommendationId: recommendation.id, action: 'recommendation_execution_denied' },
    })).length).toBe(1);

    const rejected = await recommendationService.create({
      storeId,
      productId,
      actionType: 'replenish',
      reason: 'Rejected integration test recommendation',
    });
    rejectedRecommendationId = rejected.id;
    await recommendationService.reject(rejected.id, 'integration-test', 'rejection fixture');
    expect((await recommendationService.execute(rejected.id, 'integration-test')).executed).toBe(false);

    const concurrent = await recommendationService.create({
      storeId,
      productId,
      actionType: 'replenish',
      reason: 'Concurrent execution integration fixture',
    });
    concurrentRecommendationId = concurrent.id;
    await recommendationService.approve(concurrent.id, 'integration-test');
    const concurrentResults = await Promise.all(
      Array.from({ length: 5 }, () => recommendationService.execute(concurrent.id, 'integration-test')),
    );
    expect(concurrentResults.filter((result) => result.executed)).toHaveLength(1);
    expect(await prisma.executionRecord.count({ where: { recommendationId: concurrent.id } })).toBe(1);

    const auditBeforeRestart = await auditQueryService.list(1, 100);
    expect(auditBeforeRestart.data.some((row) => row.entityId === recommendation.id)).toBe(true);
    expect((await catalogService.listStores(1, 100)).data.some((row) => row.id === storeId)).toBe(true);
    expect((await catalogService.listProducts(1, 100)).data.some((row) => row.id === productId)).toBe(true);
    expect((await inventoryService.getByBatchId(inventory.record.id))?.quantity).toBe(24);
    expect((await inventoryService.list(storeId)).pagination.total).toBe(1);
    expect((await dashboardService.getSummary(storeId)).projectedWaste).toBe(1);
    expect((await recommendationService.getById(recommendation.id))?.status).toBe('executed');

    await prisma.$disconnect();
    const restartedClient = new PrismaClient();
    try {
      const [persistedInventory, persistedSales, persistedReceipt, persistedPromotion, persistedWaste, persistedRecommendation, executions, decisions, revisions, persistedAudit] =
        await Promise.all([
          restartedClient.inventoryBatch.findUnique({ where: { id: inventory.record.id } }),
          restartedClient.salesRecord.findUnique({ where: { id: sales.record.id } }),
          restartedClient.receipt.findUnique({ where: { id: receipt.record.id } }),
          restartedClient.promotion.findUnique({ where: { id: promotion.record.id } }),
          restartedClient.wasteRecord.findUnique({ where: { id: waste.record.id } }),
          restartedClient.recommendation.findUnique({ where: { id: recommendation.id } }),
          restartedClient.executionRecord.findMany({ where: { recommendationId: recommendation.id } }),
          restartedClient.plannerDecisionRecord.findMany({ where: { recommendationId: recommendation.id } }),
          restartedClient.recommendationRevision.findMany({ where: { recommendationId: recommendation.id } }),
          restartedClient.auditLog.findMany({ where: { recommendationId: recommendation.id } }),
        ]);
      expect(persistedInventory?.quantity).toBe(24);
      expect(persistedSales?.quantity).toBe(3);
      expect(persistedReceipt?.storeId).toBe(storeId);
      expect(persistedPromotion?.name).toBe('Integration promotion');
      expect(persistedWaste?.quantity).toBe(1);
      expect(persistedRecommendation?.status).toBe('EXECUTED');
      expect(executions).toHaveLength(1);
      expect(decisions.map((decision) => decision.decision)).toEqual(['CREATED', 'MODIFIED', 'APPROVED', 'EXECUTED']);
      expect(revisions).toHaveLength(2);
      expect(persistedAudit.length).toBeGreaterThanOrEqual(4);
    } finally {
      await restartedClient.$disconnect();
      await prisma.$connect();
    }
  }, 30000);

  it('retains HTTP-created records after the backend process is restarted', async () => {
    const portServer = createServer();
    await new Promise<void>((resolve) => portServer.listen(0, '127.0.0.1', resolve));
    const address = portServer.address();
    if (!address || typeof address === 'string') throw new Error('Unable to reserve a backend test port');
    const port = address.port;
    await new Promise<void>((resolve, reject) => portServer.close((error) => error ? reject(error) : resolve()));

    const startBackend = () => spawn(
      process.execPath,
      ['--import', 'tsx/loader', 'src/server.ts'],
      {
        cwd: process.cwd(),
        env: { ...process.env, PORT: String(port), NODE_ENV: 'test', DATABASE_ENV: 'test', DEMO_MODE: 'false' },
        stdio: 'ignore',
      },
    );
    let launchError: Error | undefined;
    const startTrackedBackend = () => {
      const child = startBackend();
      child.on('error', (error) => {
        launchError = error;
      });
      return child;
    };
    const waitUntilHealthy = async (child: ChildProcess) => {
      for (let attempt = 0; attempt < 80; attempt += 1) {
        if (launchError) throw launchError;
        if (child.exitCode !== null) throw new Error(`Backend test process exited with code ${child.exitCode}`);
        try {
          const response = await fetch(`http://127.0.0.1:${port}/api/v1/health`);
          if (response.status === 200) return;
        } catch {
          // The server is not listening yet.
        }
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
      throw new Error('Backend test process did not become healthy');
    };
    const stopBackend = async (child: ChildProcess) => {
      if (child.exitCode !== null) return;
      const exited = new Promise<void>((resolve) => child.once('exit', () => resolve()));
      child.kill();
      await Promise.race([exited, new Promise((resolve) => setTimeout(resolve, 5000))]);
      if (child.exitCode === null) throw new Error('Backend test process did not stop after SIGTERM');
    };
    const postJson = async (path: string, body: unknown) => {
      const response = await fetch(`http://127.0.0.1:${port}/api/v1${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json() as Record<string, unknown>;
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(300);
      return data;
    };

    let backend: ChildProcess | undefined;
    try {
      backend = startTrackedBackend();
      await waitUntilHealthy(backend);
      const inventory = await postJson('/ingestion/inventory', {
        idempotencyKey: `${sourcePrefix}:restart-inventory`,
        storeId,
        productId,
        quantity: 19,
        expiryDate: '2026-12-30',
      });
      restartBatchId = (inventory.data as { id: string }).id;
      const recommendation = await postJson('/recommendations/generate', {
        storeId,
        productId,
        actionType: 'replenish',
        quantity: 4,
        reason: 'Process restart persistence fixture',
      });
      restartRecommendationId = recommendation.id as string;
      const approve = await fetch(`http://127.0.0.1:${port}/api/v1/recommendations/${restartRecommendationId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: true }),
      });
      expect(approve.status).toBe(200);
      const execution = await postJson(`/recommendations/${restartRecommendationId}/execute`, {});
      expect(execution.executed).toBe(true);
      await stopBackend(backend);
      backend = undefined;

      backend = startTrackedBackend();
      await waitUntilHealthy(backend);
      const [persistedBatchResponse, persistedRecommendationResponse, auditResponse] = await Promise.all([
        fetch(`http://127.0.0.1:${port}/api/v1/inventory/${restartBatchId}`),
        fetch(`http://127.0.0.1:${port}/api/v1/recommendations/${restartRecommendationId}`),
        fetch(`http://127.0.0.1:${port}/api/v1/audit-logs?page=1&limit=100`),
      ]);
      expect(persistedBatchResponse.status).toBe(200);
      expect((await persistedBatchResponse.json() as { quantity: number }).quantity).toBe(19);
      expect(persistedRecommendationResponse.status).toBe(200);
      expect((await persistedRecommendationResponse.json() as { status: string }).status).toBe('executed');
      const audit = await auditResponse.json() as { data: Array<{ entityId: string; action: string }> };
      expect(audit.data.some((row) => row.entityId === restartRecommendationId && row.action === 'recommendation_executed')).toBe(true);
    } finally {
      if (backend) await stopBackend(backend);
    }
  }, 60000);
});
