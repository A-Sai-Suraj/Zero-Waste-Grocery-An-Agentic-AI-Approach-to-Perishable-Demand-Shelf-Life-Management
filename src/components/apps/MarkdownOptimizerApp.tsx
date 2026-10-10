import React, { useMemo, useState } from 'react';
import { INITIAL_BATCHES } from '../../data/mockData';
import { BatchItem } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

export const MarkdownOptimizerApp: React.FC = () => {
  const [selectedBatchId, setSelectedBatchId] = useState<string>(INITIAL_BATCHES[0].id);
  const [discountPct, setDiscountPct] = useState<number>(30);
  const [timingWindow, setTimingWindow] = useState<string>('Immediate (Next 4h)');
  const [deployedSuccess, setDeployedSuccess] = useState<boolean>(false);

  const selectedBatch = useMemo(
    () => INITIAL_BATCHES.find((b) => b.id === selectedBatchId) || INITIAL_BATCHES[0],
    [selectedBatchId]
  );

  // Dynamic elasticity model calculations
  const originalPrice = selectedBatch.retailPrice;
  const unitCost = selectedBatch.unitCost;
  const discountedPrice = +(originalPrice * (1 - discountPct / 100)).toFixed(2);
  const baseDemand = selectedBatch.predictedDailyDemand;

  // Price elasticity coefficient (perishables typically -1.8 to -2.4)
  const elasticity = 2.1;
  const demandMultiplier = 1 + (discountPct / 100) * elasticity;
  const acceleratedDemand = Math.round(baseDemand * demandMultiplier);

  // Spoilage salvage calculations
  const unitsSaved = Math.min(
    selectedBatch.availableQty,
    Math.round(acceleratedDemand * (selectedBatch.daysLeft || 1))
  );
  const revenueRecovered = +(unitsSaved * discountedPrice).toFixed(2);
  const marginPreserved = +(unitsSaved * (discountedPrice - unitCost)).toFixed(2);
  const unoptimizedLoss = +(selectedBatch.availableQty * unitCost).toFixed(2);

  const handleDeployESL = () => {
    setDeployedSuccess(true);
    setTimeout(() => setDeployedSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#062314] text-white rounded-3xl p-6 border border-emerald-950 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase bg-emerald-950 text-emerald-400 font-bold px-2.5 py-0.5 rounded-full border border-emerald-800/60 inline-block mb-2">
            Dynamic Pricing Intelligence
          </span>
          <h2 className="text-xl font-extrabold tracking-tight text-white">
            PriceDecay AI — Real-Time Markdown Optimization & ESL Dispatcher
          </h2>
          <p className="text-xs text-emerald-200/70 max-w-2xl mt-1">
            Simulate price elasticity curves to maximize salvage margins before batch sell-by dates expire. Direct integration with in-store Electronic Shelf Labels (ESL) and POS registers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-4 py-2 rounded-2xl bg-emerald-900/60 border border-emerald-700/50 text-right">
            <span className="text-[10px] uppercase font-bold text-emerald-300 block">ESL Network</span>
            <span className="text-xs font-bold text-white flex items-center gap-1.5 justify-end">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              1,420 Tags Synced
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Batch Selector & Simulator Controls (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900">
              Interactive Elasticity & Clearance Simulator
            </h3>
            <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              Elasticity factor: η = 2.1x
            </span>
          </div>

          {/* Batch Selector Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[10px]">
              Select At-Risk Batch Target:
            </label>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="w-full text-xs font-semibold p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-hidden focus:border-emerald-600 focus:bg-white cursor-pointer"
            >
              {INITIAL_BATCHES.map((b) => (
                <option key={b.id} value={b.id}>
                  [{b.id}] {b.productName} ({b.availableQty} units left • Expiring in {b.daysLeft}d • {b.storeName})
                </option>
              ))}
            </select>
          </div>

          {/* Selected Batch Specs Pill Grid */}
          <div className="grid grid-cols-4 gap-2 p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
              <span className="font-semibold text-slate-800">{selectedBatch.category}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Stock Remaining</span>
              <span className="font-mono font-bold text-slate-900">{selectedBatch.availableQty} units</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Base Price / Cost</span>
              <span className="font-mono font-bold text-slate-900">
                ${originalPrice} / ${unitCost}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Shelf Life</span>
              <span className="font-mono font-bold text-[#062314]">{selectedBatch.daysLeft} days left</span>
            </div>
          </div>

          {/* Discount Slider */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">
                Simulated Markdown Depth:
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-[#062314] font-mono">
                  -{discountPct}%
                </span>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                  New Retail: ${discountedPrice}
                </span>
              </div>
            </div>

            <input
              type="range"
              min="10"
              max="60"
              step="5"
              value={discountPct}
              onChange={(e) => setDiscountPct(Number(e.target.value))}
              className="w-full accent-[#062314] cursor-pointer"
            />

            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>-10% (Slight incentive)</span>
              <span>-30% (Recommended algorithmic sweetspot)</span>
              <span>-60% (Emergency clearance)</span>
            </div>
          </div>

          {/* Timing Window Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[10px]">
              Execution Window Schedule:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                'Immediate (Next 4h)',
                'Evening Flash Restock (20:00)',
                'Tomorrow Morning Open (08:00)',
              ].map((tw) => (
                <button
                  key={tw}
                  onClick={() => setTimingWindow(tw)}
                  className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                    timingWindow === tw
                      ? 'bg-[#062314] text-white border-emerald-950 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {tw}
                </button>
              ))}
            </div>
          </div>

          {/* CTA: Deploy ESL */}
          <div className="pt-2">
            <button
              onClick={handleDeployESL}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#10B981] hover:bg-[#059669] text-[#062314] font-extrabold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Broadcast Markdown to Store ESLs & Print Clearance Stickers</span>
            </button>

            {deployedSuccess && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <span>✓ Successfully dispatched to Store ESL nodes! Tag B-{selectedBatch.id} updated to ${discountedPrice}.</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Dynamic Financial & Run-Rate Projections (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Projection Card */}
          <div className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              Projected Outcome Modeling
            </h3>

            {/* Run-rate acceleration comparison */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Daily Depletion Velocity
              </span>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Base Pace:</span>
                <span className="font-mono font-bold text-slate-800">{baseDemand} units/day</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-800 font-bold">Pace with -{discountPct}% Markdown:</span>
                <span className="font-mono font-extrabold text-[#062314] text-sm">
                  {acceleratedDemand} units/day ({Math.round(demandMultiplier * 100 - 100)}% faster)
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-[#10B981] h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.round(demandMultiplier * 40))}%` }}
                />
              </div>
            </div>

            {/* Financial Delta Grid */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <span className="text-slate-600 font-medium">Rescued Units:</span>
                <span className="font-mono font-bold text-emerald-800">
                  +{unitsSaved} of {selectedBatch.availableQty} units
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <span className="text-slate-600 font-medium">Gross Cash Recovered:</span>
                <span className="font-mono font-extrabold text-[#062314] text-sm">
                  ${revenueRecovered}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-medium">Net Margin Saved:</span>
                <span className="font-mono font-bold text-slate-800">
                  +${marginPreserved}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100/60 border border-slate-200 text-slate-600">
                <span>Default Unsold Loss Avoided:</span>
                <span className="font-mono font-bold text-slate-900">${unoptimizedLoss}</span>
              </div>
            </div>

            {/* Algorithmic Recommendation Summary */}
            <div className="p-3.5 rounded-2xl bg-[#062314] text-white text-xs border border-emerald-950">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="font-bold text-emerald-300">Algorithmic Recommendation</span>
              </div>
              <p className="text-emerald-100/80 leading-relaxed text-[11px]">
                Targeting -{discountPct}% discount on {selectedBatch.productName} avoids {unitsSaved} units of spoilage, clearing inventory 18h prior to expiration.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
