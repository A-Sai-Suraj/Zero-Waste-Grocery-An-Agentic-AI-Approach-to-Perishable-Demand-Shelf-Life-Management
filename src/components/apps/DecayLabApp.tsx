import React, { useMemo, useState } from 'react';
import { INITIAL_BATCHES } from '../../data/mockData';

export const DecayLabApp: React.FC = () => {
  const [selectedBatchId, setSelectedBatchId] = useState<string>(INITIAL_BATCHES[2].id); // Spinach
  const [temperatureF, setTemperatureF] = useState<number>(38);
  const [hasEthyleneCoStorage, setHasEthyleneCoStorage] = useState<boolean>(false);
  const [humidityPct, setHumidityPct] = useState<number>(85);

  const batch = useMemo(
    () => INITIAL_BATCHES.find((b) => b.id === selectedBatchId) || INITIAL_BATCHES[0],
    [selectedBatchId]
  );

  // Baseline optimal temperature
  const optimalTempF = batch.category === 'Produce' ? 34 : batch.category === 'Dairy' ? 36 : 33;
  const tempDeltaF = Math.max(0, temperatureF - optimalTempF);

  // Arrhenius Q10 decay multiplier
  const q10Factor = 2.2;
  const tempDecayMultiplier = Math.pow(q10Factor, (tempDeltaF * 5 / 9) / 10);
  const ethyleneMultiplier = hasEthyleneCoStorage ? 1.65 : 1.0;
  const humidityPenalty = humidityPct < 75 ? 1.25 : 1.0;

  const totalDegradationFactor = +(tempDecayMultiplier * ethyleneMultiplier * humidityPenalty).toFixed(2);

  // Real-time adjusted shelf life
  const nominalHoursLeft = batch.daysLeft * 24;
  const actualEffectiveHoursLeft = Math.max(1, Math.round(nominalHoursLeft / totalDegradationFactor));
  const lostHours = Math.max(0, nominalHoursLeft - actualEffectiveHoursLeft);

  const spoilageProbability = Math.min(
    99,
    Math.round(batch.spoilageRiskScore * (totalDegradationFactor > 1.2 ? 1.3 : 1.0))
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#062314] text-white rounded-3xl p-6 border border-emerald-950 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase bg-emerald-950 text-emerald-400 font-bold px-2.5 py-0.5 rounded-full border border-emerald-800/60 inline-block mb-2">
            Perishable Biophysics Simulator
          </span>
          <h2 className="text-xl font-extrabold tracking-tight text-white">
            BioDecay Studio — Cold Chain Telematics & Decay Kinetics Lab
          </h2>
          <p className="text-xs text-emerald-200/70 max-w-2xl mt-1">
            Simulate walk-in cooler thermal breaks, microbial respiration spikes, and ethylene gas co-storage to predict accelerated degradation before visual shelf spoilage manifests.
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-emerald-900/60 border border-emerald-700/50 text-right">
          <span className="text-[10px] uppercase font-bold text-emerald-300 block">Kinetic Engine</span>
          <span className="text-xs font-bold text-white font-mono">Arrhenius Q₁₀ = 2.2</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              Environmental Stress Parameter Tuning
            </h3>
            <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              Lot: {batch.lotNumber}
            </span>
          </div>

          {/* Batch Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[10px]">
              Select Food Batch:
            </label>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="w-full text-xs font-semibold p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-hidden focus:border-emerald-600 focus:bg-white cursor-pointer"
            >
              {INITIAL_BATCHES.map((b) => (
                <option key={b.id} value={b.id}>
                  [{b.id}] {b.productName} ({b.category} • Nominal: {b.storageTemp})
                </option>
              ))}
            </select>
          </div>

          {/* Temperature Slider */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Cooler Telematics Sensor (Temperature):</span>
                <span className="text-[11px] text-slate-500">
                  Target: {optimalTempF}°F • Current simulated ambient reading
                </span>
              </div>
              <span className={`text-2xl font-black font-mono ${temperatureF > 40 ? 'text-[#062314]' : 'text-emerald-700'}`}>
                {temperatureF}°F
              </span>
            </div>

            <input
              type="range"
              min="30"
              max="58"
              step="1"
              value={temperatureF}
              onChange={(e) => setTemperatureF(Number(e.target.value))}
              className="w-full accent-[#062314] cursor-pointer"
            />

            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>30°F (Deep Chill)</span>
              <span>{optimalTempF}°F (Ideal Spec)</span>
              <span>48°F (Thermal Excursion)</span>
              <span>58°F (Dangerous Ambient)</span>
            </div>
          </div>

          {/* Ethylene & Humidity Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Ethylene Co-Storage Toggle */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block mb-1">
                  Ethylene Gas Co-Storage
                </span>
                <p className="text-[11px] text-slate-500">
                  Ripening gas proximity (e.g. bananas, apples, avocados in adjacent shelf bay).
                </p>
              </div>

              <div className="pt-3">
                <button
                  onClick={() => setHasEthyleneCoStorage(!hasEthyleneCoStorage)}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    hasEthyleneCoStorage
                      ? 'bg-[#062314] text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {hasEthyleneCoStorage ? 'Ethylene Exposure: ACTIVE (+65% decay)' : 'Ethylene Filter: ISOLATED'}
                </button>
              </div>
            </div>

            {/* Relative Humidity */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Cooler Humidity:</span>
                <span className="font-mono font-bold text-slate-800 text-xs">{humidityPct}% RH</span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                step="5"
                value={humidityPct}
                onChange={(e) => setHumidityPct(Number(e.target.value))}
                className="w-full accent-emerald-700 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 block">
                {humidityPct < 75 ? 'Low moisture induces leaf desiccation' : 'Optimal moisture retention'}
              </span>
            </div>
          </div>
        </div>

        {/* Real-Time Telemetry & Impact (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              Calculated Shelf-Life Impact
            </h3>

            {/* Big Degradation Meter */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Respiration Velocity Multiplier
              </span>
              <div className="text-3xl font-black text-[#062314] font-mono">
                {totalDegradationFactor}x
              </div>
              <p className="text-[11px] text-emerald-800 font-medium">
                {totalDegradationFactor > 1.3
                  ? 'Degrading significantly faster than nominal design curve'
                  : 'Operating inside acceptable cold chain stability envelope'}
              </p>
            </div>

            {/* Hours Lost Breakdown */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500">Nominal Remaining Life:</span>
                <span className="font-mono font-bold text-slate-800">{nominalHoursLeft} hours ({batch.daysLeft}d)</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500">Effective Remaining Life:</span>
                <span className="font-mono font-black text-[#062314] text-sm">{actualEffectiveHoursLeft} hours</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <span className="text-slate-600 font-semibold">Lost Shelf Life:</span>
                <span className="font-mono font-extrabold text-emerald-800">-{lostHours} hours</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500">Spoilage Probability Index:</span>
                <span className="font-mono font-extrabold text-[#062314]">{spoilageProbability}%</span>
              </div>
            </div>

            {/* Prescribed Action Plan */}
            <div className="p-3.5 rounded-2xl bg-[#062314] text-white text-xs border border-emerald-950">
              <span className="font-bold text-emerald-300 block mb-1">Prescribed Containment Protocol:</span>
              <p className="text-emerald-100/80 text-[11px] leading-relaxed">
                {totalDegradationFactor > 1.5
                  ? 'Initiate emergency transfer to Walk-in Cooler Zone 1 (34°F). If thermal excursion exceeds 6h, schedule immediate -35% clearance markdown.'
                  : 'Batch within regulatory holding parameters. Continue standard FIFO stock rotation.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
