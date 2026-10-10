import {
  EVALUATION_METRICS,
  FORECAST_CHART_DATA,
  FORECAST_METADATA,
  INITIAL_BATCHES,
  INITIAL_EXPIRY_ALERTS,
  INITIAL_RECOMMENDATIONS,
  STORES,
  TRANSFER_ROUTES,
} from '../data/mockData';
import {
  BatchItem,
  EvaluationMetrics,
  ExpiryAlert,
  ForecastDataPoint,
  ForecastModelMetadata,
  Recommendation,
  Store,
  StoreId,
  TransferRoute,
} from '../types';

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || '/api/v1';

// In-memory / session persistent state
let batchesState: BatchItem[] = [...INITIAL_BATCHES];
let recommendationsState: Recommendation[] = [...INITIAL_RECOMMENDATIONS];
let alertsState: ExpiryAlert[] = [...INITIAL_EXPIRY_ALERTS];
let transfersState: TransferRoute[] = [...TRANSFER_ROUTES];
let metricsState: EvaluationMetrics = { ...EVALUATION_METRICS };

export const api = {
  getStores: async (): Promise<Store[]> => {
    try {
      const res = await fetch(`${API_BASE}/stores`);
      if (res.ok) return await res.json();
    } catch {
      // Mock fallback
    }
    return STORES;
  },

  getBatches: async (storeId?: StoreId): Promise<BatchItem[]> => {
    try {
      const url = storeId && storeId !== 'ALL' ? `${API_BASE}/batches?store=${storeId}` : `${API_BASE}/batches`;
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    if (!storeId || storeId === 'ALL') {
      return [...batchesState];
    }
    return batchesState.filter((b) => b.storeId === storeId);
  },

  getRecommendations: async (storeId?: StoreId): Promise<Recommendation[]> => {
    try {
      const url = storeId && storeId !== 'ALL' ? `${API_BASE}/recommendations?store=${storeId}` : `${API_BASE}/recommendations`;
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    if (!storeId || storeId === 'ALL') {
      return [...recommendationsState];
    }
    return recommendationsState.filter((r) => r.storeId === storeId || r.destinationStoreId === storeId);
  },

  approveRecommendation: async (id: string, notes?: string): Promise<Recommendation> => {
    try {
      const res = await fetch(`${API_BASE}/recommendations/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const recIndex = recommendationsState.findIndex((r) => r.id === id);
    if (recIndex === -1) throw new Error('Recommendation not found');
    const updated: Recommendation = {
      ...recommendationsState[recIndex],
      status: 'APPROVED',
      actionNotes: notes || 'Approved by Planner via Human-in-the-Loop review center.',
    };
    recommendationsState[recIndex] = updated;

    // Update metrics
    metricsState.wasteReductionPct = +(metricsState.wasteReductionPct + 0.3).toFixed(1);
    metricsState.totalFinancialSaved += updated.costAvoidance;

    return updated;
  },

  modifyRecommendation: async (
    id: string,
    modification: { proposedValue: string; reason: string; qty?: number; discountPct?: number }
  ): Promise<Recommendation> => {
    try {
      const res = await fetch(`${API_BASE}/recommendations/${id}/modify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modification),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const recIndex = recommendationsState.findIndex((r) => r.id === id);
    if (recIndex === -1) throw new Error('Recommendation not found');
    const updated: Recommendation = {
      ...recommendationsState[recIndex],
      status: 'MODIFIED',
      modifiedValue: modification.proposedValue,
      proposedValue: modification.proposedValue,
      actionNotes: `Modified: ${modification.reason}`,
      proposedQty: modification.qty ?? recommendationsState[recIndex].proposedQty,
      proposedDiscountPct: modification.discountPct ?? recommendationsState[recIndex].proposedDiscountPct,
    };
    recommendationsState[recIndex] = updated;
    return updated;
  },

  rejectRecommendation: async (id: string, reason: string): Promise<Recommendation> => {
    try {
      const res = await fetch(`${API_BASE}/recommendations/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const recIndex = recommendationsState.findIndex((r) => r.id === id);
    if (recIndex === -1) throw new Error('Recommendation not found');
    const updated: Recommendation = {
      ...recommendationsState[recIndex],
      status: 'REJECTED',
      rejectionReason: reason,
      actionNotes: `Rejected: ${reason}`,
    };
    recommendationsState[recIndex] = updated;
    return updated;
  },

  getForecast: async (_sku?: string): Promise<{ data: ForecastDataPoint[]; metadata: ForecastModelMetadata }> => {
    try {
      const res = await fetch(`${API_BASE}/forecast`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return {
      data: FORECAST_CHART_DATA,
      metadata: FORECAST_METADATA,
    };
  },

  getAlerts: async (storeId?: StoreId): Promise<ExpiryAlert[]> => {
    try {
      const url = storeId && storeId !== 'ALL' ? `${API_BASE}/alerts?store=${storeId}` : `${API_BASE}/alerts`;
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    if (!storeId || storeId === 'ALL') {
      return [...alertsState];
    }
    return alertsState.filter((a) => a.storeId === storeId);
  },

  getTransfers: async (): Promise<TransferRoute[]> => {
    try {
      const res = await fetch(`${API_BASE}/transfers`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return [...transfersState];
  },

  dispatchTransfer: async (id: string): Promise<TransferRoute> => {
    try {
      const res = await fetch(`${API_BASE}/transfers/${id}/dispatch`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const idx = transfersState.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error('Transfer route not found');
    const updated: TransferRoute = {
      ...transfersState[idx],
      status: 'IN_TRANSIT',
    };
    transfersState[idx] = updated;
    return updated;
  },

  getEvaluationMetrics: async (): Promise<EvaluationMetrics> => {
    try {
      const res = await fetch(`${API_BASE}/evaluation`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return { ...metricsState };
  },

  resetSimulationData: () => {
    batchesState = [...INITIAL_BATCHES];
    recommendationsState = [...INITIAL_RECOMMENDATIONS];
    alertsState = [...INITIAL_EXPIRY_ALERTS];
    transfersState = [...TRANSFER_ROUTES];
    metricsState = { ...EVALUATION_METRICS };
  },
};
