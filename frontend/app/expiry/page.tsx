import { PageShell } from '@/components/page-shell';
import { apiClient } from '@/lib/api-client';

export default async function ExpiryPage() {
  const inventory = await apiClient.getInventory();
  const alerts = inventory.filter((item) => item.status !== 'fresh');

  return (
    <PageShell title="Expiry and Spoilage Alerts">
      <div className="grid gap-6 md:grid-cols-2">
        {alerts.map((item) => (
          <div key={item.id} className="card">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Batch alert</p>
            <h3 className="mt-2 text-xl font-semibold">{item.productName}</h3>
            <p className="mt-3 text-sm text-slate-600">Store: {item.storeId}</p>
            <p className="mt-1 text-sm text-slate-600">Expiry: {item.expiryDate}</p>
            <p className="mt-1 text-sm text-slate-600">Qty: {item.quantity}</p>
            <span className="mt-4 inline-block rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">{item.status}</span>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
