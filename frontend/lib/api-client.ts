import type {
  DashboardSummary,
  ForecastGenerationResult,
  ForecastRecord,
  ForecastsResponse,
  InventoryResponse,
  Recommendation,
  RecommendationDecisionInput,
  RecommendationDecisionResult,
  RecommendationExecutionResult,
  RecommendationGenerationResult,
  RecommendationsResponse,
  SpoilageRiskEstimate,
} from '@/types/api';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000/api/v1';

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  count?: number;
  error?: { message?: string } | string;
  message?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getErrorMessage(payload: unknown, status: number): string {
  if (isRecord(payload)) {
    const error = payload.error;
    if (typeof error === 'string') return error;
    if (isRecord(error) && typeof error.message === 'string') return error.message;
    if (typeof payload.message === 'string') return payload.message;
  }

  if (typeof payload === 'string' && payload.length > 0) return payload;
  return `Request failed with HTTP ${status}`;
}

async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<ApiEnvelope<T>> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  const payload: unknown = await res.json();

  if (!res.ok) {
    throw new Error(getErrorMessage(payload, res.status));
  }
  if (!isRecord(payload) || !('data' in payload)) {
    throw new Error('The backend returned an invalid response.');
  }

  return payload as ApiEnvelope<T>;
}

function toQueryString(params: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) query.set(key, String(value));
  }
  const encoded = query.toString();
  return encoded ? `?${encoded}` : '';
}

export const apiClient = {
  async getDashboardSummary(): Promise<DashboardSummary> {
    const res = await apiFetch<DashboardSummary>('/dashboard/summary');
    return res.data;
  },

  async getInventory(params?: {
    storeId?: string;
    productId?: string;
    expiringWithinDays?: number;
    page?: number;
    limit?: number;
  }): Promise<InventoryResponse> {
    const query = toQueryString({
      storeId: params?.storeId,
      productId: params?.productId,
      expiringWithinDays: params?.expiringWithinDays,
      page: params?.page ?? 1,
      limit: params?.limit ?? 50,
    });
    const res = await apiFetch<InventoryResponse>(`/inventory/batches${query}`);
    return res.data;
  },

  async evaluateSpoilageRisk(batchId: string): Promise<SpoilageRiskEstimate[]> {
    const res = await apiFetch<SpoilageRiskEstimate[]>('/spoilage-risk/evaluate', {
      method: 'POST',
      body: JSON.stringify({ batchId }),
    });
    return res.data;
  },

  async getRecommendations(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<RecommendationsResponse> {
    const query = toQueryString({
      status: params?.status,
      page: params?.page,
      limit: params?.limit,
    });
    const res = await apiFetch<Recommendation[]>(`/recommendations${query}`);
    return { data: res.data, count: res.count ?? res.data.length };
  },

  async getRecommendation(id: string): Promise<Recommendation> {
    const { data } = await this.getRecommendations({ limit: 100 });
    const recommendation = data.find((item) => item.id === id);
    if (!recommendation) {
      throw new Error('This recommendation was not found in the current list.');
    }
    return recommendation;
  },

  async makeDecision(
    id: string,
    payload: RecommendationDecisionInput,
  ): Promise<RecommendationDecisionResult> {
    const res = await apiFetch<RecommendationDecisionResult>(
      `/recommendations/${encodeURIComponent(id)}/decision`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );
    return res.data;
  },

  async executeRecommendation(
    id: string,
    payload: { idempotencyKey: string; executionNotes?: string },
  ): Promise<RecommendationExecutionResult> {
    const res = await apiFetch<RecommendationExecutionResult>(
      `/recommendations/${encodeURIComponent(id)}/execute`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );
    return res.data;
  },

  async generateRecommendations(payload?: {
    storeId?: string;
    scenarioId?: string;
  }): Promise<RecommendationGenerationResult> {
    const res = await apiFetch<RecommendationGenerationResult>('/recommendations/generate', {
      method: 'POST',
      body: JSON.stringify(payload ?? {}),
    });
    return res.data;
  },

  async getForecasts(params?: {
    storeId?: string;
    productId?: string;
    page?: number;
    limit?: number;
  }): Promise<ForecastsResponse> {
    const query = toQueryString({
      storeId: params?.storeId,
      productId: params?.productId,
      page: params?.page,
      limit: params?.limit,
    });
    const res = await apiFetch<ForecastRecord[]>(`/forecasts${query}`);
    return { data: res.data };
  },

  async generateForecast(payload: {
    storeId: string;
    productId: string;
    horizonDays?: number;
  }): Promise<ForecastGenerationResult> {
    const res = await apiFetch<ForecastGenerationResult>('/forecasts/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },
};
