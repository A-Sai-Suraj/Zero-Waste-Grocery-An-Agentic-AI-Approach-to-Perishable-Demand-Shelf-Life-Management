'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import type { SpoilageRiskEstimate } from '@/types/api';

export function SpoilageRiskAction({
  batchId,
  disabled,
}: {
  batchId: string;
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [estimate, setEstimate] = useState<SpoilageRiskEstimate | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function evaluate() {
    setLoading(true);
    setError(null);
    try {
      const estimates = await apiClient.evaluateSpoilageRisk(batchId);
      const result = estimates.find((item) => item.batchId === batchId);
      if (!result) {
        setEstimate(null);
        setError('The service returned no risk estimate for this batch.');
        return;
      }
      setEstimate(result);
    } catch (evaluationError) {
      setError(
        evaluationError instanceof Error
          ? evaluationError.message
          : 'Spoilage-risk assessment failed.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => void evaluate()}
        disabled={disabled || loading}
        className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 disabled:opacity-50"
      >
        {loading ? 'Assessing…' : estimate ? 'Refresh risk assessment' : 'Assess spoilage risk'}
      </button>
      {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
      {estimate && (
        <div role="status" className="mt-3 rounded-lg bg-slate-50 p-3 text-sm">
          <p>
            Estimated at-risk quantity: <strong>{estimate.atRiskQuantity}</strong> of{' '}
            {estimate.availableQuantity}
          </p>
          <p className="mt-1">
            Risk score: <strong>{estimate.riskScore.toFixed(2)}</strong> · Rule/model version:{' '}
            <strong>{estimate.modelVersion}</strong>
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Estimate only; assumptions: {JSON.stringify(estimate.assumptions)}
          </p>
        </div>
      )}
    </div>
  );
}
