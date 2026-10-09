import { PageShell } from '@/components/page-shell';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

export default async function InventoryPage() {
  let result;
  let errorMessage: string | null = null;
  try {
    result = await apiClient.getInventory();
  } catch (error) {
    result = null;
    errorMessage = error instanceof Error ? error.message : 'Unable to load inventory.';
  }

  const batches = result?.batches ?? [];
  const pagination = result?.pagination;

  function statusBadge(days: number, expired: boolean) {
    if (expired) return 'bg-red-100 text-red-700';
    if (days <= 2) return 'bg-red-100 text-red-700';
    if (days <= 5) return 'bg-yellow-100 text-yellow-700';
    return 'bg-emerald-100 text-emerald-700';
  }

  function statusLabel(days: number, expired: boolean) {
    if (expired) return 'EXPIRED';
    if (days <= 2) return 'CRITICAL';
    if (days <= 5) return 'WARNING';
    return 'FRESH';
  }

  return (
    <PageShell title="Inventory Management">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          All inventory batches
          {pagination ? ` · ${pagination.total} total batches` : ''}
        </p>
        <Link href="/expiry" className="rounded-full bg-slate-900 px-3 py-2 text-sm font-medium text-white">
          Expiry Alerts
        </Link>
      </div>

      {batches.length === 0 ? (
        <div className="card">
          <p className="text-slate-500">
            {result === null
              ? `Could not load inventory: ${errorMessage}`
              : 'No inventory batches found for the selected filter.'}
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="p-3">Batch</th>
                <th className="p-3">Product</th>
                <th className="p-3">Store</th>
                <th className="p-3">Qty</th>
                <th className="p-3">Expiry</th>
                <th className="p-3">Days Left</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((batch) => (
                <tr key={batch.id} className="border-t border-slate-200">
                  <td className="p-3 font-mono text-xs">{batch.batchNumber}</td>
                  <td className="p-3">
                    <div className="font-medium">{batch.product.name}</div>
                    <div className="text-xs text-slate-400">{batch.product.sku}</div>
                  </td>
                  <td className="p-3">
                    <div>{batch.store.name}</div>
                    <div className="text-xs text-slate-400">{batch.store.code}</div>
                  </td>
                  <td className="p-3">
                    {batch.quantity}
                    <span className="text-xs text-slate-400"> / {batch.initialQuantity}</span>
                  </td>
                  <td className="p-3">{new Date(batch.expiryDate).toLocaleDateString()}</td>
                  <td className="p-3 font-medium">{batch.isExpired ? '—' : batch.daysUntilExpiry}</td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${statusBadge(
                        batch.daysUntilExpiry,
                        batch.isExpired,
                      )}`}
                    >
                      {statusLabel(batch.daysUntilExpiry, batch.isExpired)}
                    </span>
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
