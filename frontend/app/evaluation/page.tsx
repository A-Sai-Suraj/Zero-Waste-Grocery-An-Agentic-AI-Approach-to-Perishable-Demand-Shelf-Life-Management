import { PageShell } from '@/components/page-shell';

const evaluationRows = [
  { metric: 'Forecast MAPE', baseline: '12.4%', current: '10.8%' },
  { metric: 'Waste reduction', baseline: '4.0%', current: '6.6%' },
  { metric: 'Stockout rate', baseline: '8.2%', current: '6.5%' },
];

export default function EvaluationPage() {
  return (
    <PageShell title="Evaluation and Reports">
      <div className="card overflow-hidden">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="p-3">Metric</th>
              <th className="p-3">Baseline</th>
              <th className="p-3">Current</th>
            </tr>
          </thead>
          <tbody>
            {evaluationRows.map((row) => (
              <tr key={row.metric} className="border-t border-slate-200">
                <td className="p-3">{row.metric}</td>
                <td className="p-3">{row.baseline}</td>
                <td className="p-3">{row.current}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
