import { PageShell } from '@/components/page-shell';
import { apiClient } from '@/lib/api-client';
import { SpoilageRiskAction } from '@/components/spoilage-risk-action';

export default async function ExpiryPage() {
  let result;
  let errorMessage: string | null = null;
  try {
    result = await apiClient.getInventory({ expiringWithinDays: 7 });
  } catch (error) {
    result = null;
    errorMessage = error instanceof Error ? error.message : 'Unable to load expiry alerts.';
  }

  const batches = result?.batches ?? [];
  // Sort by soonest expiry first
  const alerts = [...batches].sort(
    (a, b) => a.daysUntilExpiry - b.daysUntilExpiry,
  );

  function urgencyClass(days: number, expired: boolean) {
    if (expired) return 'border-red-500 bg-red-50';
    if (days <= 1) return 'border-red-500 bg-red-50';
    if (days <= 3) return 'border-yellow-400 bg-yellow-50';
    return 'border-slate-200 bg-white';
  }

  function urgencyLabel(days: number, expired: boolean) {
    if (expired) return { text: 'EXPIRED', cls: 'bg-red-100 text-red-700' };
    if (days <= 1) return { text: 'EXPIRES TODAY', cls: 'bg-red-100 text-red-700' };
    if (days <= 3) return { text: `${days}d REMAINING`, cls: 'bg-yellow-100 text-yellow-700' };
    return { text: `${days}d remaining`, cls: 'bg-slate-100 text-slate-700' };
  }

  return (
    <PageShell title="Expiry and Spoilage Alerts">
      <p className="mb-4 text-sm text-slate-500">
        Batches expiring within 7 days · {alerts.length} found
      </p>
      <p className="mb-4 text-xs text-slate-500">
        Risk scores are estimates based on the service response, not probabilities or guarantees.
      </p>

      {result === null ? (
        <div className="card">
          <p className="text-red-600 font-medium">
            Could not load expiry alerts: {errorMessage}
          </p>
        </div>
      ) : alerts.length === 0 ? (
        <div className="card">
          <p className="text-emerald-700 font-medium">✓ No batches expiring within 7 days.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {alerts.map((batch) => {
            const badge = urgencyLabel(batch.daysUntilExpiry, batch.isExpired);
            return (
              <div
                key={batch.id}
                className={`rounded-xl border-l-4 p-5 shadow-sm ${urgencyClass(batch.daysUntilExpiry, batch.isExpired)}`}
              >
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Batch Alert</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">
                  {batch.product.name}
                </h3>
                <p className="text-xs text-slate-400 mb-3">
                  {batch.product.sku} · {batch.batchNumber}
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                  <div>
                    <span className="text-xs text-slate-400">Store</span>
                    <p className="font-medium">{batch.store.name}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Qty on hand</span>
                    <p className="font-medium">{batch.quantity}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Expiry date</span>
                    <p className="font-medium">{new Date(batch.expiryDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Unit cost</span>
                    <p className="font-medium">${Number(batch.unitCost).toFixed(2)}</p>
                  </div>
                </div>
                <span className={`mt-4 inline-block rounded-full px-2 py-1 text-xs font-bold ${badge.cls}`}>
                  {badge.text}
                </span>
                <SpoilageRiskAction
                  batchId={batch.id}
                  disabled={batch.isExpired || batch.quantity <= 0}
                />
              </div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
