import { z } from 'zod';

export const dashboardSummaryQuerySchema = z.object({
  storeId: z.string().trim().min(1).optional(),
  dateRange: z.string().trim().optional(),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const recordIdSchema = z.string().trim().min(1).max(200);

export const inventoryQuerySchema = z.object({
  storeId: z.string().trim().min(1).optional(),
  productId: z.string().trim().min(1).optional(),
  status: z.enum(['fresh', 'warning', 'critical']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const recommendationCreateSchema = z.object({
  storeId: z.string().trim().min(1),
  productId: z.string().trim().min(1),
  actionType: z.enum(['replenish', 'markdown', 'transfer']),
  quantity: z.coerce.number().min(0).optional(),
  reason: z.string().trim().min(3).max(500).optional(),
  confidence: z.coerce.number().min(0).max(1).optional(),
  evidence: z.string().trim().min(3).max(500).optional(),
});

export const recommendationModifySchema = z.object({
  actionType: z.enum(['replenish', 'markdown', 'transfer']).optional(),
  quantity: z.coerce.number().min(0).optional(),
  reason: z.string().trim().min(3).max(500).optional(),
  notes: z.string().trim().max(500).optional(),
});

export const approvalSchema = z.object({
  approved: z.boolean(),
  comments: z.string().trim().max(500).optional(),
});

export const salesIngestionSchema = z.object({
  idempotencyKey: z.string().trim().min(1).max(200).optional(),
  storeId: z.string().trim().min(1),
  productId: z.string().trim().min(1),
  quantity: z.coerce.number().int().positive(),
  revenue: z.coerce.number().nonnegative(),
  soldAt: z.string().datetime({ offset: true }),
});

export const inventoryIngestionSchema = z.object({
  idempotencyKey: z.string().trim().min(1).max(200).optional(),
  productId: z.string().trim().min(1),
  storeId: z.string().trim().min(1),
  batchId: z.string().trim().min(1).optional(),
  quantity: z.coerce.number().int().min(0),
  expiryDate: z.string().date(),
  status: z.enum(['fresh', 'warning', 'critical']).optional(),
});

const positiveId = z.string().trim().min(1);
const optionalIdempotencyKey = z.string().trim().min(1).max(200).optional();
const isoDateTime = z.string().datetime({ offset: true });

export const receiptIngestionSchema = z.object({
  idempotencyKey: optionalIdempotencyKey,
  storeId: positiveId,
  supplierName: z.string().trim().max(200).optional(),
  orderDate: isoDateTime,
  deliveredAt: isoDateTime.optional(),
  totalCost: z.coerce.number().finite().nonnegative(),
  lines: z.array(z.object({
    productId: positiveId,
    batchId: positiveId.optional(),
    quantity: z.coerce.number().int().positive(),
    unitCost: z.coerce.number().finite().nonnegative(),
  })).min(1).max(500),
});

export const promotionIngestionSchema = z.object({
  idempotencyKey: optionalIdempotencyKey,
  storeId: positiveId,
  productId: positiveId.optional(),
  name: z.string().trim().min(1).max(200),
  discountPct: z.coerce.number().finite().min(0).max(100),
  startsAt: isoDateTime,
  endsAt: isoDateTime.optional(),
}).refine((value) => !value.endsAt || Date.parse(value.endsAt) >= Date.parse(value.startsAt), {
  message: 'endsAt must be on or after startsAt',
  path: ['endsAt'],
});

export const wasteIngestionSchema = z.object({
  idempotencyKey: optionalIdempotencyKey,
  storeId: positiveId,
  productId: positiveId,
  batchId: positiveId.optional(),
  quantity: z.coerce.number().int().positive(),
  reason: z.string().trim().min(1).max(500),
  recordedAt: isoDateTime,
});

export const forecastRequestSchema = z.object({
  storeId: positiveId,
  productId: positiveId,
  horizonDays: z.coerce.number().int().min(1).max(30),
});

export const spoilagePredictionRequestSchema = z.object({
  batchId: positiveId,
});
