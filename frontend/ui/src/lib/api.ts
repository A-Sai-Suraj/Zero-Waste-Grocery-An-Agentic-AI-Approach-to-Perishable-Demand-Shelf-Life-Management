import {
  AlertTier,
  BatchItem,
  BatchStatus,
  EvaluationMetrics,
  ExpiryAlert,
  Recommendation,
  RecommendationStatus,
  RecommendationType,
  Store,
  StoreId,
  TransferRoute,
} from '../types';

const configuredApiBase = import.meta.env.VITE_API_URL?.trim();
const API_BASE = (configuredApiBase || (import.meta.env.PROD ? '' : 'http://localhost:5000/api/v1')).replace(/\/+$/, '');
export const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

function hasValidProductionApiBase(): boolean {
  if (!import.meta.env.PROD) return true;
  if (!configuredApiBase) return false;
  try {
    const url = new URL(configuredApiBase);
    return url.protocol === 'https:' &&
      !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash &&
      url.pathname.replace(/\/+$/, '').endsWith('/api/v1');
  } catch {
    return false;
  }
}

export interface Page<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number };
}

interface StoreRecord {
  id: string;
  name: string;
  region: string;
}

export interface ProductRecord {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
}

interface InventoryRecord {
  id: string;
  productId: string;
  productName: string;
  storeId: string;
  quantity: number;
  expiryDate: string;
  status: 'fresh' | 'warning' | 'critical';
}

interface RecommendationRecord {
  id: string;
  storeId: string;
  productId: string;
  actionType: 'replenish' | 'markdown' | 'transfer';
  status: 'draft' | 'approved' | 'rejected' | 'executed' | 'failed';
  confidence: number;
  quantity: number;
  reason: string;
  evidence: string;
  createdAt: string;
  decisionHistory: Array<{ actor: string; decision: string; at: string }>;
}

interface SpoilageRiskRecord {
  batchId: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  daysUntilExpiry: number;
}

interface DashboardSummary {
  totalStores: number;
  activeProducts: number;
  stockoutRisk: number;
  spoilageAlerts: number;
  projectedWaste: number;
  revenueTrend: number;
}

export interface ForecastRecord {
  storeId: string;
  productId: string;
  forecastQty: number;
  confidence: number;
  horizonDays: number;
}

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function errorMessage(payload: unknown, status: number): string {
  if (isRecord(payload) && typeof payload.error === 'string') return payload.error;
  if (isRecord(payload) && isRecord(payload.error) && typeof payload.error.message === 'string') {
    return payload.error.message;
  }
  if (isRecord(payload) && typeof payload.message === 'string') return payload.message;
  if (typeof payload === 'string' && payload.trim()) return payload;
  return `Request failed with HTTP ${status}`;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!API_BASE || !hasValidProductionApiBase()) {
    throw new ApiError('Production VITE_API_URL must be an HTTPS backend URL ending in /api/v1 and must not use localhost.', 503);
  }
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
    cache: 'no-store',
  });
  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text) as unknown;
    } catch {
      if (response.ok) throw new Error('The backend returned invalid JSON.');
      payload = text;
    }
  }
  if (!response.ok) throw new ApiError(errorMessage(payload, response.status), response.status);
  if (payload === null) throw new Error('The backend returned an empty response.');
  return payload as T;
}

function queryString(values: Record<string, string | number | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined) params.set(key, String(value));
  }
  const value = params.toString();
  return value ? `?${value}` : '';
}

function daysUntil(date: string): number {
  const target = new Date(`${date.slice(0, 10)}T00:00:00.000Z`);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000);
}

function categoryFor(value: string): string {
  return value;
}

function mapBatchStatus(status: InventoryRecord['status'], daysLeft: number): BatchStatus {
  if (daysLeft < 0) return 'Expired';
  if (status === 'critical') return 'Critical';
  if (status === 'warning') return 'Warning';
  return 'Fresh';
}

