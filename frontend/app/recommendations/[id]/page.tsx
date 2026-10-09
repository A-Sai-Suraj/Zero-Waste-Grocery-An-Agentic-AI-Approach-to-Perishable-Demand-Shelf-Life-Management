import { PageShell } from '@/components/page-shell';
import { apiClient } from '@/lib/api-client';

export default async function RecommendationDetailsPage({ params }: { params: { id: string } }) {
  const recommendations = await apiClient.getRecommendations();
  const item = recommendations.find((rec) => rec.id === params.id) ?? recommendations[0];

  return (
    <PageShell title="Recommendation Details">
      <div className="card max-w-2xl">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Recommendation id</p>
        <h3 className="mt-2 text-2xl font-bold">{item.id}</h3>
        <p className="mt-6 text-base text-slate-700">{item.suggestedAction}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 text-sm text-slate-600">
          <div><span className="font-medium">Type:</span> {item.type}</div>
          <div><span className="font-medium">Store:</span> {item.storeId}</div>
          <div><span className="font-medium">Product:</span> {item.productId}</div>
          <div><span className="font-medium">Confidence:</span> {item.confidence}</div>
        </div>
      </div>
    </PageShell>
  );
}
