import { env } from '../config/env.js';
import prisma from '../config/prisma.js';
import { productSeed, storeSeed } from '../lib/dev-data.js';
import { requireDatabase } from '../lib/errors.js';
import type { PaginatedResponse, ProductRecord, StoreRecord } from '../types/api.js';

export const catalogService = {
  async listStores(page = 1, limit = 20): Promise<PaginatedResponse<StoreRecord>> {
    if (env.demoMode) {
      return { data: storeSeed.slice((page - 1) * limit, page * limit), pagination: { page, limit, total: storeSeed.length } };
    }
    requireDatabase(env.databaseUrl);
    const [total, rows] = await prisma.$transaction([
      prisma.store.count(),
      prisma.store.findMany({
        orderBy: [{ name: 'asc' }, { id: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return {
      data: rows.map((row) => ({ id: row.id, name: row.name, region: row.region ?? '', timezone: row.timezone })),
      pagination: { page, limit, total },
    };
  },

  async listProducts(page = 1, limit = 20): Promise<PaginatedResponse<ProductRecord>> {
    if (env.demoMode) {
      return { data: productSeed.slice((page - 1) * limit, page * limit), pagination: { page, limit, total: productSeed.length } };
    }
    requireDatabase(env.databaseUrl);
    const [total, rows] = await prisma.$transaction([
      prisma.product.count(),
      prisma.product.findMany({
        orderBy: [{ name: 'asc' }, { id: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return {
      data: rows.map((row) => ({
        id: row.id,
        name: row.name,
        sku: row.sku,
        category: row.category,
        unit: row.unit,
      })),
      pagination: { page, limit, total },
    };
  },
};
