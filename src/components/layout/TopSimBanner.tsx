import React from 'react';
import { useAuth } from '../../context/AuthContext';

export const TopSimBanner: React.FC = () => {
  const { simulationTick, isSimulating, toggleSimulation } = useAuth();

  return (
    <div className="w-full bg-[#062314] text-white text-xs px-4 py-2 flex flex-wrap items-center justify-between border-b border-emerald-950 font-mono tracking-tight select-none">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          {isSimulating && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          )}
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="font-bold text-emerald-400">
          [SIMULATED / SYNTHETIC DATA MODE]
        </span>
        <span className="text-emerald-100/70 hidden sm:inline">
          — Multi-Store Perishable Optimization Engine Active
        </span>
      </div>

      <div className="flex items-center gap-3 sm:gap-5 text-emerald-200/80">
        <div className="hidden md:flex items-center gap-1.5">
          <span className="text-slate-400">Horizon:</span>
          <span className="text-emerald-300 font-semibold">72h Forward</span>
        </div>

        <button
          onClick={toggleSimulation}
          title="Click to toggle simulation clock"
          className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
        >
          <span className="text-slate-400">Simulation Tick:</span>
          <span className="text-emerald-400 font-semibold font-mono">
            #{simulationTick.toLocaleString()}
          </span>
          <span className="text-[10px] px-1 py-0.2 rounded bg-emerald-900 text-emerald-300 border border-emerald-700/50">
            {isSimulating ? 'Live' : 'Paused'}
          </span>
        </button>

        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-sans font-semibold">
          v2.4-typed-api
        </span>
      </div>
    </div>
  );
};
