import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { TransferRoute } from '../../types';

interface TransferMatrixProps {
  routes: TransferRoute[];
  onRefresh?: () => void;
}

export const TransferMatrix: React.FC<TransferMatrixProps> = ({ routes, onRefresh }) => {
  const { role } = useAuth();
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);

  const handleDispatch = async (routeId: string) => {
    try {
      setDispatchingId(routeId);
      await api.dispatchTransfer(routeId);
      if (onRefresh) onRefresh();
    } catch {
      // Handled
    } finally {
      setDispatchingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-[#062314] text-white rounded-3xl p-6 border border-emerald-950 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-800/60 inline-block mb-2">
            Multi-Store Grid Balancing
          </span>
          <h2 className="text-xl font-extrabold tracking-tight text-white">
            Inter-Store Perishable Redistribution Matrix
          </h2>
          <p className="text-xs text-emerald-200/70 max-w-xl mt-1">
            Algorithmic dispatch calculates transit degradation vs recipient stockout elasticity. Excess batches from slow-depleting locations are re-routed to high-velocity nodes before sell-by horizons lapse.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-emerald-900/60 border border-emerald-700/50 rounded-2xl p-4 text-center">
            <span className="text-[10px] uppercase text-emerald-300 font-bold block">Active Routes</span>
            <span className="text-2xl font-black text-white font-mono">{routes.length}</span>
          </div>
          <div className="bg-emerald-900/60 border border-emerald-700/50 rounded-2xl p-4 text-center">
            <span className="text-[10px] uppercase text-emerald-300 font-bold block">Rescued Net Margin</span>
            <span className="text-2xl font-black text-emerald-300 font-mono">
              +${routes.reduce((acc, r) => acc + r.netSavings, 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {routes.map((route) => {
          const isPending = route.status === 'PENDING';
          const isInTransit = route.status === 'IN_TRANSIT';

          return (
            <div
              key={route.id}
              className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                    {route.id}
                  </span>

                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      isInTransit
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 animate-pulse'
                        : isPending
                        ? 'bg-slate-100 text-slate-800 border-slate-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    {isInTransit ? 'In Transit 🚚' : route.status}
                  </span>
                </div>

                {/* Product Name */}
                <h3 className="text-base font-extrabold text-slate-950 mb-1">
                  {route.productName}
                </h3>
                <p className="text-xs text-slate-400 font-mono mb-4">{route.sku}</p>

                {/* Donor vs Recipient Store Visual */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-4">
                  <div className="flex items-center justify-between text-xs font-semibold mb-2">
                    <div className="text-left">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Donor Node (Surplus)</span>
                      <span className="text-slate-900 font-bold">{route.donorStoreName}</span>
                      <span className="block text-[11px] text-emerald-700 font-mono">
                        +{route.surplusUnits} units excess
                      </span>
                    </div>

                    <div className="flex flex-col items-center px-4">
                      <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                      <span className="text-[10px] font-bold text-slate-500 font-mono">
                        {route.transitTimeMinutes} min transit
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Recipient Node (Deficit)</span>
                      <span className="text-slate-900 font-bold">{route.recipientStoreName}</span>
                      <span className="block text-[11px] text-slate-600 font-mono">
                        -{route.recipientDeficitUnits} units deficit
                      </span>
                    </div>
                  </div>
                </div>

                {/* Feasibility & Logistics Indicators */}
                <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-xs mb-4 text-center">
                  <div className="p-2 rounded-xl bg-emerald-50/50">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Transfer Qty</span>
                    <span className="font-mono font-black text-slate-900 text-sm">
                      {route.proposedTransferQty} units
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-emerald-50/50">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Remaining Life</span>
                    <span className="font-mono font-bold text-emerald-800 text-sm">
                      {route.remainingShelfLifeHours}h on arrival
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-emerald-50/50">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Feasibility</span>
                    <span className="font-mono font-extrabold text-[#062314] text-sm">
                      {route.feasibilityScore}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-2 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  Transit cost: <span className="font-mono font-semibold text-slate-800">${route.transferCost}</span> • Net avoided loss: <span className="font-mono font-bold text-emerald-700">+${route.netSavings}</span>
                </div>

                {role === 'ADMIN' && isPending && (
                  <button
                    onClick={() => handleDispatch(route.id)}
                    disabled={dispatchingId === route.id}
                    className="px-4 py-2 bg-[#062314] hover:bg-[#0D2818] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    {dispatchingId === route.id ? 'Dispatching...' : 'Dispatch Shuttle'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
