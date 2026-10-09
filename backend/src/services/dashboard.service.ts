import { env } from '../config/env.js';
import prisma from '../config/prisma.js';
import { dashboardSeed, inventorySeed, storeSeed } from '../lib/dev-data.js';
import { requireDatabase } from '../lib/errors.js';
import type { DashboardSummary } from '../types/api.js';

function computeDemoSummary(storeId?: string): DashboardSummary {
  const inventory = storeId ? inventorySeed.filter((item) => item.storeId === storeId) : inventorySeed;
  const recent = inventory.filter((item) => item.status !== 'fresh');
  return {
    totalStores: storeId ? storeSeed.filter((store) => store.id === storeId).length : storeSeed.length,
    activeProducts: new Set(inventory.map((item) => item.productId)).size,
    stockoutRisk: inventory.length ? Math.round((inventory.filter((item) => item.quantity <= 5).length / inventory.length) * 100) : 0,
    spoilageAlerts: recent.length,
    projectedWaste: Number(inventory.reduce((sum, item) =>
      sum + (item.status === 'critical' ? item.quantity * 0.85 : item.status === 'warning' ? item.quantity * 0.35 : 0), 0).toFixed(1)),
    revenueTrend: dashboardSeed.revenueTrend,
  };
}

export const dashboardService = {
  async getSummary(storeId?: string): Promise<DashboardSummary> {
    if (env.demoMode) return computeDemoSummary(storeId);
    requireDatabase(env.databaseUrl);

    const now = new Date();
    const currentStart = new Date(now.getTime() - 7 * 86400000);
    const previousStart = new Date(now.getTime() - 14 * 86400000);
    const scopedStore = storeId ? { storeId } : {};
    const [
      totalStores,
      activeProductGroups,
      batchCount,
      stockoutCount,
      spoilageAlerts,
      waste,
      currentRevenue,
      previousRevenue,
    ] = await prisma.$transaction([
      prisma.store.count({ where: storeId ? { id: storeId } : undefined }),
      prisma.inventoryBatch.groupBy({
        by: ['productId'],
        where: scopedStore,
        orderBy: { productId: 'asc' },
      }),
      prisma.inventoryBatch.count({ where: scopedStore }),
      prisma.inventoryBatch.count({ where: { ...scopedStore, quantity: { lte: 5 } } }),
      prisma.inventoryBatch.count({
        where: {
          ...scopedStore,
          quantity: { gt: 0 },
          expiryDate: { lte: new Date(now.getTime() + 7 * 86400000) },
        },
      }),
      prisma.wasteRecord.aggregate({
        where: { ...scopedStore },
        _sum: { quantity: true },
      }),
      prisma.salesRecord.aggregate({
        where: { ...scopedStore, soldAt: { gte: currentStart, lte: now } },
        _sum: { revenue: true },
      }),
      prisma.salesRecord.aggregate({
        where: { ...scopedStore, soldAt: { gte: previousStart, lt: currentStart } },
        _sum: { revenue: true },
      }),
    ]);
    const current = currentRevenue._sum.revenue?.toNumber() ?? 0;
    const previous = previousRevenue._sum.revenue?.toNumber() ?? 0;
    const revenueTrend = previous > 0 ? ((current - previous) / previous) * 100 : 0;

    return {
      totalStores,
      activeProducts: activeProductGroups.length,
      stockoutRisk: batchCount ? Math.round((stockoutCount / batchCount) * 100) : 0,
      spoilageAlerts,
      projectedWaste: waste._sum.quantity ?? 0,
      revenueTrend: Number(revenueTrend.toFixed(1)),
    };
  },
};
