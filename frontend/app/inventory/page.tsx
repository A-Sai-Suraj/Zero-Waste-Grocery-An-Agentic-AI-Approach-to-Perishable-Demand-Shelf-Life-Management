import { PageShell } from '@/components/page-shell';
import { apiClient } from '@/lib/api-client';

export default async function InventoryPage() {
  const inventory = await apiClient.getInventory();

  return (
    <PageShell title="Inventory Management">
      <div className="card overflow-hidden">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Store</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Expiry</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.id} className="border-t border-slate-200">
                <td className="p-3">{item.productName}</td>
                <td className="p-3">{item.storeId}</td>
                <td className="p-3">{item.quantity}</td>
                <td className="p-3">{item.expiryDate}</td>
                <td className="p-3"><span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">{item.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
