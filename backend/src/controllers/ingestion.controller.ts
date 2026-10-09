import type { Request, Response } from 'express';
import {
  inventoryIngestionSchema,
  promotionIngestionSchema,
  receiptIngestionSchema,
  salesIngestionSchema,
  wasteIngestionSchema,
} from '../validation/schemas.js';
import { ingestionService } from '../services/ingestion.service.js';
import { inventoryService } from '../services/inventory.service.js';
import { env } from '../config/env.js';

function parseInput<T>(schema: { safeParse(input: unknown): { success: true; data: T } | { success: false; error: unknown } }, input: unknown, res: Response, message: string): T | null {
  const result = schema.safeParse(input);
  if (!result.success) {
    res.status(400).json({ error: message, details: result.error });
    return null;
  }
  return result.data;
}

export const ingestionController = {
  async ingestSales(req: Request, res: Response) {
    const input = parseInput(salesIngestionSchema, req.body, res, 'Invalid sales payload');
    if (!input) return;
    const result = await ingestionService.sales(input);
    res.status(result.duplicate ? 200 : 201).json({
      accepted: result.duplicate ? 0 : 1,
      rejected: 0,
      duplicate: result.duplicate,
      data: result.record,
      status: result.duplicate ? 'duplicate' : 'persisted',
    });
  },

  async ingestInventory(req: Request, res: Response) {
    const input = parseInput(inventoryIngestionSchema, req.body, res, 'Invalid inventory payload');
    if (!input) return;
    const result = env.demoMode
      ? await inventoryService.ingestInventory({
          id: input.batchId,
          sourceId: input.idempotencyKey,
          productId: input.productId,
          storeId: input.storeId,
          quantity: input.quantity,
          expiryDate: input.expiryDate,
          status: input.status,
        })
      : await ingestionService.inventory(input);
    const record = 'item' in result ? result.item : result.record;
    res.status(result.duplicate ? 200 : 201).json({
      accepted: result.duplicate ? 0 : 1,
      rejected: 0,
      duplicate: result.duplicate,
      data: record,
      status: result.duplicate ? 'duplicate' : env.demoMode ? 'demo_only' : 'persisted',
    });
  },

  async ingestReceipt(req: Request, res: Response) {
    const input = parseInput(receiptIngestionSchema, req.body, res, 'Invalid receipt payload');
    if (!input) return;
    const result = await ingestionService.receipt(input);
    res.status(result.duplicate ? 200 : 201).json({
      accepted: result.duplicate ? 0 : 1,
      rejected: 0,
      duplicate: result.duplicate,
      data: result.record,
      status: result.duplicate ? 'duplicate' : 'persisted',
    });
  },

  async ingestPromotion(req: Request, res: Response) {
    const input = parseInput(promotionIngestionSchema, req.body, res, 'Invalid promotion payload');
    if (!input) return;
    const result = await ingestionService.promotion(input);
    res.status(result.duplicate ? 200 : 201).json({
      accepted: result.duplicate ? 0 : 1,
      rejected: 0,
      duplicate: result.duplicate,
      data: result.record,
      status: result.duplicate ? 'duplicate' : 'persisted',
    });
  },

  async ingestWaste(req: Request, res: Response) {
    const input = parseInput(wasteIngestionSchema, req.body, res, 'Invalid waste payload');
    if (!input) return;
    const result = await ingestionService.waste(input);
    res.status(result.duplicate ? 200 : 201).json({
      accepted: result.duplicate ? 0 : 1,
      rejected: 0,
      duplicate: result.duplicate,
      data: result.record,
      status: result.duplicate ? 'duplicate' : 'persisted',
    });
  },
};
