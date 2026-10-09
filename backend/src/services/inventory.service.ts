import type { InventoryBatchItem, SpoilageRiskItem } from '../types/api.js';

const inventoryData: InventoryBatchItem[] = [
  {
    id: 'INV-1001',
    productId: 'SKU-001',
    productName: 'Avocado',
    storeId: 'STORE-01',
    quantity: 42,
    expiryDate: '2026-10-15',
    status: 'warning',
  },
  {
    id: 'INV-1002',
    productId: 'SKU-002',
    productName: 'Milk',
    storeId: 'STORE-01',
    quantity: 18,
    expiryDate: '2026-10-12',
    status: 'critical',
  },
  {
    id: 'INV-1003',
    productId: 'SKU-003',
    productName: 'Spinach',
    storeId: 'STORE-02',
    quantity: 30,
    expiryDate: '2026-10-18',
    status: 'fresh',
  },
];

export const inventoryService = {
  async list(storeId?: string, status?: 'fresh' | 'warning' | 'critical') {
    return inventoryData.filter((item) => {
      const byStore = !storeId || item.storeId === storeId;
      const byStatus = !status || item.status === status;
      return byStore && byStatus;
    });
  },

  async getExpiryAlerts(): Promise<SpoilageRiskItem[]> {
    return [
      { batchId: 'INV-1002', riskScore: 88, riskLevel: 'high', daysUntilExpiry: 2 },
      { batchId: 'INV-1001', riskScore: 67, riskLevel: 'medium', daysUntilExpiry: 5 },
    ];
  },
};
