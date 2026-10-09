import type { DashboardSummary, InventoryItem, Recommendation } from '@/types/api';

export const mockDashboardSummary: DashboardSummary = {
  totalStores: 7,
  activeProducts: 312,
  stockoutRisk: 14,
  spoilageAlerts: 23,
  projectedWaste: 128.4,
  revenueTrend: 6.7,
};

export const mockInventory: InventoryItem[] = [
  { id: 'INV-1001', productId: 'SKU-001', productName: 'Avocado', storeId: 'STORE-01', quantity: 42, expiryDate: '2026-10-15', status: 'warning' },
  { id: 'INV-1002', productId: 'SKU-002', productName: 'Milk', storeId: 'STORE-01', quantity: 18, expiryDate: '2026-10-12', status: 'critical' },
  { id: 'INV-1003', productId: 'SKU-003', productName: 'Spinach', storeId: 'STORE-02', quantity: 30, expiryDate: '2026-10-18', status: 'fresh' },
];

export const mockRecommendations: Recommendation[] = [
  { id: 'REC-001', type: 'replenish', productId: 'SKU-001', storeId: 'STORE-01', suggestedAction: 'Replenish 120 units of avocado before the weekend surge.', confidence: 0.86, status: 'draft' },
  { id: 'REC-002', type: 'markdown', productId: 'SKU-005', storeId: 'STORE-04', suggestedAction: 'Markdown 30% of berries with 4 days remaining shelf life.', confidence: 0.74, status: 'approved' },
];
