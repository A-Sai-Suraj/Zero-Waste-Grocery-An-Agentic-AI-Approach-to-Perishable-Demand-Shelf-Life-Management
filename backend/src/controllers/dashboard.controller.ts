import type { Request, Response } from 'express';
import { dashboardService } from '../services/dashboard.service.js';

export const dashboardController = {
  async getSummary(req: Request, res: Response) {
    const storeId = typeof req.query.storeId === 'string' ? req.query.storeId : undefined;
    const data = await dashboardService.getSummary(storeId);
    res.json(data);
  },
};
