import { PageShell } from '@/components/page-shell';
import { apiClient } from '@/lib/api-client';

export default async function DashboardPage() {
  const summary = await apiClient.getDashboardSummary();

  return (
    <PageShell title="Dashboard">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <div className="card"><p className="text-sm text-slate-500">Stores monitored</p><p className="mt-3 text-3xl font-bold">{summary.totalStores}</p></div>
        <div className="card"><p className="text-sm text-slate-500">Active products</p><p className="mt-3 text-3xl font-bold">{summary.activeProducts}</p></div>
        <div className="card"><p className="text-sm text-slate-500">Projected waste</p><p className="mt-3 text-3xl font-bold">{summary.projectedWaste} kg</p></div>
      </div>
      <div className="mt-8 card">
        <h3 className="text-lg font-semibold">API contract status</h3>
        <ul className="mt-4 space-y-2 text-sm text-slate-600">
          <li>API-001 Dashboard summary: connected to mock fallback</li>
          <li>API-002 Inventory read: ready for backend integration</li>
          <li>API-004 Demand forecast: placeholder model routing</li>
        </ul>
      </div>
    </PageShell>
  );
}
