import { z } from 'zod';

export const dashboardSummaryQuerySchema = z.object({
  storeId: z.string().optional(),
  dateRange: z.string().optional(),
});

export const inventoryQuerySchema = z.object({
  storeId: z.string().optional(),
  productId: z.string().optional(),
  status: z.enum(['fresh', 'warning', 'critical']).optional(),
});

export const recommendationCreateSchema = z.object({
  storeId: z.string().min(1),
  productId: z.string().min(1),
  actionType: z.enum(['replenish', 'markdown', 'transfer']),
  quantity: z.number().min(0).optional(),
  reason: z.string().min(3).max(500).optional(),
});

export const approvalSchema = z.object({
  approved: z.boolean(),
  comments: z.string().max(500).optional(),
});
