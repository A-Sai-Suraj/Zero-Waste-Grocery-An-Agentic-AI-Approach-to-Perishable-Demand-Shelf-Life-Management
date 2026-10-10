import React, { useEffect, useState } from 'react';
import { api, ForecastRecord, isDemoMode, ProductRecord } from '../../lib/api';
import { Store } from '../../types';

export const ForecastView: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [forecasts, setForecasts] = useState<ForecastRecord[]>([]);
  const [storeId, setStoreId] = useState('');
  const [productId, setProductId] = useState('');
  const [horizonDays, setHorizonDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBackendData = async () => {
    try {
      const [availableStores, availableProducts, result] = await Promise.all([
        api.getStores(),
        api.getProducts(),
        api.getForecasts(),
      ]);
      setStores(availableStores);
      setProducts(availableProducts);
      setForecasts(result.data);
      setStoreId((current) => current || availableStores[0]?.id || '');
      setProductId((current) => current || availableProducts[0]?.id || '');
    } catch (loadError) {
      setStores([]);
      setProducts([]);
      setForecasts([]);
      throw loadError;
    }
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    loadBackendData()
      .then(() => {
        if (active) setError(null);
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'The backend request failed.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const generateForecast = async () => {
    setGenerating(true);
    setError(null);
    try {
      await api.generateForecast({ storeId, productId, horizonDays });
      await loadBackendData();
    } catch (generateError) {
      setError(generateError instanceof Error ? generateError.message : 'The forecast request failed.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <section className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-xs">
      <h2 className="text-base font-bold text-slate-900">Backend forecast service</h2>
      <p className="mt-1 text-xs text-slate-600">
        {isDemoMode
          ? 'DEMO DATA: this synthetic forecast fixture is served by Express. New forecasts are disabled because demo mode does not save results.'
          : 'Saved forecast records come from Express. Generation calls FastAPI and persists the validated result; the current FastAPI forecast is a mock implementation, not a trained production model.'}
        {' '}The current FastAPI forecast is a baseline/mock output, not a trained production model.
      </p>
      {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {loading && <p role="status" className="mt-3 text-sm text-slate-500">Loading forecast records…</p>}
      {!loading && !error && (stores.length === 0 || products.length === 0) && (
        <p role="status" className="mt-3 text-sm text-slate-600">Forecast generation requires backend stores and products.</p>
      )}
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="text-xs font-semibold text-slate-700">
          Store
          <select value={storeId} onChange={(event) => setStoreId(event.target.value)} className="mt-1 block rounded-lg border border-slate-200 p-2">
            {stores.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold text-slate-700">
          Product
          <select value={productId} onChange={(event) => setProductId(event.target.value)} className="mt-1 block rounded-lg border border-slate-200 p-2">
            {products.map((product) => <option key={product.id} value={product.id}>{product.name} ({product.sku})</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold text-slate-700">
          Horizon (days)
          <input type="number" min={1} max={30} value={horizonDays} onChange={(event) => setHorizonDays(Number(event.target.value))} className="mt-1 block w-24 rounded-lg border border-slate-200 p-2" />
        </label>
        <button
          type="button"
          onClick={generateForecast}
          disabled={isDemoMode || loading || generating || stores.length === 0 || products.length === 0 || !storeId || !productId || horizonDays < 1 || horizonDays > 30}
          className="rounded-lg bg-emerald-800 px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
          title={isDemoMode ? 'Forecast generation is disabled in read-only demo mode.' : undefined}
        >
          {isDemoMode ? 'Unavailable in read-only demo' : generating ? 'Generating…' : 'Generate forecast'}
        </button>
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead><tr className="border-b text-slate-500"><th className="p-2">Store</th><th className="p-2">Product</th><th className="p-2">Forecast quantity</th><th className="p-2">Confidence</th><th className="p-2">Horizon</th></tr></thead>
          <tbody>
            {forecasts.map((forecast, index) => (
              <tr key={`${forecast.storeId}-${forecast.productId}-${index}`} className="border-b border-slate-100">
                <td className="p-2">{stores.find((store) => store.id === forecast.storeId)?.name ?? forecast.storeId}</td>
                <td className="p-2">{products.find((product) => product.id === forecast.productId)?.name ?? forecast.productId}</td>
                <td className="p-2">{forecast.forecastQty}</td>
                <td className="p-2">{(forecast.confidence * 100).toFixed(1)}%</td>
                <td className="p-2">{forecast.horizonDays} days</td>
              </tr>
            ))}
            {!loading && !error && forecasts.length === 0 && (
              <tr><td colSpan={5} className="p-3 text-slate-500">No saved backend forecast records.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p role="note" className="mt-4 text-xs text-slate-500">
        The backend does not expose historical forecast time series or model evaluation metrics.
      </p>
    </section>
  );
};
