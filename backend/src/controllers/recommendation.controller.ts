import type { Request, Response } from 'express';
import { recommendationService } from '../services/recommendation.service.js';

export const recommendationController = {
  async list(_req: Request, res: Response) {
    const data = await recommendationService.list();
    res.json(data);
  },

  async generate(req: Request, res: Response) {
    const data = await recommendationService.generate(req.body);
    res.status(201).json(data);
  },

  async approve(req: Request, res: Response) {
    const recommendationId = req.params.id;
    const data = await recommendationService.approve(recommendationId, req.body);
    res.json(data);
  },
  async reject(req: Request, res: Response) {
    const recommendationId = req.params.id;
    const data = await recommendationService.reject(recommendationId, req.body);
    res.json(data);
  },
};