function mapRecommendationType(value: RecommendationRecord['actionType']): RecommendationType {
  if (value === 'transfer') return 'INTER_STORE_TRANSFER';
  if (value === 'markdown') return 'MARKDOWN';
  return 'REPLENISHMENT';
}

function mapRecommendationStatus(value: RecommendationRecord['status']): RecommendationStatus {
  if (value === 'draft') return 'PROPOSED';
  if (value === 'failed') return 'FAILED';
  return value.toUpperCase() as RecommendationStatus;
}

const riskTiers: Record<SpoilageRiskRecord['riskLevel'], AlertTier> = {
  low: 'Monitor',
  medium: 'At Risk',
  high: 'Critical',
};

async function catalogLookups(): Promise<{
  stores: Map<string, StoreRecord>;
  products: Map<string, ProductRecord>;
}> {
  const [stores, products] = await Promise.all([
    request<Page<StoreRecord>>('/stores?limit=100'),
    request<Page<ProductRecord>>('/products?limit=100'),
  ]);
  return {
    stores: new Map(stores.data.map((store) => [store.id, store])),
    products: new Map(products.data.map((product) => [product.id, product])),
  };
}

function mapRecommendation(
  record: RecommendationRecord,
  stores: Map<string, StoreRecord>,
  products: Map<string, ProductRecord>,
): Recommendation {
  const product = products.get(record.productId);
  const store = stores.get(record.storeId);
  const confidence = Math.max(0, Math.min(1, record.confidence));
  return {
    id: record.id,
    type: mapRecommendationType(record.actionType),
    status: mapRecommendationStatus(record.status),
    targetSku: product?.sku ?? record.productId,
    productName: product?.name ?? record.productId,
    storeId: record.storeId,
    storeName: store?.name ?? record.storeId,
    proposedValue: record.quantity ? `${record.quantity} units` : 'Not specified',
    wasteUnitsPrevented: undefined,
    costAvoidance: undefined,
    algorithmicEvidence: record.evidence ? [record.evidence] : [],
    confidence: confidence >= 0.8 ? 'HIGH' : confidence >= 0.6 ? 'MEDIUM' : 'LOW',
    confidenceScore: confidence,
    proposedQty: record.quantity || undefined,
    actionNotes: record.decisionHistory.map((entry) => `${entry.decision} by ${entry.actor}`).join('; '),
    timestamp: record.createdAt,
  };
}

