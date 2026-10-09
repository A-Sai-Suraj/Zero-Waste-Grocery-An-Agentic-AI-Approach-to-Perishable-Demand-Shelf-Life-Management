import type { Request, Response } from 'express';
import { inventoryService } from '../services/inventory.service.js';

export const inventoryController = {
  async list(req: Request, res: Response) {
    const storeId = typeof req.query.storeId === 'string' ? req.query.storeId : undefined;
    const status = typeof req.query.status === 'string' ? (req.query.status as 'fresh' | 'warning' | 'critical') : undefined;
    const data = await inventoryService.list(storeId, status);
    res.json(data);
  },

  async getExpiryAlerts(_req: Request, res: Response) {
    const data = await inventoryService.getExpiryAlerts();
    res.json(data);
  },
};
