import React, { useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { FORECAST_CHART_DATA } from '../../data/mockData';

interface SalesTrendChartProps {
  allowBaselineToggle?: boolean;
}

export const SalesTrendChart: React.FC<SalesTrendChartProps> = ({
  allowBaselineToggle = true,
}) => {
  const [showBaseline, setShowBaseline] = useState(false);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#062314] text-white p-3 rounded-xl shadow-xl border border-emerald-900/60 text-xs">
          <p className="font-bold text-emerald-300 mb-1">{label}</p>
          <div className="space-y-1">
            <p className="text-slate-300 flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-300" />
                Historical Sales:
              </span>
              <span className="font-mono font-bold text-white">{payload[0]?.value} units</span>
            </p>
            <p className="text-emerald-300 flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Predicted Demand:
              </span>
              <span className="font-mono font-bold text-emerald-200">{payload[1]?.value} units</span>
            </p>
            {showBaseline && payload[2] && (
              <p className="text-slate-400 flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-500" />
                  7-Day MA Baseline:
                </span>
                <span className="font-mono font-semibold text-slate-300">{payload[2]?.value} units</span>
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-xs flex flex-col justify-between">
      {/* Header & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Short-Term Demand vs. Historical Sales
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Batch depletion projection across 7-day rolling window
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#062314]" />
            <span className="text-slate-700 font-medium text-[11px]">Historical Sales</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
            <span className="text-slate-700 font-medium text-[11px]">Predicted Demand</span>
          </div>
          {allowBaselineToggle && (
            <button
              onClick={() => setShowBaseline(!showBaseline)}
              className={`text-[10px] px-2.5 py-1 rounded-lg border font-semibold transition-colors cursor-pointer ${
                showBaseline
                  ? 'bg-slate-800 text-white border-slate-700'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {showBaseline ? 'Baseline Active' : '+ Compare 7d MA'}
            </button>
          )}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-72 min-h-[280px]">
        <ResponsiveContainer width="100%" height="100%" minHeight={280}>
          <AreaChart data={FORECAST_CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
              tick={{ fill: '#64748B', fontSize: 11 }}
            />
            <YAxis
              domain={[350, 720]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#64748B', fontSize: 11 }}
              tickFormatter={(v) => `${v} u`}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Historical Curve */}
            <Line
              type="monotone"
              dataKey="historicalSales"
              stroke="#062314"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#062314', stroke: '#062314' }}
              activeDot={{ r: 6 }}
              name="Historical Sales"
            />

            {/* Predicted Curve with Area Fill */}
            <Area
              type="monotone"
              dataKey="predictedDemand"
              stroke="#10B981"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#predictedGradient)"
              dot={{ r: 4, fill: '#10B981', stroke: '#FFFFFF', strokeWidth: 1.5 }}
              activeDot={{ r: 6 }}
              name="Predicted Demand"
            />

            {/* Optional Baseline Moving Average */}
            {showBaseline && (
              <Line
                type="monotone"
                dataKey="baselineMovingAvg"
                stroke="#64748B"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
                name="7-Day MA Baseline"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
