import { PageShell } from '@/components/page-shell';

const forecastRows = [
  { product: 'Avocado', store: 'STORE-01', forecast: '118 units', confidence: '86%' },
  { product: 'Milk', store: 'STORE-02', forecast: '96 units', confidence: '90%' },
  { product: 'Spinach', store: 'STORE-03', forecast: '82 units', confidence: '88%' },
];

export default function ForecastPage() {
  return (
    <PageShell title="Demand Forecasts">
      <div className="card overflow-hidden">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Store</th>
              <th className="p-3">Forecast</th>
              <th className="p-3">Confidence</th>
            </tr>
          </thead>
          <tbody>
            {forecastRows.map((row) => (
              <tr key={row.product} className="border-t border-slate-200">
                <td className="p-3">{row.product}</td>
                <td className="p-3">{row.store}</td>
                <td className="p-3">{row.forecast}</td>
                <td className="p-3">{row.confidence}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
