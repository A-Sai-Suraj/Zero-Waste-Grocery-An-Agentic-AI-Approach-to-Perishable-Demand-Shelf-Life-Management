import { PageShell } from '@/components/page-shell';

const salesRows = [
  { item: 'Grapes', promo: '40% markdown', revenue: '$2,130', uplift: '+12%' },
  { item: 'Milk', promo: 'Bundle discount', revenue: '$1,780', uplift: '+8%' },
  { item: 'Bread', promo: 'End-of-day markdown', revenue: '$1,540', uplift: '+11%' },
];

export default function SalesPage() {
  return (
    <PageShell title="Sales and Promotions">
      <div className="card overflow-hidden">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="p-3">Item</th>
              <th className="p-3">Promotion</th>
              <th className="p-3">Revenue</th>
              <th className="p-3">Uplift</th>
            </tr>
          </thead>
          <tbody>
            {salesRows.map((row) => (
              <tr key={row.item} className="border-t border-slate-200">
                <td className="p-3">{row.item}</td>
                <td className="p-3">{row.promo}</td>
                <td className="p-3">{row.revenue}</td>
                <td className="p-3">{row.uplift}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
