import { InventoryStatus as PrismaInventoryStatus } from '@prisma/client';
import { env } from '../config/env.js';
import prisma from '../config/prisma.js';
import { inventorySeed } from '../lib/dev-data.js';
import { HttpError, isPrismaErrorCode, requireDatabase } from '../lib/errors.js';
import type {
  IngestionResult,
  InventoryItem,
  InventoryStatus,
  PaginatedResponse,
  SpoilageRiskItem,
} from '../types/api.js';
import { writeAuditLog } from './audit.service.js';

const statusToPrisma: Record<InventoryStatus, PrismaInventoryStatus> = {
  fresh: PrismaInventoryStatus.FRESH,
  warning: PrismaInventoryStatus.WARNING,
  critical: PrismaInventoryStatus.CRITICAL,
};

const statusFromPrisma: Record<PrismaInventoryStatus, InventoryStatus> = {
  [PrismaInventoryStatus.FRESH]: 'fresh',
  [PrismaInventoryStatus.WARNING]: 'warning',
  [PrismaInventoryStatus.CRITICAL]: 'critical',
};
const dateOnly = (date: Date): string => date.toISOString().slice(0, 10);
const riskLevelMap: Record<string, SpoilageRiskItem['riskLevel']> = {
  low: 'low',
  medium: 'medium',
  high: 'high',
};
const demoInventoryBySourceId = new Map<string, InventoryItem>();

function mapInventory(batch: {
  id: string;
  productId: string;
  product: { name: string };
  storeId: string;
  quantity: number;
  expiryDate: Date;
  status: PrismaInventoryStatus;
}): InventoryItem {
  return {
    id: batch.id,
    productId: batch.productId,
    productName: batch.product.name,
    storeId: batch.storeId,
    quantity: batch.quantity,
    expiryDate: dateOnly(batch.expiryDate),
    status: statusFromPrisma[batch.status],
  };
}

function mapSpoilageRisk(risk: {
  batchId: string;
  riskScore: { toNumber(): number };
  riskLevel: string;
  daysToExpiry: number;
}): SpoilageRiskItem {
  const riskLevel = riskLevelMap[risk.riskLevel];
  if (!riskLevel) {
    throw new HttpError('Stored spoilage risk has an invalid risk level', 500);
  }
  return {
    batchId: risk.batchId,
    riskScore: risk.riskScore.toNumber(),
    riskLevel,
    daysUntilExpiry: risk.daysToExpiry,
  };
}

