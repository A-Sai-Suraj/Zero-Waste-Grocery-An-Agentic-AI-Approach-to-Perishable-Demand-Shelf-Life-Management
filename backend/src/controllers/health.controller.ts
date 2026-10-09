import type { Request, Response } from 'express';
import { env } from '../config/env.js';
import prisma from '../config/prisma.js';

export const healthController = {
  async getHealth(_req: Request, res: Response) {
    if (env.demoMode) {
      res.json({
        status: 'demo',
        service: 'zerowaste-backend',
        databaseConfigured: Boolean(env.databaseUrl),
        databaseConnected: false,
        timestamp: new Date().toISOString(),
      });
      return;
    }
    if (!env.databaseUrl) {
      res.status(503).json({
        status: 'degraded',
        service: 'zerowaste-backend',
        databaseConfigured: false,
        databaseConnected: false,
        timestamp: new Date().toISOString(),
      });
      return;
    }
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({
        status: 'ok',
        service: 'zerowaste-backend',
        databaseConfigured: true,
        databaseConnected: true,
        timestamp: new Date().toISOString(),
      });
    } catch {
      res.status(503).json({
        status: 'degraded',
        service: 'zerowaste-backend',
        databaseConfigured: true,
        databaseConnected: false,
        timestamp: new Date().toISOString(),
      });
    }
  },
};
