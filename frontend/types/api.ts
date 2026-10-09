export type DashboardSummary = {
  totalStores: number;
  activeProducts: number;
  stockoutRisk: number;
  spoilageAlerts: number;
  projectedWaste: number;
  revenueTrend: number;
};

export type InventoryItem = {
  id: string;
  productId: string;
  productName: string;
  storeId: string;
  quantity: number;
  expiryDate: string;
  status: 'fresh' | 'warning' | 'critical';
};

export type Recommendation = {
  id: string;
  type: 'replenish' | 'markdown' | 'transfer';
  productId: string;
  storeId: string;
  suggestedAction: string;
  confidence: number;
  status: 'draft' | 'approved' | 'rejected';
};