export const inventoryService = {
  async list(
    storeId?: string,
    status?: InventoryStatus,
    productId?: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<InventoryItem>> {
    if (env.demoMode) {
      const filtered = inventorySeed.filter((item) =>
        (!storeId || item.storeId === storeId) &&
        (!status || item.status === status) &&
        (!productId || item.productId === productId));
      return {
        data: filtered.slice((page - 1) * limit, page * limit),
        pagination: { page, limit, total: filtered.length },
      };
    }
    requireDatabase(env.databaseUrl);

    const where = {
      ...(storeId ? { storeId } : {}),
      ...(status ? { status: statusToPrisma[status] } : {}),
      ...(productId ? { productId } : {}),
    };
    const [total, batches] = await prisma.$transaction([
      prisma.inventoryBatch.count({ where }),
      prisma.inventoryBatch.findMany({
        where,
        include: { product: { select: { name: true } } },
        orderBy: [{ expiryDate: 'asc' }, { id: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return { data: batches.map(mapInventory), pagination: { page, limit, total } };
  },

  async getByBatchId(batchId: string): Promise<InventoryItem | null> {
    if (env.demoMode) {
      return inventorySeed.find((item) => item.id === batchId) ?? null;
    }
    requireDatabase(env.databaseUrl);
    const batch = await prisma.inventoryBatch.findUnique({
      where: { id: batchId },
      include: { product: { select: { name: true } } },
    });
    return batch ? mapInventory(batch) : null;
  },

  async getAlerts(): Promise<SpoilageRiskItem[]> {
    if (env.demoMode) {
      return inventorySeed
        .filter((item) => item.status !== 'fresh')
        .map((item) => ({
          batchId: item.id,
          riskScore: item.status === 'critical' ? 90 : 68,
          riskLevel: item.status === 'critical' ? 'high' : 'medium',
          daysUntilExpiry: Math.max(0, Math.ceil((new Date(`${item.expiryDate}T00:00:00.000Z`).getTime() - Date.now()) / 86400000)),
        }));
    }
    requireDatabase(env.databaseUrl);
    const now = new Date();
    const through = new Date(now.getTime() + 7 * 86400000);
    const batches = await prisma.inventoryBatch.findMany({
      where: { quantity: { gt: 0 }, expiryDate: { lte: through } },
      orderBy: [{ expiryDate: 'asc' }, { id: 'asc' }],
    });
    return batches.map((batch) => {
      const daysUntilExpiry = Math.max(0, Math.ceil((batch.expiryDate.getTime() - now.getTime()) / 86400000));
      return {
        batchId: batch.id,
        riskScore: Math.max(0, Math.min(100, 100 - daysUntilExpiry * 12 + batch.quantity * 0.15)),
        riskLevel: daysUntilExpiry <= 2 ? 'high' : daysUntilExpiry <= 5 ? 'medium' : 'low',
        daysUntilExpiry,
      };
    });
  },

  async getStoredSpoilageRisks(): Promise<SpoilageRiskItem[]> {
    if (env.demoMode) {
      return this.getAlerts();
    }
    requireDatabase(env.databaseUrl);
    const rows = await prisma.spoilageRisk.findMany({
      distinct: ['batchId'],
      orderBy: [{ batchId: 'asc' }, { generatedAt: 'desc' }],
    });
    return rows.map(mapSpoilageRisk);
  },

  async ingestInventory(row: {
    id?: string;
    sourceId?: string;
    productId: string;
    storeId: string;
    quantity: number;
    expiryDate: string;
    status?: InventoryStatus;
  }): Promise<{ item: InventoryItem; duplicate: boolean }> {
    if (env.demoMode) {
      const existing = row.sourceId ? demoInventoryBySourceId.get(row.sourceId) : undefined;
      if (existing) return { item: existing, duplicate: true };
      const item: InventoryItem = {
        id: row.id ?? row.sourceId ?? `BATCH-${Date.now()}`,
        productId: row.productId,
        productName: row.productId,
        storeId: row.storeId,
        quantity: row.quantity,
        expiryDate: row.expiryDate,
        status: row.status ?? (row.quantity < 20 ? 'warning' : 'fresh'),
      };
      inventorySeed.push(item);
      if (row.sourceId) demoInventoryBySourceId.set(row.sourceId, item);
      return { item, duplicate: false };
    }
    requireDatabase(env.databaseUrl);
    if (row.sourceId) {
      const existing = await prisma.inventoryBatch.findUnique({
        where: { sourceId: row.sourceId },
        include: { product: { select: { name: true } } },
      });
      if (existing) return { item: mapInventory(existing), duplicate: true };
    }

    try {
      const item = await prisma.$transaction(async (tx) => {
        const batch = await tx.inventoryBatch.create({
          data: {
            ...(row.id ? { id: row.id } : {}),
            ...(row.sourceId ? { sourceId: row.sourceId } : {}),
            storeId: row.storeId,
            productId: row.productId,
            quantity: row.quantity,
            expiryDate: new Date(`${row.expiryDate}T00:00:00.000Z`),
            status: row.status ? statusToPrisma[row.status] : row.quantity < 20 ? PrismaInventoryStatus.WARNING : PrismaInventoryStatus.FRESH,
          },
          include: { product: { select: { name: true } } },
        });
        await writeAuditLog(tx, {
          actor: 'ingestion',
          action: 'inventory_batch_created',
          entityType: 'inventory_batch',
          entityId: batch.id,
          details: { sourceId: row.sourceId ?? null },
        });
        return mapInventory(batch);
      });
      return { item, duplicate: false };
    } catch (error) {
      if (row.sourceId && isPrismaErrorCode(error, 'P2002')) {
        const existing = await prisma.inventoryBatch.findUnique({
          where: { sourceId: row.sourceId },
          include: { product: { select: { name: true } } },
        });
        if (existing) return { item: mapInventory(existing), duplicate: true };
      }
      throw error;
    }
  },

  async ingestInventoryBatch(rows: Array<Partial<InventoryItem>>): Promise<IngestionResult> {
    const errors: IngestionResult['errors'] = [];
    let accepted = 0;
    for (const [index, row] of rows.entries()) {
      if (!row.productId || !row.storeId || !row.expiryDate || typeof row.quantity !== 'number') {
        errors.push({ index, message: 'Missing required inventory fields', raw: row });
        continue;
      }
      try {
        await this.ingestInventory({
          id: row.id,
          productId: row.productId,
          storeId: row.storeId,
          quantity: row.quantity,
          expiryDate: row.expiryDate,
          status: row.status,
        });
        accepted += 1;
      } catch (error) {
        errors.push({ index, message: error instanceof Error ? error.message : 'Inventory ingestion failed', raw: row });
      }
    }
    return { accepted, rejected: errors.length, errors };
  },
};
