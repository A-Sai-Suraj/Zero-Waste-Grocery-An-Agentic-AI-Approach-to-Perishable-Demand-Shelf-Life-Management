export type Role = 'Admin' | 'StoreManager' | 'Analyst';

export interface DashboardSummary {
  totalStores: number;
  activeProducts: number;
  stockoutRisk: number;
  spoilageAlerts: number;
  projectedWaste: number;
  revenueTrend: number;
}

export interface InventoryBatchItem {
  id: string;
  productId: string;
  productName: string;
  storeId: string;
  quantity: number;
  expiryDate: string;
  status: 'fresh' | 'warning' | 'critical';
}

export interface DemandForecastItem {
  productId: string;
  storeId: string;
  forecastQty: number;
  confidence: number;
  horizonDays: number;
}

export interface SpoilageRiskItem {
  batchId: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  daysUntilExpiry: number;
}

export interface RecommendationItem {
  id: string;
  type: 'replenish' | 'markdown' | 'transfer';
  productId: string;
  storeId: string;
  suggestedAction: string;
  confidence: number;
  status: 'draft' | 'approved' | 'rejected';
}

export interface ApiErrorResponse {
  error: string;
  details?: Record<string, unknown>;
}
