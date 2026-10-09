import Link from 'next/link';
import { PageShell } from '@/components/page-shell';
import { apiClient } from '@/lib/api-client';
import { RecommendationActions } from '@/components/recommendation-actions';

export default async function RecommendationDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  let item;
  let errorMessage: string | null = null;
  try {
    item = await apiClient.getRecommendation(params.id);
  } catch (error) {
    item = null;
    errorMessage = error instanceof Error ? error.message : 'Unable to load recommendation.';
  }

  if (!item) {
    return (
      <PageShell title="Recommendation Details">
        <div className="card">
          <p className="text-red-600 font-medium">
            Could not load recommendation: {errorMessage}
          </p>
          <Link href="/recommendations" className="mt-4 block text-sm text-emerald-700 underline">
            ← Back to recommendations
          </Link>
        </div>
      </PageShell>
    );
  }

  function statusBadge(status: string) {
    switch (status) {
      case 'PROPOSED': return 'bg-yellow-100 text-yellow-700';
      case 'APPROVED': return 'bg-blue-100 text-blue-700';
      case 'MODIFIED': return 'bg-purple-100 text-purple-700';
      case 'REJECTED': return 'bg-red-100 text-red-700';
      case 'EXECUTED': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  }

  return (
    <PageShell title="Recommendation Details">
      <div className="mb-4">
        <Link href="/recommendations" className="text-sm text-emerald-700 underline">
          ← Back to recommendations
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Main card */}
        <div className="card lg:col-span-2">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="font-mono text-sm text-slate-500">{item.recommendationNumber}</span>
            <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusBadge(item.status)}`}>
              {item.status}
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
              {item.actionType}
            </span>
          </div>

          <h3 className="text-xl font-bold text-slate-900">{item.product.name}</h3>
          <p className="mt-1 text-sm text-slate-500">{item.product.sku} · {item.product.category}</p>
          <p className="mt-4 text-slate-700">{item.rationale}</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3 text-sm">
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wide">Store</p>
              <p className="font-medium mt-1">{item.store.name}</p>
              <p className="text-xs text-slate-400">{item.store.code} · {item.store.city}</p>
            </div>
            {item.proposedQuantity != null && (
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wide">Proposed Qty</p>
                <p className="font-medium mt-1 text-2xl">{item.proposedQuantity}</p>
              </div>
            )}
            {item.proposedPrice != null && (
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wide">Proposed Price</p>
                <p className="font-medium mt-1 text-2xl">
                  ${item.proposedPrice.toFixed(2)}
                  {item.proposedDiscountPercent != null && (
                    <span className="ml-2 text-sm text-amber-600">−{item.proposedDiscountPercent}%</span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Planner actions (client component) */}
          <RecommendationActions rec={item} />
        </div>

        {/* Evidence */}
        <div className="card">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Evidence</h4>
          <dl className="space-y-2 text-sm">
            {Object.entries(item.evidence).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4">
                <dt className="text-slate-500 capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</dt>
                <dd className="max-w-[60%] break-words text-right font-medium">
                  {typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v)}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="card">
          <h4 className="mb-3 text-sm font-semibold text-slate-700">Assumptions and constraints</h4>
          {Object.keys(item.assumptions).length === 0 &&
          Object.keys(item.constraintsChecked ?? {}).length === 0 ? (
            <p className="text-sm text-slate-500">No assumptions or constraint checks were returned.</p>
          ) : (
            <dl className="space-y-2 text-sm">
              {Object.entries(item.assumptions).map(([key, value]) => (
                <div key={`assumption-${key}`} className="flex justify-between gap-4">
                  <dt className="text-slate-500">Assumption: {key}</dt>
                  <dd className="max-w-[60%] break-words text-right font-medium">
                    {typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value)}
                  </dd>
                </div>
              ))}
              {Object.entries(item.constraintsChecked ?? {}).map(([key, value]) => (
                <div key={`constraint-${key}`} className="flex justify-between gap-4">
                  <dt className="text-slate-500">Constraint: {key}</dt>
                  <dd className="max-w-[60%] break-words text-right font-medium">
                    {typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value)}
                  </dd>
                </div>
              ))}
            </dl>
          )}
          <p className="mt-4 text-xs text-slate-400">
            Rule/model version: {item.modelVersion}
            {item.proposedTiming ? ` · Proposed for ${new Date(item.proposedTiming).toLocaleString()}` : ''}
          </p>
        </div>

        {/* Batch info */}
        {item.batch && (
          <div className="card">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Batch</h4>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Batch #</dt>
                <dd className="font-mono font-medium">{item.batch.batchNumber}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Current Qty</dt>
                <dd className="font-medium">{item.batch.quantity}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Expiry Date</dt>
                <dd className="font-medium">{new Date(item.batch.expiryDate).toLocaleDateString()}</dd>
              </div>
            </dl>
          </div>
        )}

        {/* Decision history */}
        {item.decisions.length > 0 && (
          <div className="card lg:col-span-2">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Decision History</h4>
            <div className="space-y-3">
              {item.decisions.map((d) => (
                <div key={d.id} className="flex items-start gap-3 border-t border-slate-100 pt-3">
                  <span className={`mt-0.5 rounded-full px-2 py-1 text-xs font-medium shrink-0 ${
                    d.decision === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                    d.decision === 'REJECTED' ? 'bg-red-100 text-red-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {d.decision}
                  </span>
                  <div className="text-sm">
                    <p className="font-medium">{d.actorName} <span className="text-xs text-slate-400">({d.actorRole})</span></p>
                    {d.decisionNote && <p className="text-slate-600 mt-0.5">{d.decisionNote}</p>}
                    <p className="text-xs text-slate-400 mt-1">{new Date(d.decidedAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
