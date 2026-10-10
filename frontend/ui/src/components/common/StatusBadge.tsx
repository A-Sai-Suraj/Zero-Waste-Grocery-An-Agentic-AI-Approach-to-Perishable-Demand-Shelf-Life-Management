import React from 'react';
import { AlertTier, BatchStatus, RecommendationStatus, RecommendationType } from '../../types';

interface StatusBadgeProps {
  status: BatchStatus | RecommendationStatus | AlertTier | RecommendationType | string;
  variant?: 'pill' | 'outline' | 'subtle';
  size?: 'sm' | 'md';
  customLabel?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'sm',
  customLabel,
}) => {
  const sizeClasses = size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3 py-1';

  // Strict Palette: Deep Forest Green (#062314), Emerald (#10B981), Mint (#ECFDF5), Slate (#64748B, #0F172A), Muted Olive
  switch (status) {
    case 'Critical':
    case 'Critical (2d)':
    case 'Critical (1d)':
    case 'Expired':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-[#062314] text-[#A7F3D0] border border-emerald-900/60 shadow-xs ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
          {customLabel || status}
        </span>
      );

    case 'Warning':
    case 'Warning (3d)':
    case 'At Risk':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-[#ECFDF5] text-[#064E3B] border border-[#6EE7B7] ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
          {customLabel || status}
        </span>
      );

    case 'Fresh':
    case 'Fresh (7d)':
    case 'Fresh (4d)':
    case 'No Current Risk':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          {customLabel || status}
        </span>
      );

    case 'Monitor':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-300 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
          {customLabel || status}
        </span>
      );

    // Recommendation Types
    case 'MARKDOWN':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold tracking-wide uppercase rounded-md bg-[#062314] text-[#A7F3D0] border border-emerald-800/40 ${sizeClasses}`}
        >
          <svg className="w-3 h-3 text-[#34D399]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          MARKDOWN
        </span>
      );

    case 'INTER_STORE_TRANSFER':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold tracking-wide uppercase rounded-md bg-[#0D2818] text-[#6EE7B7] border border-emerald-800/40 ${sizeClasses}`}
        >
          <svg className="w-3 h-3 text-[#34D399]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          INTER STORE TRANSFER
        </span>
      );

    case 'REPLENISHMENT':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold tracking-wide uppercase rounded-md bg-[#F0FDF4] text-[#064E3B] border border-emerald-300 ${sizeClasses}`}
        >
          <svg className="w-3 h-3 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          REPLENISHMENT
        </span>
      );

    // Status lifecycles
    case 'PROPOSED':
    case 'Proposed':
      return (
        <span
          className={`inline-flex items-center font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}
        >
          Proposed
        </span>
      );

    case 'APPROVED':
      return (
        <span
          className={`inline-flex items-center font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 ${sizeClasses}`}
        >
          Approved
        </span>
      );

    case 'MODIFIED':
      return (
        <span
          className={`inline-flex items-center font-medium rounded-full bg-[#E2E8F0] text-[#1E293B] border border-slate-300 ${sizeClasses}`}
        >
          Modified
        </span>
      );

    case 'REJECTED':
      return (
        <span
          className={`inline-flex items-center font-medium rounded-full bg-slate-200 text-slate-800 border border-slate-300 line-through ${sizeClasses}`}
        >
          Rejected
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}
        >
          {customLabel || status}
        </span>
      );
  }
};
