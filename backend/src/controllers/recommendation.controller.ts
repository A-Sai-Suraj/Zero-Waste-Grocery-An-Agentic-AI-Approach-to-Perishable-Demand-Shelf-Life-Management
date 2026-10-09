import type { Request, Response } from 'express';
import { recommendationService } from '../services/recommendation.service.js';
import { approvalSchema, recommendationCreateSchema, recommendationModifySchema, recordIdSchema } from '../validation/schemas.js';

const getFirstParam = (value: unknown): string | undefined => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  return undefined;
};

export const recommendationController = {
  async list(_req: Request, res: Response) {
    res.json(await recommendationService.list());
  },

  async getById(req: Request, res: Response) {
    const id = recordIdSchema.parse(getFirstParam(req.params.id));
    const data = await recommendationService.getById(id);
    if (!data) {
      res.status(404).json({ error: 'Recommendation not found' });
      return;
    }
    res.json(data);
  },

  async generate(req: Request, res: Response) {
    const payload = recommendationCreateSchema.parse(req.body);
    res.status(201).json(await recommendationService.create(payload));
  },

  async approve(req: Request, res: Response) {
    const payload = approvalSchema.parse(req.body ?? {});
    if (!payload.approved) {
      res.status(400).json({ error: 'Approval requests must set approved to true' });
      return;
    }
    const id = recordIdSchema.parse(getFirstParam(req.params.id));
    const recommendation = await recommendationService.approve(id, 'planner', payload.comments);
    res.json({ recommendation, approved: true });
  },

  async reject(req: Request, res: Response) {
    const payload = approvalSchema.parse(req.body ?? {});
    if (payload.approved) {
      res.status(400).json({ error: 'Rejection requests must set approved to false' });
      return;
    }
    const id = recordIdSchema.parse(getFirstParam(req.params.id));
    const recommendation = await recommendationService.reject(id, 'planner', payload.comments);
    res.json({ recommendation, rejected: true });
  },

  async modify(req: Request, res: Response) {
    const payload = recommendationModifySchema.parse(req.body ?? {});
    const id = recordIdSchema.parse(getFirstParam(req.params.id));
    const recommendation = await recommendationService.modify(id, payload, 'planner', payload.notes);
    res.json(recommendation);
  },

  async execute(req: Request, res: Response) {
    const id = recordIdSchema.parse(getFirstParam(req.params.id));
    res.json(await recommendationService.execute(id, 'planner'));
  },
};
