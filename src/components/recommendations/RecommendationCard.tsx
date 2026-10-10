import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Recommendation } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onApprove: (rec: Recommendation) => void;
  onModify: (rec: Recommendation) => void;
  onReject: (rec: Recommendation) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onApprove,
  onModify,
  onReject,
}) => {
  const { role } = useAuth();
  const isActionable = recommendation.status === 'PROPOSED' && role !== 'USER';

  return (
    <div className="bg-white rounded-3xl p-5 border border-emerald-900/10 shadow-xs flex flex-col justify-between hover:border-emerald-700/20 hover:shadow-md transition-all">
      <div>
        {/* Top Header: Type & Status */}
        <div className="flex items-center justify-between mb-3">
          <StatusBadge status={recommendation.type} />
          <StatusBadge status={recommendation.status} />
        </div>

        {/* Title & SKU info */}
        <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
          {recommendation.productName}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5 mb-4 font-medium">
          {recommendation.storeName} • SKU: <span className="font-mono text-slate-700">{recommendation.targetSku}</span>
        </p>

        {/* Structured Spec Grid */}
        <div className="space-y-2 py-3 border-y border-slate-100 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Proposed Value:</span>
            <span className="font-extrabold text-slate-900 font-mono text-sm">
              {recommendation.proposedValue}
            </span>
          </div>

          {recommendation.destinationStoreName && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Transfer Destination:</span>
              <span className="font-bold text-slate-900">
                {recommendation.destinationStoreName}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Timing Window:</span>
            <span className="font-medium text-slate-700">
              {recommendation.timingWindow}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Waste Units Prevented:</span>
            <span className="font-bold text-emerald-600 font-mono">
              +{recommendation.wasteUnitsPrevented} units
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Cost Avoidance:</span>
            <span className="font-extrabold text-slate-900 font-mono">
              ${recommendation.costAvoidance}
            </span>
          </div>
        </div>

        {/* Algorithmic Evidence Section */}
        <div className="mt-3 mb-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            ALGORITHMIC EVIDENCE
          </div>
          <div className="flex flex-wrap gap-1.5">
            {recommendation.algorithmicEvidence.map((evidence, idx) => (
              <span
                key={idx}
                className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-50 text-slate-700 border border-slate-200"
              >
                {evidence}
              </span>
            ))}
          </div>
        </div>

        {/* Audit/Modification notes if present */}
        {recommendation.actionNotes && (
          <div className="p-2 mb-3 rounded-lg bg-emerald-50 text-[11px] text-emerald-900 border border-emerald-200/60 font-medium">
            <span className="font-bold">Log: </span>
            {recommendation.actionNotes}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-2">
        {isActionable ? (
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onApprove(recommendation)}
              className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#062314] text-xs font-bold shadow-2xs transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span>Approve</span>
            </button>

            <button
              onClick={() => onModify(recommendation)}
              className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Modify</span>
            </button>

            <button
              onClick={() => onReject(recommendation)}
              className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Reject</span>
            </button>
          </div>
        ) : (
          <div className="text-center py-1.5 text-xs text-slate-400 font-medium bg-slate-50 rounded-xl border border-slate-100">
            {role === 'USER' ? 'Read-Only Catalog Access' : `Decision recorded: ${recommendation.status}`}
          </div>
        )}
      </div>
    </div>
  );
};
