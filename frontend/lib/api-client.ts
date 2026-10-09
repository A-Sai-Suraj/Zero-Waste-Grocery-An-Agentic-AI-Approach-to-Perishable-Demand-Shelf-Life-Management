import type { DashboardSummary, InventoryItem, Recommendation } from '@/types/api';
import { mockDashboardSummary, mockInventory, mockRecommendations } from './mock-data';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api';

async function safeFetch<T>(path: string, fallback: T): Promise<T> {
  if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
    return fallback;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, { cache: 'no-store' });
    if (!response.ok) {
      return fallback;
    }
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

export const apiClient = {
  getDashboardSummary: () => safeFetch<DashboardSummary>('/dashboard/summary', mockDashboardSummary),
  getInventory: () => safeFetch<InventoryItem[]>('/inventory', mockInventory),
  getRecommendations: () => safeFetch<Recommendation[]>('/recommendations', mockRecommendations),
};
