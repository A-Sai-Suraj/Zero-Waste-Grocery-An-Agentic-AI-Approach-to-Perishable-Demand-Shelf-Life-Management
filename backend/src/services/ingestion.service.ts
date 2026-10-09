import { InventoryStatus as PrismaInventoryStatus } from '@prisma/client';
import prisma from '../config/prisma.js';
import { env } from '../config/env.js';
import { HttpError, isPrismaErrorCode, requireDatabase } from '../lib/errors.js';
import type {
  inventoryIngestionSchema,
  promotionIngestionSchema,
  receiptIngestionSchema,
  salesIngestionSchema,
  wasteIngestionSchema,
} from '../validation/schemas.js';
import type { z } from 'zod';
import { writeAuditLog } from './audit.service.js';

type SalesInput = z.infer<typeof salesIngestionSchema>;
type InventoryInput = z.infer<typeof inventoryIngestionSchema>;
type ReceiptInput = z.infer<typeof receiptIngestionSchema>;
type PromotionInput = z.infer<typeof promotionIngestionSchema>;
type WasteInput = z.infer<typeof wasteIngestionSchema>;
const inventoryStatusMap = {
  fresh: PrismaInventoryStatus.FRESH,
  warning: PrismaInventoryStatus.WARNING,
  critical: PrismaInventoryStatus.CRITICAL,
};

function ensureDatabase(): void {
  requireDatabase(env.databaseUrl);
}

async function checkReceiptLineBatches(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  storeId: string,
  lines: ReceiptInput['lines'],
): Promise<void> {
  for (const line of lines) {
    if (!line.batchId) continue;
    const batch = await tx.inventoryBatch.findUnique({
      where: { id: line.batchId },
      select: { storeId: true, productId: true },
    });
    if (!batch || batch.storeId !== storeId || batch.productId !== line.productId) {
      throw new HttpError('Receipt batch must belong to the specified store and product', 400);
    }
  }
}

async function requireStore(tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0], storeId: string): Promise<void> {
  if (!(await tx.store.findUnique({ where: { id: storeId }, select: { id: true } }))) {
    throw new HttpError('Store not found', 404);
  }
}

async function requireProduct(tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0], productId: string): Promise<void> {
  if (!(await tx.product.findUnique({ where: { id: productId }, select: { id: true } }))) {
    throw new HttpError('Product not found', 404);
  }
}

async function requireStoreAndProduct(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  storeId: string,
  productId: string,
): Promise<void> {
  await requireStore(tx, storeId);
  await requireProduct(tx, productId);
}