export const api = {
  async getStores(): Promise<Store[]> {
    const result = await request<Page<StoreRecord>>('/stores?limit=100');
    return result.data.map((store) => ({
      id: store.id,
      name: store.name,
      code: store.id,
      locationName: store.region || 'Location not provided',
    }));
  },

  async getProducts(): Promise<ProductRecord[]> {
    const result = await request<Page<ProductRecord>>('/products?limit=100');
    return result.data;
  },

  async getDashboardSummary(storeId?: StoreId): Promise<DashboardSummary> {
    return request<DashboardSummary>(`/dashboard/summary${queryString({ storeId: storeId === 'ALL' ? undefined : storeId })}`);
  },

  async getBatches(storeId?: StoreId): Promise<BatchItem[]> {
    const [inventory, lookups] = await Promise.all([
      request<Page<InventoryRecord>>(`/inventory${queryString({
        storeId: storeId && storeId !== 'ALL' ? storeId : undefined,
        limit: 100,
      })}`),
      catalogLookups(),
    ]);
    return inventory.data.map((record) => {
      const product = lookups.products.get(record.productId);
      const store = lookups.stores.get(record.storeId);
      const daysLeft = daysUntil(record.expiryDate);
      return {
        id: record.id,
        sku: product?.sku ?? record.productId,
        productName: record.productName,
        category: categoryFor(product?.category ?? 'Category not provided'),
        storeId: record.storeId,
        storeName: store?.name ?? record.storeId,
        availableQty: record.quantity,
        unit: product?.unit ?? 'unit',
        expiryDate: record.expiryDate,
        daysLeft,
        status: mapBatchStatus(record.status, daysLeft),
        lotNumber: record.id,
      };
    });
  },

  async getRecommendations(storeId?: StoreId): Promise<Recommendation[]> {
    const [records, lookups] = await Promise.all([
      request<RecommendationRecord[]>('/recommendations'),
      catalogLookups(),
    ]);
    return records
      .filter((record) => !storeId || storeId === 'ALL' || record.storeId === storeId)
      .map((record) => mapRecommendation(record, lookups.stores, lookups.products));
  },

  async approveRecommendation(id: string, notes?: string): Promise<void> {
    await request(`/recommendations/${encodeURIComponent(id)}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ approved: true, comments: notes }),
    });
  },

  async modifyRecommendation(
    id: string,
    modification: { proposedValue: string; reason: string; qty?: number; discountPct?: number },
    type: RecommendationType,
  ): Promise<void> {
    if (type === 'MARKDOWN') {
      throw new ApiError('The backend does not support markdown discount modifications yet.', 501);
    }
    await request(`/recommendations/${encodeURIComponent(id)}/modify`, {
      method: 'PATCH',
      body: JSON.stringify({
        ...(modification.qty !== undefined ? { quantity: modification.qty } : {}),
        reason: modification.reason,
        notes: modification.reason,
      }),
    });
  },

  async rejectRecommendation(id: string, reason: string): Promise<void> {
    await request(`/recommendations/${encodeURIComponent(id)}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ approved: false, comments: reason }),
    });
  },

  async getAlerts(storeId?: StoreId): Promise<ExpiryAlert[]> {
    const [risks, batches] = await Promise.all([
      request<SpoilageRiskRecord[]>('/alerts'),
      this.getBatches(storeId),
    ]);
    const batchesById = new Map(batches.map((batch) => [batch.id, batch]));
    return risks.flatMap((risk) => {
      const batch = batchesById.get(risk.batchId);
      if (!batch) return [];
      return [{
        id: risk.batchId,
        batchId: risk.batchId,
        sku: batch.sku,
        productName: batch.productName,
        category: batch.category,
        storeId: batch.storeId,
        storeName: batch.storeName,
        unitsAtRisk: batch.availableQty,
        daysToExpiry: risk.daysUntilExpiry,
        tier: riskTiers[risk.riskLevel],
        riskScore: risk.riskScore,
        modelEvidence: 'Backend expiry-window risk calculation; not an ML model prediction.',
      }];
    });
  },

  async getForecasts(params?: { storeId?: string; productId?: string; page?: number; limit?: number }): Promise<Page<ForecastRecord>> {
    return request<Page<ForecastRecord>>(`/forecasts${queryString({
      storeId: params?.storeId,
      productId: params?.productId,
      page: params?.page ?? 1,
      limit: params?.limit ?? 100,
    })}`);
  },

  async generateForecast(payload: { storeId: string; productId: string; horizonDays: number }): Promise<ForecastRecord> {
    return request<ForecastRecord>('/forecasts/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async generateSpoilageRisk(batchId: string): Promise<SpoilageRiskRecord> {
    return request<SpoilageRiskRecord>('/spoilage/predict', {
      method: 'POST',
      body: JSON.stringify({ batchId }),
    });
  },

  async getTransfers(): Promise<TransferRoute[]> {
    throw new ApiError('Inter-store transfer routes are not implemented by the backend.', 501);
  },

  async dispatchTransfer(_id: string): Promise<TransferRoute> {
    throw new ApiError('Inter-store transfer dispatch is not implemented by the backend.', 501);
  },

  async getEvaluationMetrics(): Promise<EvaluationMetrics> {
    throw new ApiError('Evaluation metrics are not exposed by the backend.', 501);
  },
};
