import React, { useState } from 'react';
import { Recommendation } from '../../types';
import { Modal } from '../common/Modal';

interface DecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation: Recommendation | null;
  mode: 'APPROVE' | 'MODIFY' | 'REJECT';
  onConfirmApprove: (id: string, notes?: string) => Promise<void>;
  onConfirmModify: (
    id: string,
    mod: { proposedValue: string; reason: string; qty?: number; discountPct?: number }
  ) => Promise<void>;
  onConfirmReject: (id: string, reason: string) => Promise<void>;
}

export const DecisionModal: React.FC<DecisionModalProps> = ({
  isOpen,
  onClose,
  recommendation,
  mode,
  onConfirmApprove,
  onConfirmModify,
  onConfirmReject,
}) => {
  const [notes, setNotes] = useState('');
  const [reason, setReason] = useState('');
  const [modQty, setModQty] = useState<number>(recommendation?.proposedQty || 30);
  const [modDiscount, setModDiscount] = useState<number>(recommendation?.proposedDiscountPct || 25);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!recommendation) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (mode === 'APPROVE') {
        await onConfirmApprove(recommendation.id, notes);
      } else if (mode === 'MODIFY') {
        if (!reason.trim()) {
          setError('Mandatory compliance requirement: Please enter a reason for modification.');
          setSubmitting(false);
          return;
        }
        let newValue = recommendation.proposedValue;
        if (recommendation.type === 'MARKDOWN') {
          newValue = `-${modDiscount}% Discount`;
        } else {
          newValue = `${modQty} Units`;
        }
        await onConfirmModify(recommendation.id, {
          proposedValue: newValue,
          reason,
          qty: modQty,
          discountPct: modDiscount,
        });
      } else if (mode === 'REJECT') {
        if (!reason.trim()) {
          setError('Mandatory compliance requirement: Please enter a rejection reason.');
          setSubmitting(false);
          return;
        }
        await onConfirmReject(recommendation.id, reason);
      }
      onClose();
    } catch {
      setError('An error occurred while saving the decision.');
    } finally {
      setSubmitting(false);
    }
  };

  const getTitle = () => {
    if (mode === 'APPROVE') return `Approve ${recommendation.type.replace(/_/g, ' ')}`;
    if (mode === 'MODIFY') return `Modify Proposed Action Parameters`;
    return `Reject Algorithmic Recommendation`;
  };

  const getSubtitle = () => {
    return `${recommendation.productName} • ${recommendation.storeName}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getTitle()} subtitle={getSubtitle()}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Summary Card */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600 font-medium">Proposed Value:</span>
            <span className="font-extrabold text-[#062314] font-mono text-sm">
              {recommendation.proposedValue}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600 font-medium">Projected Savings:</span>
            <span className="font-bold text-emerald-800">
              +{recommendation.wasteUnitsPrevented} units (${recommendation.costAvoidance})
            </span>
          </div>
        </div>

        {/* APPROVE MODE */}
        {mode === 'APPROVE' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Compliance & Dispatch Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. In-store staff notified to apply fresh markdown stickers immediately."
              rows={3}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>
        )}

        {/* MODIFY MODE */}
        {mode === 'MODIFY' && (
          <div className="space-y-3">
            {recommendation.type === 'MARKDOWN' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Adjust Markdown Discount (%):
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="10"
                    max="60"
                    step="5"
                    value={modDiscount}
                    onChange={(e) => setModDiscount(Number(e.target.value))}
                    className="flex-1 accent-emerald-700 cursor-pointer"
                  />
                  <span className="font-mono font-bold text-sm text-[#062314] px-2.5 py-1 bg-slate-100 rounded-lg">
                    -{modDiscount}%
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Adjust Proposed Quantity (Units):
                </label>
                <input
                  type="number"
                  min="5"
                  max="500"
                  value={modQty}
                  onChange={(e) => setModQty(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 font-mono"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Modification <span className="text-emerald-700">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Required: State the physical constraint, store traffic anomaly, or operational justification..."
                rows={3}
                required
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>
        )}

        {/* REJECT MODE */}
        {mode === 'REJECT' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Rejection Reason & Algorithmic Override <span className="text-emerald-700">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Required: State why this recommendation should not be executed (e.g. product reserved for catering order, local refrigeration maintenance)..."
              rows={3}
              required
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>
        )}

        {error && (
          <p className="text-xs font-medium text-emerald-900 bg-emerald-100 p-2 rounded-lg border border-emerald-300">
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className={`px-4 py-2 text-xs font-bold rounded-xl text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
              mode === 'APPROVE'
                ? 'bg-[#10B981] hover:bg-[#059669] text-[#062314]'
                : mode === 'MODIFY'
                ? 'bg-[#062314] hover:bg-[#0D2818]'
                : 'bg-slate-800 hover:bg-slate-900'
            }`}
          >
            {submitting ? 'Saving...' : mode === 'APPROVE' ? 'Confirm Approval' : mode === 'MODIFY' ? 'Save Modifications' : 'Confirm Rejection'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
