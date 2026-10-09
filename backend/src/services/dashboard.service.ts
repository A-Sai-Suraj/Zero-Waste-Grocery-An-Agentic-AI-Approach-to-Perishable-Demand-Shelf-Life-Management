import type { DashboardSummary } from '../types/api.js';

export const dashboardService = {
  async getSummary(storeId?: string): Promise<DashboardSummary> {
    return {
      totalStores: storeId ? 1 : 7,
      activeProducts: 312,
      stockoutRisk: 14,
      spoilageAlerts: 23,
      projectedWaste: 128.4,
      revenueTrend: 6.7,
    };
  },
};
