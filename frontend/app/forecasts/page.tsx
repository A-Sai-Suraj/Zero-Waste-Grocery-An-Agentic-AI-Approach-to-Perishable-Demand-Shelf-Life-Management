'use client';

import { useCallback, useEffect, useState } from 'react';
import { PageShell } from '@/components/page-shell';
import { apiClient } from '@/lib/api-client';
import type { ForecastRecord, InventoryBatch } from '@/types/api';

export default function ForecastPage() {
  const [forecasts, setForecasts] = useState<ForecastRecord[]>([]);
  const [inventory, setInventory] = useState<InventoryBatch[]>([]);
  const [storeId, setStoreId] = useState('');
  const [productId, setProductId] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [forecastResult, inventoryResult] = await Promise.all([
        apiClient.getForecasts({ limit: 50 }),
        apiClient.getInventory({ limit: 100 }),
      ]);
      setForecasts(forecastResult.data);
      setInventory(inventoryResult.batches);
      setStoreId((current) => current || inventoryResult.batches[0]?.store.id || '');
      setProductId((current) => current || inventoryResult.batches[0]?.product.id || '');
      setLoaded(true);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load forecasts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const stores = Array.from(
    new Map(inventory.map((batch) => [batch.store.id, batch.store])).values(),
  );
  const products = Array.from(
    new Map(
      inventory
        .filter((batch) => batch.store.id === storeId)
        .map((batch) => [batch.product.id, batch.product]),
    ).values(),
  );

  async function generateForecast() {
    if (!storeId || !productId) {
      setError('Select a store and product with inventory before generating a forecast.');
      return;
    }

    setGenerating(true);
    setError(null);
    try {
      await apiClient.generateForecast({ storeId, productId, horizonDays: 7 });
      await loadData();
    } catch (generationError) {
      setError(
        generationError instanceof Error
          ? generationError.message
          : 'Forecast generation failed.',
      );
    } finally {
      setGenerating(false);
    }
  }

  return (
    <PageShell title="Demand Forecasts">
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <label className="text-xs text-slate-600">
          Store
          <select
            value={storeId}
            onChange={(event) => {
              const nextStoreId = event.target.value;
              setStoreId(nextStoreId);
              setProductId(
                inventory.find((batch) => batch.store.id === nextStoreId)?.product.id ?? '',
              );
            }}
            disabled={loading || stores.length === 0}
            className="mt-1 block rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            {stores.length === 0 && <option value="">No inventory stores available</option>}
            {stores.map((store) => (
              <option key={store.id} value={store.id}>{store.name}</option>
            ))}
          </select>
        </label>
        <label className="text-xs text-slate-600">
          Product
          <select
            value={productId}
            onChange={(event) => setProductId(event.target.value)}
            disabled={loading || products.length === 0}
            className="mt-1 block rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            {products.length === 0 && <option value="">No products at this store</option>}
            {products.map((product) => (
              <option key={product.id} value={product.id}>{product.name}</option>
            ))}
          </select>
        </label>
        <button
          onClick={() => void loadData()}
          disabled={loading || generating}
          className="rounded-full bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? 'Loading…' : 'Refresh'}
        </button>
        <button
          onClick={() => void generateForecast()}
          disabled={generating || loading || !storeId || !productId}
          className="rounded-full bg-emerald-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {generating ? 'Generating…' : 'Generate 7-day forecast'}
        </button>
      </div>

      {error && (
        <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {!loading && loaded && forecasts.length === 0 && (
        <div className="card">
          <p className="text-sm text-slate-500">No forecasts are available yet.</p>
        </div>
      )}

      {forecasts.length > 0 && (
        <div className="card overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Store</th>
                <th className="p-3">Horizon</th>
                <th className="p-3">Predicted Demand</th>
                <th className="p-3">Range (reported)</th>
                <th className="p-3">Model</th>
                <th className="p-3">Data source</th>
              </tr>
            </thead>
            <tbody>
              {forecasts.map((row) => (
                <tr key={row.id} className="border-t border-slate-200">
                  <td className="p-3">
                    <div className="font-medium">{row.product.name}</div>
                    <div className="text-xs text-slate-400">{row.product.sku}</div>
                  </td>
                  <td className="p-3">{row.store.name}</td>
                  <td className="p-3">{row.horizonDays}d</td>
                  <td className="p-3 font-semibold">{Number(row.predictedDemand).toFixed(1)}</td>
                  <td className="p-3 text-slate-500">
                    {row.confidenceLower == null || row.confidenceUpper == null
                      ? 'Not reported'
                      : `${Number(row.confidenceLower).toFixed(1)} – ${Number(row.confidenceUpper).toFixed(1)}`}
                  </td>
                  <td className="p-3 text-xs font-mono">
                    {row.modelName}{row.modelVersion ? ` (${row.modelVersion})` : ''}
                  </td>
                  <td className="p-3">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                      {row.source ?? 'Not reported'}
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
