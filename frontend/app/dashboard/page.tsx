import Link from 'next/link';
import { PageShell } from '@/components/page-shell';
import { apiClient } from '@/lib/api-client';

export default async function DashboardPage() {
  let summary;
  let errorMessage: string | null = null;
  try {
    summary = await apiClient.getDashboardSummary();
  } catch (error) {
    summary = null;
    errorMessage = error instanceof Error ? error.message : 'Unable to load dashboard data.';
  }

  if (!summary) {
    return (
      <PageShell title="Dashboard">
        <div className="card">
          <p className="text-red-600 font-medium">Could not load dashboard data: {errorMessage}</p>
        </div>
      </PageShell>
    );
  }

  const { overview, alerts, wasteTracking, recentProposals } = summary;

  return (
    <PageShell title="Dashboard">
      {/* Overview KPI row */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="card">
          <p className="text-sm text-slate-500">Active Stores</p>
          <p className="mt-3 text-3xl font-bold">{overview.activeStores}</p>
          <p className="mt-1 text-xs text-slate-400">tracked grocery locations</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Tracked Products</p>
          <p className="mt-3 text-3xl font-bold">{overview.trackedProducts}</p>
          <p className="mt-1 text-xs text-slate-400">perishable SKUs</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Inventory Units</p>
          <p className="mt-3 text-3xl font-bold">{overview.totalInventoryUnits}</p>
          <p className="mt-1 text-xs text-slate-400">
            {overview.currency} {overview.totalInventoryValuation.toFixed(2)} valuation
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Waste This Period</p>
          <p className="mt-3 text-3xl font-bold">{wasteTracking.totalUnitsWasted} units</p>
          <p className="mt-1 text-xs text-slate-400">
            {overview.currency} {wasteTracking.totalLossValue.toFixed(2)} loss · {wasteTracking.period}
          </p>
        </div>
      </div>

      {/* Alerts row */}
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="card border-l-4 border-yellow-400">
          <p className="text-sm text-slate-500">Near-Expiry Batches</p>
          <p className="mt-2 text-2xl font-bold text-yellow-600">{alerts.nearExpiryBatchesCount}</p>
          <Link href="/expiry" className="mt-2 block text-xs text-yellow-700 underline">
            View expiry alerts →
          </Link>
        </div>
        <div className="card border-l-4 border-red-400">
          <p className="text-sm text-slate-500">Expired Batches</p>
          <p className="mt-2 text-2xl font-bold text-red-600">{alerts.expiredBatchesCount}</p>
          <p className="mt-2 text-xs text-slate-400">requiring disposal</p>
        </div>
        <div className="card border-l-4 border-emerald-400">
          <p className="text-sm text-slate-500">Pending Recommendations</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">{alerts.pendingRecommendationsCount}</p>
          <Link href="/recommendations" className="mt-2 block text-xs text-emerald-700 underline">
            Review proposals →
          </Link>
        </div>
      </div>

      {/* Recent proposals */}
      {recentProposals.length > 0 && (
        <div className="mt-8 card overflow-hidden">
          <h3 className="text-lg font-semibold mb-4">Recent Proposals</h3>
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="p-3">Ref</th>
                <th className="p-3">Type</th>
                <th className="p-3">Product</th>
                <th className="p-3">Store</th>
                <th className="p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {recentProposals.map((p) => (
                <tr key={p.id} className="border-t border-slate-200">
                  <td className="p-3 font-mono text-xs">{p.recommendationNumber}</td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                      p.actionType === 'MARKDOWN' ? 'bg-amber-100 text-amber-700' :
                      p.actionType === 'TRANSFER' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {p.actionType}
                    </span>
                  </td>
                  <td className="p-3">{p.product.name}</td>
                  <td className="p-3">{p.store.name}</td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                      p.status === 'PROPOSED' ? 'bg-yellow-100 text-yellow-700' :
                      p.status === 'EXECUTED' ? 'bg-emerald-100 text-emerald-700' :
                      p.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <Link href={`/recommendations/${p.id}`} className="text-xs text-emerald-700 underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
}
