import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { SPOILAGE_CATEGORY_DATA } from '../../data/mockData';

export const SpoilageDonut: React.FC = () => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#062314] text-white p-2.5 rounded-xl shadow-xl border border-emerald-900/60 text-xs">
          <p className="font-bold text-emerald-300">{data.name}</p>
          <p className="text-slate-200 mt-0.5">
            Share: <span className="font-mono font-bold text-white">{data.value}%</span>
          </p>
          <p className="text-slate-400 text-[11px]">
            Units at Risk: <span className="text-emerald-300 font-mono">{data.unitsAtRisk} units</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-xs flex flex-col justify-between">
      {/* Title */}
      <div>
        <h2 className="text-base font-bold text-slate-900 tracking-tight">
          Spoilage Risk by Category
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Distribution of perishable batches approaching expiry
        </p>
      </div>

      {/* Donut Chart */}
      <div className="relative w-full h-52 my-2">
        <ResponsiveContainer width="100%" height="100%" minHeight={200}>
          <PieChart>
            <Pie
              data={SPOILAGE_CATEGORY_DATA}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
              stroke="#FFFFFF"
              strokeWidth={2}
            >
              {SPOILAGE_CATEGORY_DATA.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-extrabold text-slate-900">342</span>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Units</span>
        </div>
      </div>

      {/* Legend below */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs font-medium">
        {SPOILAGE_CATEGORY_DATA.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-slate-700 font-semibold">{item.name}</span>
            <span className="text-slate-500 ml-auto font-mono font-bold">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
