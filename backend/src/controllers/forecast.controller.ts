import type { Request, Response } from 'express';
import { forecastService } from '../services/forecast.service.js';
import { forecastRequestSchema, paginationQuerySchema, spoilagePredictionRequestSchema } from '../validation/schemas.js';

export const forecastController = {
  async list(req: Request, res: Response) {
    const query = paginationQuerySchema.parse(req.query);
    res.json(await forecastService.listForecasts(query.page, query.limit));
  },

  async generate(req: Request, res: Response) {
    const input = forecastRequestSchema.parse(req.body);
    res.status(201).json(await forecastService.generateForecast(input));
  },

  async generateSpoilageRisk(req: Request, res: Response) {
    const input = spoilagePredictionRequestSchema.parse(req.body);
    res.status(201).json(await forecastService.generateSpoilageRisk(input.batchId));
  },
};
