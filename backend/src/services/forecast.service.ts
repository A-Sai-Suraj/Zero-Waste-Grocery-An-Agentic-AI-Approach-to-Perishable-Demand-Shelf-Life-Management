import { env } from '../config/env.js';
import prisma from '../config/prisma.js';
import { HttpError, requireDatabase } from '../lib/errors.js';
import type { DemandForecastItem, SpoilageRiskItem } from '../types/api.js';
import { writeAuditLog } from './audit.service.js';
import { requestForecast, requestSpoilageRisk } from './ml.service.js';

function mapForecast(row: {
  storeId: string;
  productId: string;
  forecastQty: { toNumber(): number };
  confidence: { toNumber(): number };
  horizonDays: number;
}): DemandForecastItem {
  return {
    storeId: row.storeId,
    productId: row.productId,
    forecastQty: row.forecastQty.toNumber(),
    confidence: row.confidence.toNumber(),
    horizonDays: row.horizonDays,
  };
}

export const forecastService = {
  async listForecasts(page = 1, limit = 20) {
    if (env.demoMode) {
      return {
        data: [{ storeId: 'STORE-01', productId: 'SKU-001', forecastQty: 118, confidence: 0.88, horizonDays: 14 }],
        pagination: { page, limit, total: 1 },
      };
    }
    requireDatabase(env.databaseUrl);
    const [total, rows] = await prisma.$transaction([
      prisma.demandForecast.count(),
      prisma.demandForecast.findMany({
        orderBy: { generatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return { data: rows.map(mapForecast), pagination: { page, limit, total } };
  },

  async generateForecast(input: { storeId: string; productId: string; horizonDays: number }) {
    requireDatabase(env.databaseUrl);
    const since = new Date(Date.now() - 30 * 86400000);
    const sales = await prisma.salesRecord.aggregate({
      where: { storeId: input.storeId, productId: input.productId, soldAt: { gte: since } },
      _sum: { quantity: true, revenue: true },
      _count: { _all: true },
    });
    const result = await requestForecast({
      store_id: input.storeId,
      product_id: input.productId,
      horizon_days: input.horizonDays,
      features: {
        trailing_30_day_quantity: sales._sum.quantity ?? 0,
        trailing_30_day_revenue: sales._sum.revenue?.toNumber() ?? 0,
        trailing_30_day_transactions: sales._count._all,
      },
    });
    if (
      result.store_id !== input.storeId ||
      result.product_id !== input.productId ||
      result.horizon_days !== input.horizonDays
    ) {
      throw new HttpError('Forecast response does not match the requested store, product and horizon', 502);
    }
    const row = await prisma.$transaction(async (tx) => {
      const forecast = await tx.demandForecast.create({
        data: {
          storeId: result.store_id,
          productId: result.product_id,
          forecastQty: result.forecast_qty,
          confidence: result.confidence,
          horizonDays: result.horizon_days,
          generatedAt: new Date(),
          modelVersion: result.model_name,
        },
      });
      await writeAuditLog(tx, {
        actor: 'ml-service',
        action: 'demand_forecast_created',
        entityType: 'demand_forecast',
        entityId: forecast.id,
        details: { modelName: result.model_name },
      });
      return forecast;
    });
    return mapForecast(row);
  },

  async generateSpoilageRisk(batchId: string): Promise<SpoilageRiskItem> {
    requireDatabase(env.databaseUrl);
    const batch = await prisma.inventoryBatch.findUnique({
      where: { id: batchId },
      include: { product: { select: { name: true } } },
    });
    if (!batch) {
      throw new HttpError('Inventory batch not found', 404);
    }
    const daysToExpiry = Math.max(0, Math.ceil((batch.expiryDate.getTime() - Date.now()) / 86400000));
    const result = await requestSpoilageRisk({
      batch_id: batch.id,
      inventory_qty: batch.quantity,
      days_to_expiry: daysToExpiry,
      product_id: batch.productId,
      store_id: batch.storeId,
    });
    if (result.batch_id !== batch.id || result.days_to_expiry !== daysToExpiry) {
      throw new HttpError('Spoilage response does not match the requested batch and expiry horizon', 502);
    }
    const risk = await prisma.$transaction(async (tx) => {
      const created = await tx.spoilageRisk.create({
        data: {
          batchId: result.batch_id,
          riskScore: result.risk_score,
          riskLevel: result.risk_level,
          daysToExpiry: result.days_to_expiry,
          generatedAt: new Date(),
          modelVersion: result.model_name,
        },
      });
      await writeAuditLog(tx, {
        actor: 'ml-service',
        action: 'spoilage_risk_created',
        entityType: 'spoilage_risk',
        entityId: created.id,
        details: { batchId: batch.id, modelName: result.model_name },
      });
      return created;
    });
    return {
      batchId: risk.batchId,
      riskScore: risk.riskScore.toNumber(),
      riskLevel: risk.riskLevel as SpoilageRiskItem['riskLevel'],
      daysUntilExpiry: risk.daysToExpiry,
    };
  },
};
