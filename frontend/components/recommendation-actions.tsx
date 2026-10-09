'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import type { Recommendation } from '@/types/api';

type PlannerDecision = 'APPROVED' | 'MODIFIED' | 'REJECTED';

export function RecommendationActions({ rec }: { rec: Recommendation }) {
  const router = useRouter();
  const [status, setStatus] = useState(rec.status);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [decisionNote, setDecisionNote] = useState('');
  const [modifiedQuantity, setModifiedQuantity] = useState(
    rec.proposedQuantity == null ? '' : String(rec.proposedQuantity),
  );
  const [modifiedPrice, setModifiedPrice] = useState(
    rec.proposedPrice == null ? '' : String(rec.proposedPrice),
  );
  const [modifiedDiscountPercent, setModifiedDiscountPercent] = useState(
    rec.proposedDiscountPercent == null ? '' : String(rec.proposedDiscountPercent),
  );
  const idempotencyKey = useRef<string | null>(null);

  const canDecide = status === 'PROPOSED' || status === 'MODIFIED';
  const canExecute = status === 'APPROVED' || status === 'MODIFIED';

  async function doDecision(decision: PlannerDecision) {
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const payload: Parameters<typeof apiClient.makeDecision>[1] = {
        decision,
        ...(decisionNote.trim() ? { decisionNote: decisionNote.trim() } : {}),
      };

      if (decision === 'MODIFIED') {
        const quantity = modifiedQuantity === '' ? undefined : Number(modifiedQuantity);
        const price = modifiedPrice === '' ? undefined : Number(modifiedPrice);
        const discount =
          modifiedDiscountPercent === '' ? undefined : Number(modifiedDiscountPercent);

        if (
          (quantity !== undefined && (!Number.isFinite(quantity) || quantity <= 0)) ||
          (price !== undefined && (!Number.isFinite(price) || price <= 0)) ||
          (discount !== undefined &&
            (!Number.isFinite(discount) || discount < 0 || discount > 90))
        ) {
          throw new Error('Enter a positive quantity and price, and a discount from 0 to 90%.');
        }

        if (quantity !== undefined && quantity !== rec.proposedQuantity) {
          payload.modifiedQuantity = quantity;
        }
        if (price !== undefined && price !== rec.proposedPrice) {
          payload.modifiedPrice = price;
        }
        if (
          discount !== undefined &&
          discount !== rec.proposedDiscountPercent
        ) {
          payload.modifiedDiscountPercent = discount;
        }

        if (
          payload.modifiedQuantity === undefined &&
          payload.modifiedPrice === undefined &&
          payload.modifiedDiscountPercent === undefined
        ) {
          throw new Error('Change at least one proposed value before submitting a modification.');
        }
      }

      const result = await apiClient.makeDecision(rec.id, payload);
      setStatus(result.newStatus);
      setMessage(`Recommendation status updated to ${result.newStatus}.`);
      router.refresh();
    } catch (decisionError) {
      setError(
        decisionError instanceof Error
          ? decisionError.message
          : 'The planner decision could not be saved.',
      );
    } finally {
      setLoading(false);
    }
  }

  async function doExecute() {
    setLoading(true);
    setMessage(null);
    setError(null);

    if (!idempotencyKey.current) {
      idempotencyKey.current = crypto.randomUUID();
    }

    try {
      const result = await apiClient.executeRecommendation(rec.id, {
        idempotencyKey: idempotencyKey.current,
      });
      if (result.status === 'FAILED') {
        setStatus('EXECUTION_FAILED');
        setError(result.summary || 'The backend recorded this execution as failed.');
      } else {
        setStatus('EXECUTED');
        setMessage(
          `${result.isIdempotentReplay ? 'Previously recorded; no second stock change was applied. ' : ''}${result.summary}`,
        );
        idempotencyKey.current = null;
        router.refresh();
      }
    } catch (executionError) {
      setError(
        executionError instanceof Error
          ? executionError.message
          : 'The recommendation could not be executed.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6">
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Planner Actions</h4>

      {message && (
        <div
          role="status"
          className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          {message}
        </div>
      )}
      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </div>
      )}

      {canDecide && (
        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(rec.proposedQuantity != null || rec.actionType !== 'NO_ACTION') && (
            <label className="text-xs text-slate-600">
              Modified quantity
              <input
                type="number"
                min="0.01"
                step="any"
                value={modifiedQuantity}
                onChange={(event) => setModifiedQuantity(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
          )}
          {rec.actionType === 'MARKDOWN' && (
            <>
              <label className="text-xs text-slate-600">
                Modified price
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={modifiedPrice}
                  onChange={(event) => setModifiedPrice(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-xs text-slate-600">
                Modified discount (%)
                <input
                  type="number"
                  min="0"
                  max="90"
                  step="any"
                  value={modifiedDiscountPercent}
                  onChange={(event) => setModifiedDiscountPercent(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
            </>
          )}
          <label className="text-xs text-slate-600 sm:col-span-2">
            Decision note (optional)
            <input
              value={decisionNote}
              onChange={(event) => setDecisionNote(event.target.value)}
              maxLength={1000}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {canDecide && (
          <>
            <button
              onClick={() => void doDecision('APPROVED')}
              disabled={loading}
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {loading ? 'Processing…' : 'Approve'}
            </button>
            <button
              onClick={() => void doDecision('MODIFIED')}
              disabled={loading}
              className="rounded-full bg-purple-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {loading ? 'Processing…' : 'Save modification'}
            </button>
            <button
              onClick={() => void doDecision('REJECTED')}
              disabled={loading}
              className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {loading ? 'Processing…' : 'Reject'}
            </button>
          </>
        )}
        {canExecute && (
          <button
            onClick={() => void doExecute()}
            disabled={loading}
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? 'Processing…' : 'Execute approved action'}
          </button>
        )}
        {!canDecide && !canExecute && (
          <p className="text-sm italic text-slate-500">
            No actions are available for status: <strong>{status}</strong>
          </p>
        )}
      </div>

      <p className="mt-3 text-xs text-slate-400">
        Current status: <span className="font-mono font-medium">{status}</span>
      </p>
    </div>
  );
}
