import Link from 'next/link';
import { PageShell } from '@/components/page-shell';
import { apiClient } from '@/lib/api-client';
import { RecommendationGenerator } from '@/components/recommendation-generator';

export default async function RecommendationsPage() {
  let result;
  let errorMessage: string | null = null;
  try {
    result = await apiClient.getRecommendations({ limit: 50 });
  } catch (error) {
    result = null;
    errorMessage = error instanceof Error ? error.message : 'Unable to load recommendations.';
  }

  const items = result?.data ?? [];

  function statusBadge(status: string) {
    switch (status) {
      case 'PROPOSED': return 'bg-yellow-100 text-yellow-700';
      case 'APPROVED': return 'bg-blue-100 text-blue-700';
      case 'MODIFIED': return 'bg-purple-100 text-purple-700';
      case 'REJECTED': return 'bg-red-100 text-red-700';
      case 'EXECUTED': return 'bg-emerald-100 text-emerald-700';
      case 'EXECUTION_PENDING': return 'bg-orange-100 text-orange-700';
      case 'EXECUTION_FAILED': return 'bg-red-200 text-red-800';
      default: return 'bg-slate-100 text-slate-700';
    }
  }

  function typeBadge(type: string) {
    switch (type) {
      case 'MARKDOWN': return 'bg-amber-100 text-amber-700';
      case 'TRANSFER': return 'bg-blue-100 text-blue-700';
      case 'REPLENISHMENT': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  }

  return (
    <PageShell title="Agent Recommendations">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {items.length} recommendation{items.length !== 1 ? 's' : ''} loaded
          {result ? ` of ${result.count} total` : ''}
        </p>
        <RecommendationGenerator />
      </div>

      {result === null ? (
        <div className="card">
          <p className="text-red-600 font-medium">
            Could not load recommendations: {errorMessage}
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="card">
          <p className="text-slate-500">No recommendations found.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <div key={item.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${typeBadge(item.actionType)}`}>
                      {item.actionType}
                    </span>
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusBadge(item.status)}`}>
                      {item.status}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{item.recommendationNumber}</span>
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">{item.product.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">{item.rationale}</p>
                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                    <span>Store: <strong>{item.store.name}</strong></span>
                    {item.proposedQuantity != null && (
                      <span>Qty: <strong>{item.proposedQuantity}</strong></span>
                    )}
                    {item.proposedPrice != null && (
                      <span>Price: <strong>${item.proposedPrice.toFixed(2)}</strong></span>
                    )}
                    {item.proposedDiscountPercent != null && (
                      <span>Discount: <strong>{item.proposedDiscountPercent}%</strong></span>
                    )}
                    <span>
                      Heuristic score (uncalibrated):{' '}
                      <strong>
                        {item.confidenceScore == null
                          ? 'Not reported'
                          : `${Math.round(item.confidenceScore * 100)}%`}
                      </strong>
                    </span>
                  </div>
                </div>
                <Link
                  href={`/recommendations/${item.id}`}
                  className="rounded-full bg-emerald-600 px-3 py-2 text-sm font-medium text-white whitespace-nowrap"
                >
                  View &amp; Action
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
