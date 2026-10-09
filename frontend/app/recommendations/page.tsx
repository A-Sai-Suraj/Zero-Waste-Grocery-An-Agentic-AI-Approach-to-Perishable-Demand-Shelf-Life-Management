import Link from 'next/link';
import { PageShell } from '@/components/page-shell';
import { apiClient } from '@/lib/api-client';

export default async function RecommendationsPage() {
  const items = await apiClient.getRecommendations();

  return (
    <PageShell title="Agent Recommendations">
      <div className="grid gap-6">
        {items.map((item) => (
          <div key={item.id} className="card">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{item.type}</p>
                <h3 className="mt-2 text-xl font-semibold">{item.suggestedAction}</h3>
              </div>
              <Link href={`/recommendations/${item.id}`} className="rounded-full bg-emerald-600 px-3 py-2 text-sm font-medium text-white">
                View details
              </Link>
            </div>
            <div className="mt-4 flex gap-6 text-sm text-slate-600">
              <span>Store: {item.storeId}</span>
              <span>Confidence: {item.confidence}</span>
              <span>Status: {item.status}</span>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
