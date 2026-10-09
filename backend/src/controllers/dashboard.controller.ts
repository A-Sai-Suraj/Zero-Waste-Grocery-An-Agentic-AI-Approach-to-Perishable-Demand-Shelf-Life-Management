import type { Request, Response } from 'express';
import { dashboardService } from '../services/dashboard.service.js';
import { dashboardSummaryQuerySchema } from '../validation/schemas.js';

export const dashboardController = {
  async getSummary(req: Request, res: Response) {
    const parsed = dashboardSummaryQuerySchema.parse(req.query);
    const data = await dashboardService.getSummary(parsed.storeId);
    res.json(data);
  },
};
