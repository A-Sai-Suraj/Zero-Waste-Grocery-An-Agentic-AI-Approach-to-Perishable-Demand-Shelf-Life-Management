import { PageShell } from '@/components/page-shell';

const comparison = [
  { store: 'STORE-01', sales: '$18.2k', waste: '8.4%', fulfillment: '94%' },
  { store: 'STORE-02', sales: '$17.1k', waste: '6.9%', fulfillment: '96%' },
  { store: 'STORE-03', sales: '$19.8k', waste: '7.3%', fulfillment: '93%' },
];

export default function ComparePage() {
  return (
    <PageShell title="Store Comparison">
      <div className="card overflow-hidden">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="p-3">Store</th>
              <th className="p-3">Sales</th>
              <th className="p-3">Waste</th>
              <th className="p-3">Fulfillment</th>
            </tr>
          </thead>
          <tbody>
            {comparison.map((row) => (
              <tr key={row.store} className="border-t border-slate-200">
                <td className="p-3">{row.store}</td>
                <td className="p-3">{row.sales}</td>
                <td className="p-3">{row.waste}</td>
                <td className="p-3">{row.fulfillment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
