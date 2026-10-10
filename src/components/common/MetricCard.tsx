import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  deltaText?: string;
  deltaType?: 'positive' | 'negative' | 'neutral';
  subLabel?: string;
  icon: React.ReactNode;
  variant?: 'primary' | 'surface';
  badge?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  deltaText,
  deltaType = 'positive',
  subLabel,
  icon,
  variant = 'surface',
  badge,
}) => {
  if (variant === 'primary') {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-[#062314] text-white p-5 shadow-xs border border-emerald-950 flex flex-col justify-between transition-all hover:shadow-md">
        {/* Subtle decorative glow */}
        <div className="absolute -right-8 -top-8 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-200/80">
              {label}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-900/60 border border-emerald-700/40 flex items-center justify-center text-emerald-300">
              {icon}
            </div>
          </div>
          <div className="text-3xl font-extrabold tracking-tight text-white mb-2">
            {value}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-emerald-900/50 text-xs">
          {deltaText && (
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800/40">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              {deltaText}
            </span>
          )}
          {subLabel && <span className="text-emerald-100/70 text-[11px] truncate">{subLabel}</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-xs border border-emerald-900/10 flex flex-col justify-between transition-all hover:border-emerald-700/20 hover:shadow-md">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500">
            {label}
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
            {icon}
          </div>
        </div>
        <div className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
          {value}
        </div>
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          {deltaText && (
            <span
              className={`inline-flex items-center gap-0.5 font-semibold px-2 py-0.5 rounded-md text-[11px] ${
                deltaType === 'negative'
                  ? 'bg-slate-100 text-slate-700 border border-slate-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {deltaType === 'negative' ? (
                <svg className="w-3 h-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              ) : (
                <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              )}
              {deltaText}
            </span>
          )}
          {subLabel && <span className="text-slate-500 text-[11px]">{subLabel}</span>}
        </div>
        {badge && (
          <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
};
