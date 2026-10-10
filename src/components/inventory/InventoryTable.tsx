import React, { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BatchItem, Category } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface InventoryTableProps {
  batches: BatchItem[];
  limit?: number;
  initialSearch?: string;
  onSelectBatch?: (batch: BatchItem) => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  batches,
  limit,
  initialSearch = '',
  onSelectBatch,
}) => {
  const { selectedStore } = useAuth();
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expiryWindowFilter, setExpiryWindowFilter] = useState<'ALL' | '<3' | '<7'>('ALL');
  const [selectedBatchDetail, setSelectedBatchDetail] = useState<BatchItem | null>(null);

  // Filter batches
  const filteredBatches = useMemo(() => {
    return batches.filter((b) => {
      // Store filter
      if (selectedStore !== 'ALL' && b.storeId !== selectedStore) {
        return false;
      }
      // Search
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        b.productName.toLowerCase().includes(query) ||
        b.sku.toLowerCase().includes(query) ||
        b.id.toLowerCase().includes(query);
      if (!matchesSearch) return false;

      // Category
      if (selectedCategory !== 'ALL' && b.category !== selectedCategory) {
        return false;
      }

      // Expiry window
      if (expiryWindowFilter === '<3' && b.daysLeft >= 3) return false;
      if (expiryWindowFilter === '<7' && b.daysLeft >= 7) return false;

      return true;
    });
  }, [batches, selectedStore, searchTerm, selectedCategory, expiryWindowFilter]);

  const displayedBatches = limit ? filteredBatches.slice(0, limit) : filteredBatches;

  const categories: (Category | 'ALL')[] = [
    'ALL',
    'Dairy',
    'Produce',
    'Bakery',
    'Meat & Poultry',
    'Prepared Foods',
  ];

  return (
    <div className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Relational Batch-Level Inventory
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Explicit tracking per delivery batch. Batches are never grouped or averaged across dates.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Search */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter product/SKU..."
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:border-emerald-600 cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'ALL' ? 'All Categories' : c}
              </option>
            ))}
          </select>

          {/* Expiry Window Filter */}
          <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setExpiryWindowFilter('ALL')}
              className={`px-2.5 py-0.5 rounded-lg font-medium transition-colors cursor-pointer ${
                expiryWindowFilter === 'ALL'
                  ? 'bg-white shadow-2xs text-[#062314] font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Windows
            </button>
            <button
              onClick={() => setExpiryWindowFilter('<3')}
              className={`px-2.5 py-0.5 rounded-lg font-medium transition-colors cursor-pointer ${
                expiryWindowFilter === '<3'
                  ? 'bg-[#062314] text-white font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              &lt; 3 Days
            </button>
            <button
              onClick={() => setExpiryWindowFilter('<7')}
              className={`px-2.5 py-0.5 rounded-lg font-medium transition-colors cursor-pointer ${
                expiryWindowFilter === '<7'
                  ? 'bg-emerald-100 text-emerald-900 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              &lt; 7 Days
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-3">BATCH ID</th>
              <th className="py-3 px-3">PRODUCT / SKU</th>
              <th className="py-3 px-3">CATEGORY</th>
              <th className="py-3 px-3">LOCATION</th>
              <th className="py-3 px-3 text-right">AVAILABLE QTY</th>
              <th className="py-3 px-3">RECEIVED</th>
              <th className="py-3 px-3">EXPIRY DATE</th>
              <th className="py-3 px-3 text-center">DAYS LEFT</th>
              <th className="py-3 px-3 text-center">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayedBatches.length > 0 ? (
              displayedBatches.map((batch) => {
                const statusBadgeLabel =
                  batch.daysLeft <= 1
                    ? `Critical (${batch.daysLeft}d)`
                    : batch.daysLeft <= 2
                    ? `Critical (${batch.daysLeft}d)`
                    : batch.daysLeft <= 3
                    ? `Warning (${batch.daysLeft}d)`
                    : `Fresh (${batch.daysLeft}d)`;

                return (
                  <tr
                    key={batch.id}
                    onClick={() => {
                      setSelectedBatchDetail(batch);
                      if (onSelectBatch) onSelectBatch(batch);
                    }}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    {/* BATCH ID */}
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-800 group-hover:text-emerald-800">
                      {batch.id}
                    </td>

                    {/* PRODUCT / SKU */}
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-900 group-hover:text-emerald-950">
                        {batch.productName}
                      </div>
                      <div className="font-mono text-[11px] text-slate-400">
                        {batch.sku}
                      </div>
                    </td>

                    {/* CATEGORY */}
                    <td className="py-3.5 px-3">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
                        {batch.category}
                      </span>
                    </td>

                    {/* LOCATION */}
                    <td className="py-3.5 px-3 text-slate-700 font-medium">
                      {batch.storeId === 'STORE_A'
                        ? 'Store A'
                        : batch.storeId === 'STORE_B'
                        ? 'Store B'
                        : 'Store C'}
                    </td>

                    {/* AVAILABLE QTY */}
                    <td className="py-3.5 px-3 text-right font-extrabold text-slate-900 font-mono">
                      {batch.availableQty} <span className="font-normal text-slate-500 text-[11px]">units</span>
                    </td>

                    {/* RECEIVED */}
                    <td className="py-3.5 px-3 font-mono text-slate-500">
                      {batch.receivedDate}
                    </td>

                    {/* EXPIRY DATE */}
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-800">
                      {batch.expiryDate}
                    </td>

                    {/* DAYS LEFT */}
                    <td className="py-3.5 px-3 text-center font-mono font-extrabold text-slate-900">
                      {batch.daysLeft}d
                    </td>

                    {/* STATUS */}
                    <td className="py-3.5 px-3 text-center">
                      <StatusBadge
                        status={statusBadgeLabel}
                        customLabel={statusBadgeLabel}
                      />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400">
                  No batches match the applied filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
        <div>
          Showing <span className="font-bold text-slate-800">{displayedBatches.length}</span> batches
          {limit && filteredBatches.length > limit && (
            <span> of {filteredBatches.length} total</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[11px] text-slate-600">Synced with cluster node: live</span>
        </div>
      </div>

      {/* Detail Drawer Modal when batch clicked */}
      {selectedBatchDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-emerald-900/15 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono uppercase bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-bold border border-emerald-200">
                  {selectedBatchDetail.id}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {selectedBatchDetail.productName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBatchDetail(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3 py-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Storage Temp</span>
                  <span className="font-bold text-slate-800">{selectedBatchDetail.storageTemp}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Lot Tracking</span>
                  <span className="font-mono font-bold text-slate-800">{selectedBatchDetail.lotNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Unit Cost / Price</span>
                  <span className="font-mono font-bold text-slate-800">
                    ${selectedBatchDetail.unitCost} / ${selectedBatchDetail.retailPrice}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Predicted Daily Run</span>
                  <span className="font-mono font-bold text-slate-800">
                    ~{selectedBatchDetail.predictedDailyDemand} {selectedBatchDetail.unit}/day
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/60">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-emerald-950">Spoilage Risk Probability</span>
                  <span className="font-mono font-extrabold text-[#062314]">
                    {selectedBatchDetail.spoilageRiskScore}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#062314] h-full rounded-full transition-all"
                    style={{ width: `${selectedBatchDetail.spoilageRiskScore}%` }}
                  />
                </div>
                <p className="text-[11px] text-emerald-800/80 mt-2">
                  Projected expiry in {selectedBatchDetail.daysLeft} days. Algorithmic decay model forecasts {Math.max(0, selectedBatchDetail.availableQty - selectedBatchDetail.predictedDailyDemand * selectedBatchDetail.daysLeft)} units at risk of non-absorption.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedBatchDetail(null)}
                className="px-4 py-2 bg-[#062314] text-white text-xs font-bold rounded-xl hover:bg-[#0D2818]"
              >
                Close Batch Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
