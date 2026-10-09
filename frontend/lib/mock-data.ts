// Synthetic demo fixtures, kept separate from the live API client.

import type { DashboardSummary, InventoryBatch, Recommendation } from '@/types/api';

export const mockDashboardSummary: DashboardSummary = {
  overview: {
    activeStores: 3,
    trackedProducts: 6,
    totalInventoryUnits: 226,
    totalInventoryValuation: 745.7,
    currency: 'USD',
  },
  alerts: {
    nearExpiryBatchesCount: 4,
    expiredBatchesCount: 0,
    pendingRecommendationsCount: 3,
  },
  wasteTracking: {
    period: 'Last 30 Days',
    totalUnitsWasted: 12,
    totalLossValue: 38.4,
  },
  recentProposals: [],
};

export const mockInventory: InventoryBatch[] = [
  {
    id: 'INV-1001',
    batchNumber: 'LOT-AVO-2026-01',
    store: { id: 'STORE-01', code: 'STORE-001', name: 'Downtown Metro Market', city: 'Metro City' },
    product: {
      id: 'SKU-001',
      sku: 'SKU-AVOCADO-01',
      name: 'Organic Hass Avocados (4-Pack)',
      category: 'PRODUCE',
      unitOfMeasure: 'PACK',
      basePrice: 5.99,
    },
    quantity: 42,
    initialQuantity: 50,
    unitCost: 3.2,
    receivedDate: '2026-10-06T18:00:00.000Z',
    expiryDate: '2026-10-15T18:00:00.000Z',
    daysUntilExpiry: 5,
    isExpired: false,
    status: 'BATCH_ACTIVE',
    source: 'SIMULATED',
    createdAt: '2026-10-09T18:00:00.000Z',
  },
];

export const mockRecommendations: Recommendation[] = [
  {
    id: 'REC-001',
    recommendationNumber: 'REC-202610-001',
    actionType: 'MARKDOWN',
    status: 'PROPOSED',
    product: {
      id: 'SKU-001',
      sku: 'SKU-SALMON-01',
      name: 'Atlantic Salmon Fillet (1 lb)',
      category: 'MEAT_SEAFOOD',
      basePrice: 12.99,
    },
    store: { id: 'STORE-01', code: 'STORE-001', name: 'Downtown Metro Market', city: 'Metro City' },
    donorStore: null,
    recipientStore: null,
    batch: {
      id: 'BATCH-01',
      batchNumber: 'LOT-SAL-MET-01',
      quantity: 15,
      expiryDate: '2026-10-10T18:00:00.000Z',
    },
    proposedQuantity: 15,
    proposedPrice: 9.09,
    proposedDiscountPercent: 30,
    rationale: 'Batch expires soon. Markdown to accelerate sell-through.',
    evidence: {},
    assumptions: {},
    confidenceScore: 0.88,
    modelVersion: 'rules-v1.0',
    createdAt: '2026-10-09T18:00:00.000Z',
    decisions: [],
  },
];
