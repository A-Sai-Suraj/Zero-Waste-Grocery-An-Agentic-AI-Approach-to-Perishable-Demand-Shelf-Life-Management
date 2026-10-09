import type { Request, Response } from 'express';
import { inventoryService } from '../services/inventory.service.js';
import { inventoryQuerySchema, inventoryIngestionSchema, recordIdSchema } from '../validation/schemas.js';
import { env } from '../config/env.js';
import { ingestionService } from '../services/ingestion.service.js';

const getFirstParam = (value: unknown): string | undefined => {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === 'string') {
    return value[0];
  }

  return undefined;
};

export const inventoryController = {
  async list(req: Request, res: Response) {
    const query = inventoryQuerySchema.parse({
      ...req.query,
      storeId: getFirstParam(req.query.storeId),
      productId: getFirstParam(req.query.productId),
      status: getFirstParam(req.query.status),
      page: getFirstParam(req.query.page),
      limit: getFirstParam(req.query.limit),
    });
    const pagination = await inventoryService.list(
      query.storeId,
      query.status,
      query.productId,
      query.page,
      query.limit,
    );
    res.json(pagination);
  },

  async getByBatchId(req: Request, res: Response) {
    const batchId = recordIdSchema.parse(getFirstParam(req.params.batchId));
    const item = await inventoryService.getByBatchId(batchId);
    if (!item) {
      res.status(404).json({ error: 'Inventory batch not found' });
      return;
    }
    res.json(item);
  },

  async getExpiryAlerts(_req: Request, res: Response) {
    const data = await inventoryService.getAlerts();
    res.json(data);
  },

  async getStoredSpoilageRisks(_req: Request, res: Response) {
    res.json(await inventoryService.getStoredSpoilageRisks());
  },

  async ingestInventory(req: Request, res: Response) {
    const parsed = inventoryIngestionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid inventory ingestion payload', details: parsed.error });
      return;
    }
    const payload = parsed.data;
    if (env.demoMode) {
      const result = await inventoryService.ingestInventory({
        id: payload.batchId,
        sourceId: payload.idempotencyKey,
        productId: payload.productId,
        storeId: payload.storeId,
        quantity: payload.quantity,
        expiryDate: payload.expiryDate,
        status: payload.status,
      });
      res.status(result.duplicate ? 200 : 201).json({
        accepted: result.duplicate ? 0 : 1,
        rejected: 0,
        duplicate: result.duplicate,
        data: result.item,
        status: 'demo_only',
      });
      return;
    }
    const result = await ingestionService.inventory(payload);
    res.status(result.duplicate ? 200 : 201).json({
      accepted: result.duplicate ? 0 : 1,
      rejected: 0,
      duplicate: result.duplicate,
      data: result.record,
      status: result.duplicate ? 'duplicate' : 'persisted',
    });
  },
};
