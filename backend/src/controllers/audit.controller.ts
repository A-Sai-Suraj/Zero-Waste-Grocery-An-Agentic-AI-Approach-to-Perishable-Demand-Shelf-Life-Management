import type { Request, Response } from 'express';
import { auditQueryService } from '../services/audit-query.service.js';
import { paginationQuerySchema } from '../validation/schemas.js';

export const auditController = {
  async list(req: Request, res: Response) {
    const query = paginationQuerySchema.parse(req.query);
    res.json(await auditQueryService.list(query.page, query.limit));
  },
};
