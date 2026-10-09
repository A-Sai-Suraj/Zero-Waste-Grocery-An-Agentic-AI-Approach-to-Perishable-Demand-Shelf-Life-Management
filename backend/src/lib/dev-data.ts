import type {
  DashboardSummary,
  InventoryItem,
  RecommendationRecord,
  StoreRecord,
  ProductRecord,
  SalesRecord,
} from '../types/api.js';

export const storeSeed: StoreRecord[] = [
  { id: 'STORE-01', name: 'Downtown Fresh Market', region: 'North', timezone: 'UTC' },
  { id: 'STORE-02', name: 'Riverside Grocery', region: 'Central', timezone: 'UTC' },
  { id: 'STORE-03', name: 'Green Valley Market', region: 'South', timezone: 'UTC' },
];

export const productSeed: ProductRecord[] = [
  { id: 'SKU-001', name: 'Avocado', sku: 'AV-001', category: 'Fruit', unit: 'unit' },
  { id: 'SKU-002', name: 'Milk', sku: 'MIL-002', category: 'Dairy', unit: 'liter' },
  { id: 'SKU-003', name: 'Spinach', sku: 'SP-003', category: 'Leafy Greens', unit: 'bundle' },
  { id: 'SKU-004', name: 'Bananas', sku: 'BAN-004', category: 'Fruit', unit: 'kg' },
];

export const inventorySeed: InventoryItem[] = [
  { id: 'BATCH-001', productId: 'SKU-001', productName: 'Avocado', storeId: 'STORE-01', quantity: 42, expiryDate: '2026-10-15', status: 'warning' },
  { id: 'BATCH-002', productId: 'SKU-002', productName: 'Milk', storeId: 'STORE-01', quantity: 18, expiryDate: '2026-10-12', status: 'critical' },
  { id: 'BATCH-003', productId: 'SKU-003', productName: 'Spinach', storeId: 'STORE-02', quantity: 30, expiryDate: '2026-10-18', status: 'fresh' },
  { id: 'BATCH-004', productId: 'SKU-004', productName: 'Bananas', storeId: 'STORE-03', quantity: 56, expiryDate: '2026-10-20', status: 'fresh' },
];

export const salesSeed: SalesRecord[] = [
  { id: 'SALE-001', storeId: 'STORE-01', productId: 'SKU-001', quantity: 16, revenue: 52.8, soldAt: '2026-10-06T09:00:00.000Z' },
  { id: 'SALE-002', storeId: 'STORE-01', productId: 'SKU-002', quantity: 12, revenue: 35.64, soldAt: '2026-10-06T12:30:00.000Z' },
  { id: 'SALE-003', storeId: 'STORE-02', productId: 'SKU-003', quantity: 20, revenue: 41.8, soldAt: '2026-10-05T15:00:00.000Z' },
];

export const recommendationSeed: RecommendationRecord[] = [
  {
    id: 'REC-001',
    storeId: 'STORE-01',
    productId: 'SKU-001',
    actionType: 'replenish',
    status: 'approved',
    confidence: 0.86,
    quantity: 120,
    reason: 'Demand trend indicates weekend uplift for avocados.',
    evidence: 'Forecast + recent sales velocity',
    createdAt: '2026-10-08T10:30:00.000Z',
    updatedAt: '2026-10-08T10:30:00.000Z',
    decisionHistory: [{ actor: 'planner', decision: 'approved', at: '2026-10-08T10:30:00.000Z' }],
  },
  {
    id: 'REC-002',
    storeId: 'STORE-02',
    productId: 'SKU-003',
    actionType: 'markdown',
    status: 'draft',
    confidence: 0.72,
    quantity: 30,
    reason: 'Forecast spoilage risk is elevated within the next four days.',
    evidence: 'Spoilage risk score from ML service',
    createdAt: '2026-10-08T12:00:00.000Z',
    updatedAt: '2026-10-08T12:00:00.000Z',
    decisionHistory: [{ actor: 'auto', decision: 'created', at: '2026-10-08T12:00:00.000Z' }],
  },
];

export const dashboardSeed: DashboardSummary = {
  totalStores: 3,
  activeProducts: 4,
  stockoutRisk: 12,
  spoilageAlerts: 2,
  projectedWaste: 38.4,
  revenueTrend: 7.2,
};
