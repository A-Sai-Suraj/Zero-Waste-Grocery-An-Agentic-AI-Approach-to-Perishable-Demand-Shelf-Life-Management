import { env } from '../config/env.js';
import prisma from '../config/prisma.js';
import { requireDatabase } from '../lib/errors.js';

export const auditQueryService = {
  async list(page = 1, limit = 20) {
    if (env.demoMode) return { data: [], pagination: { page, limit, total: 0 } };
    requireDatabase(env.databaseUrl);
    const [total, rows] = await prisma.$transaction([
      prisma.auditLog.count(),
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return {
      data: rows.map((row) => ({
        id: row.id,
        actor: row.actor,
        action: row.action,
        entity: row.entityType,
        entityId: row.entityId,
        timestamp: row.createdAt.toISOString(),
        details: row.details,
      })),
      pagination: { page, limit, total },
    };
  },
};