export const ingestionService = {
  async sales(input: SalesInput) {
    ensureDatabase();
    if (input.idempotencyKey) {
      const existing = await prisma.salesRecord.findUnique({ where: { sourceId: input.idempotencyKey } });
      if (existing) return { record: existing, duplicate: true };
    }
    try {
      const record = await prisma.$transaction(async (tx) => {
        await requireStoreAndProduct(tx, input.storeId, input.productId);
        const created = await tx.salesRecord.create({
          data: {
            sourceId: input.idempotencyKey,
            storeId: input.storeId,
            productId: input.productId,
            quantity: input.quantity,
            revenue: input.revenue,
            soldAt: new Date(input.soldAt),
          },
        });
        await writeAuditLog(tx, {
          actor: 'ingestion',
          action: 'sales_record_created',
          entityType: 'sales_record',
          entityId: created.id,
          details: { sourceId: input.idempotencyKey ?? null },
        });
        return created;
      });
      return { record, duplicate: false };
    } catch (error) {
      if (input.idempotencyKey && isPrismaErrorCode(error, 'P2002')) {
        const existing = await prisma.salesRecord.findUnique({ where: { sourceId: input.idempotencyKey } });
        if (existing) return { record: existing, duplicate: true };
      }
      throw error;
    }
  },

  async inventory(input: InventoryInput) {
    ensureDatabase();
    return prisma.$transaction(async (tx) => {
      const existing = input.idempotencyKey
        ? await tx.inventoryBatch.findUnique({ where: { sourceId: input.idempotencyKey } })
        : null;
      if (existing) return { record: existing, duplicate: true };

      await requireStoreAndProduct(tx, input.storeId, input.productId);
      const created = await tx.inventoryBatch.create({
        data: {
          ...(input.batchId ? { id: input.batchId } : {}),
          sourceId: input.idempotencyKey,
          storeId: input.storeId,
          productId: input.productId,
          quantity: input.quantity,
          expiryDate: new Date(`${input.expiryDate}T00:00:00.000Z`),
          status: input.status ? inventoryStatusMap[input.status] : undefined,
        },
      });
      await writeAuditLog(tx, {
        actor: 'ingestion',
        action: 'inventory_batch_created',
        entityType: 'inventory_batch',
        entityId: created.id,
        details: { sourceId: input.idempotencyKey ?? null },
      });
      return { record: created, duplicate: false };
    }).catch(async (error: unknown) => {
      if (input.idempotencyKey && isPrismaErrorCode(error, 'P2002')) {
        const existing = await prisma.inventoryBatch.findUnique({ where: { sourceId: input.idempotencyKey } });
        if (existing) return { record: existing, duplicate: true };
      }
      throw error;
    });
  },

  async receipt(input: ReceiptInput) {
    ensureDatabase();
    if (input.idempotencyKey) {
      const existing = await prisma.receipt.findUnique({
        where: { sourceId: input.idempotencyKey },
        include: { lines: true },
      });
      if (existing) return { record: existing, duplicate: true };
    }
    try {
      const record = await prisma.$transaction(async (tx) => {
        await requireStore(tx, input.storeId);
        for (const line of input.lines) await requireProduct(tx, line.productId);
        await checkReceiptLineBatches(tx, input.storeId, input.lines);
        const created = await tx.receipt.create({
          data: {
            sourceId: input.idempotencyKey,
            storeId: input.storeId,
            supplierName: input.supplierName,
            orderDate: new Date(input.orderDate),
            deliveredAt: input.deliveredAt ? new Date(input.deliveredAt) : null,
            totalCost: input.totalCost,
            lines: {
              create: input.lines.map((line) => ({
                productId: line.productId,
                batchId: line.batchId,
                quantity: line.quantity,
                unitCost: line.unitCost,
              })),
            },
          },
          include: { lines: true },
        });
        await writeAuditLog(tx, {
          actor: 'ingestion',
          action: 'receipt_created',
          entityType: 'receipt',
          entityId: created.id,
          details: { sourceId: input.idempotencyKey ?? null, lineCount: input.lines.length },
        });
        return created;
      });
      return { record, duplicate: false };
    } catch (error) {
      if (input.idempotencyKey && isPrismaErrorCode(error, 'P2002')) {
        const existing = await prisma.receipt.findUnique({
          where: { sourceId: input.idempotencyKey },
          include: { lines: true },
        });
        if (existing) return { record: existing, duplicate: true };
      }
      throw error;
    }
  },

  async promotion(input: PromotionInput) {
    ensureDatabase();
    if (input.idempotencyKey) {
      const existing = await prisma.promotion.findUnique({ where: { sourceId: input.idempotencyKey } });
      if (existing) return { record: existing, duplicate: true };
    }
    try {
      const record = await prisma.$transaction(async (tx) => {
        await requireStore(tx, input.storeId);
        if (input.productId) await requireProduct(tx, input.productId);
        const created = await tx.promotion.create({
          data: {
            sourceId: input.idempotencyKey,
            storeId: input.storeId,
            productId: input.productId,
            name: input.name,
            discountPct: input.discountPct,
            startsAt: new Date(input.startsAt),
            endsAt: input.endsAt ? new Date(input.endsAt) : null,
          },
        });
        await writeAuditLog(tx, {
          actor: 'ingestion',
          action: 'promotion_created',
          entityType: 'promotion',
          entityId: created.id,
          details: { sourceId: input.idempotencyKey ?? null },
        });
        return created;
      });
      return { record, duplicate: false };
    } catch (error) {
      if (input.idempotencyKey && isPrismaErrorCode(error, 'P2002')) {
        const existing = await prisma.promotion.findUnique({ where: { sourceId: input.idempotencyKey } });
        if (existing) return { record: existing, duplicate: true };
      }
      throw error;
    }
  },

  async waste(input: WasteInput) {
    ensureDatabase();
    if (input.idempotencyKey) {
      const existing = await prisma.wasteRecord.findUnique({ where: { sourceId: input.idempotencyKey } });
      if (existing) return { record: existing, duplicate: true };
    }
    try {
      const record = await prisma.$transaction(async (tx) => {
        await requireStoreAndProduct(tx, input.storeId, input.productId);
        if (input.batchId) {
          const batch = await tx.inventoryBatch.findUnique({
            where: { id: input.batchId },
            select: { storeId: true, productId: true },
          });
          if (!batch || batch.storeId !== input.storeId || batch.productId !== input.productId) {
            throw new HttpError('Waste batch must belong to the specified store and product', 400);
          }
        }
        const created = await tx.wasteRecord.create({
          data: {
            sourceId: input.idempotencyKey,
            storeId: input.storeId,
            productId: input.productId,
            batchId: input.batchId,
            quantity: input.quantity,
            reason: input.reason,
            recordedAt: new Date(input.recordedAt),
          },
        });
        await writeAuditLog(tx, {
          actor: 'ingestion',
          action: 'waste_record_created',
          entityType: 'waste_record',
          entityId: created.id,
          details: { sourceId: input.idempotencyKey ?? null },
        });
        return created;
      });
      return { record, duplicate: false };
    } catch (error) {
      if (input.idempotencyKey && isPrismaErrorCode(error, 'P2002')) {
        const existing = await prisma.wasteRecord.findUnique({ where: { sourceId: input.idempotencyKey } });
        if (existing) return { record: existing, duplicate: true };
      }
      throw error;
    }
  },
};
