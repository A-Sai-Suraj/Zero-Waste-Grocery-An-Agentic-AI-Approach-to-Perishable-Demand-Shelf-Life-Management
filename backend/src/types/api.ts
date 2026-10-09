export type Role = 'Admin' | 'StoreManager' | 'Analyst';
export type InventoryStatus = 'fresh' | 'warning' | 'critical';
export type RecommendationActionType = 'replenish' | 'markdown' | 'transfer';
export type RecommendationStatus = 'draft' | 'approved' | 'rejected' | 'executed' | 'failed';

export interface StoreRecord {
  id: string;
  name: string;
  region: string;
  timezone: string;
}

export interface ProductRecord {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
}

export interface SalesRecord {
  id: string;
  storeId: string;
  productId: string;
  quantity: number;
  revenue: number;
  soldAt: string;
}

export interface DashboardSummary {
  totalStores: number;
  activeProducts: number;
  stockoutRisk: number;
  spoilageAlerts: number;
  projectedWaste: number;
  revenueTrend: number;
}

export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  storeId: string;
  quantity: number;
  expiryDate: string;
  status: InventoryStatus;
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

export interface DecisionEvent {
  actor: string;
  decision: string;
  at: string;
}

export interface RecommendationRecord {
  id: string;
  storeId: string;
  productId: string;
  actionType: RecommendationActionType;
  status: RecommendationStatus;
  confidence: number;
  quantity: number;
  reason: string;
  evidence: string;
  createdAt: string;
  updatedAt: string;
  decisionHistory: DecisionEvent[];
}

export interface ApiErrorResponse {
  error: string;
  details?: Record<string, unknown>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface IngestionResult {
  accepted: number;
  rejected: number;
  errors: Array<{ index: number; message: string; raw?: unknown }>;
}
