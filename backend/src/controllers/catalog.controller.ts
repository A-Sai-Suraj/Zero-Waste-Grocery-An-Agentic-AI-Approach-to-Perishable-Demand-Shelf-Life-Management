import type { Request, Response } from 'express';
import { catalogService } from '../services/catalog.service.js';
import { paginationQuerySchema } from '../validation/schemas.js';

export const catalogController = {
  async stores(req: Request, res: Response) {
    const query = paginationQuerySchema.parse(req.query);
    res.json(await catalogService.listStores(query.page, query.limit));
  },

  async products(req: Request, res: Response) {
    const query = paginationQuerySchema.parse(req.query);
    res.json(await catalogService.listProducts(query.page, query.limit));
  },
};
