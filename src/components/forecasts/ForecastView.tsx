import React, { useState } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { FORECAST_CHART_DATA, FORECAST_METADATA } from '../../data/mockData';

export const ForecastView: React.FC = () => {
  const [selectedSku, setSelectedSku] = useState('ALL');
  const [showConfidenceIntervals, setShowConfidenceIntervals] = useState(true);
  const [showBaselineComparison, setShowBaselineComparison] = useState(true);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#062314] text-white p-3.5 rounded-2xl shadow-2xl border border-emerald-900/60 text-xs">
          <p className="font-bold text-emerald-300 text-sm mb-1">{label}</p>
          <div className="space-y-1.5 font-mono">
            {payload.map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-slate-300 font-sans">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}:
                </span>
                <span className="font-bold text-white">{item.value} u</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Model Metadata Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-md border border-emerald-300">
                {FORECAST_METADATA.modelVersion}
              </span>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                {FORECAST_METADATA.modelName}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Short-term gradient boosted shelf-decay demand estimator. Trained on rolling POS register logs, temperature sensor telematics, and weekend footfall cycles.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedSku}
              onChange={(e) => setSelectedSku(e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-hidden focus:border-emerald-600 cursor-pointer"
            >
              <option value="ALL">Network Aggregate Perishables</option>
              <option value="SKU-DAI-902">Organic Whole Milk 1 Gallon (SKU-DAI-902)</option>
              <option value="SKU-PRO-401">Baby Spinach Clamshell 16oz (SKU-PRO-401)</option>
              <option value="SKU-BAK-114">Artisan Sourdough Boule (SKU-BAK-114)</option>
            </select>
          </div>
        </div>

        {/* 4 Metadata Telemetry Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Forecast Horizon</span>
            <span className="font-mono font-extrabold text-slate-900 text-sm">
              {FORECAST_METADATA.horizon}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Mean Absolute Error (MAE)</span>
            <span className="font-mono font-extrabold text-emerald-800 text-sm">
              {FORECAST_METADATA.mae} units
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Weighted APE (WAPE)</span>
            <span className="font-mono font-extrabold text-[#062314] text-sm">
              {FORECAST_METADATA.wape}%
            </span>
            <span className="text-[10px] text-emerald-600 block mt-0.5">(-9.4% vs 7d Baseline)</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Model Confidence Score</span>
            <span className="font-mono font-extrabold text-emerald-700 text-sm">
              {FORECAST_METADATA.modelConfidence}%
            </span>
          </div>
        </div>
      </div>

      {/* Primary Forecast Chart with Confidence Bounds & Baseline Comparison */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Demand Forecast Timeline & Confidence Interval
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Historical ground truth vs ML predicted consumption with baseline comparison
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showConfidenceIntervals}
                onChange={(e) => setShowConfidenceIntervals(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-slate-600 font-medium">Confidence Band (95% CI)</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showBaselineComparison}
                onChange={(e) => setShowBaselineComparison(e.target.checked)}
                className="rounded text-slate-700 focus:ring-slate-500"
              />
              <span className="text-slate-600 font-medium">7-Day Moving Avg Baseline</span>
            </label>
          </div>
        </div>

        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={FORECAST_CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="ciGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A7F3D0" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#A7F3D0" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="label" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} domain={[320, 750]} tickFormatter={(v) => `${v} u`} />
              <Tooltip content={<CustomTooltip />} />

              {/* Confidence interval area */}
              {showConfidenceIntervals && (
                <Area
                  type="monotone"
                  dataKey="upperBound"
                  stroke="none"
                  fill="url(#ciGradient)"
                  name="Confidence Band (Upper)"
                />
              )}

              {/* Baseline Moving Average */}
              {showBaselineComparison && (
                <Line
                  type="monotone"
                  dataKey="baselineMovingAvg"
                  stroke="#94A3B8"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="7-Day MA Baseline"
                />
              )}

              {/* Historical actual sales */}
              <Line
                type="monotone"
                dataKey="historicalSales"
                stroke="#062314"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#062314' }}
                name="Historical Actual Sales"
              />

              {/* Predicted Demand */}
              <Line
                type="monotone"
                dataKey="predictedDemand"
                stroke="#10B981"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#10B981', stroke: '#FFFFFF', strokeWidth: 2 }}
                name="ML Predicted Demand"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
