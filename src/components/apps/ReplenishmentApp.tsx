import React, { useState } from 'react';
import { INITIAL_REPLENISHMENT_ORDERS } from '../../data/mockData';
import { Category, ReplenishmentOrder, StoreId } from '../../types';
import { Modal } from '../common/Modal';

export const ReplenishmentApp: React.FC = () => {
  const [orders, setOrders] = useState<ReplenishmentOrder[]>(INITIAL_REPLENISHMENT_ORDERS);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New PO form state
  const [newSku, setNewSku] = useState('SKU-DAI-902');
  const [newProductName, setNewProductName] = useState('Organic Whole Milk 1 Gallon');
  const [newCategory, setNewCategory] = useState<Category>('Dairy');
  const [newStore, setNewStore] = useState<StoreId>('STORE_A');
  const [newQty, setNewQty] = useState(80);
  const [newSupplier, setNewSupplier] = useState('Highland Dairy Cooperative');

  const handleTransmit = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'TRANSMITTED' } : o))
    );
  };

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrder: ReplenishmentOrder = {
      id: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
      sku: newSku,
      productName: newProductName,
      category: newCategory,
      targetStoreId: newStore,
      targetStoreName: newStore === 'STORE_A' ? 'Store A (Northway)' : newStore === 'STORE_B' ? 'Store B (Metropolitan)' : 'Store C (Westside)',
      supplier: newSupplier,
      orderQty: newQty,
      unit: 'units',
      unitCost: 3.2,
      totalCost: +(newQty * 3.2).toFixed(2),
      estimatedDeliveryDate: '2026-10-12',
      leadTimeHours: 12,
      safetyStockTrigger: 30,
      currentStock: 15,
      status: 'TRANSMITTED',
    };
    setOrders([newOrder, ...orders]);
    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#062314] text-white rounded-3xl p-6 border border-emerald-950 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase bg-emerald-950 text-emerald-400 font-bold px-2.5 py-0.5 rounded-full border border-emerald-800/60 inline-block mb-2">
            Predictive Procurement Agent
          </span>
          <h2 className="text-xl font-extrabold tracking-tight text-white">
            RestockAI — Autonomous Perishable Purchase Order Builder
          </h2>
          <p className="text-xs text-emerald-200/70 max-w-2xl mt-1">
            Automate dynamic replenishment orders synchronized with supplier harvest cycles and distributor delivery lead times, preventing out-of-stocks without inflating perishable shrinkage.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-[#10B981] hover:bg-[#059669] text-[#062314] font-extrabold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          <span>Create New Purchase Order</span>
        </button>
      </div>

      {/* Orders Grid & Table */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Active Procurement Pipeline & Vendor Transmissions
            </h3>
            <p className="text-xs text-slate-500">
              EDI 850 Purchase Order dispatch queue with live vendor acknowledgment
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
            {orders.length} Active POs
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <th className="py-3 px-3">PO NUMBER</th>
                <th className="py-3 px-3">ITEM / SKU</th>
                <th className="py-3 px-3">SUPPLIER COOPERATIVE</th>
                <th className="py-3 px-3">STORE DESTINATION</th>
                <th className="py-3 px-3 text-right">ORDER QTY</th>
                <th className="py-3 px-3 text-right">EST. COST</th>
                <th className="py-3 px-3 text-center">LEAD TIME</th>
                <th className="py-3 px-3 text-center">STATUS</th>
                <th className="py-3 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((po) => (
                <tr key={po.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-3 font-mono font-bold text-slate-800">{po.id}</td>
                  <td className="py-3.5 px-3">
                    <span className="font-bold text-slate-900 block">{po.productName}</span>
                    <span className="font-mono text-[11px] text-slate-400">{po.sku}</span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-600 font-medium">{po.supplier}</td>
                  <td className="py-3.5 px-3 text-slate-800 font-semibold">{po.targetStoreName}</td>
                  <td className="py-3.5 px-3 text-right font-mono font-extrabold text-slate-900">
                    {po.orderQty} <span className="font-normal text-slate-400 text-[11px]">{po.unit}</span>
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-[#062314]">
                    ${po.totalCost.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono text-slate-600">
                    {po.leadTimeHours}h transit
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        po.status === 'TRANSMITTED'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : po.status === 'APPROVED'
                          ? 'bg-slate-100 text-slate-800 border-slate-300'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {po.status === 'TRANSMITTED' ? 'Transmitted to EDI' : po.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    {po.status === 'PROPOSED' ? (
                      <button
                        onClick={() => handleTransmit(po.id)}
                        className="px-3 py-1 bg-[#062314] hover:bg-[#0D2818] text-white font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
                      >
                        Transmit EDI
                      </button>
                    ) : (
                      <span className="text-slate-400 text-[11px] font-medium">In Pipeline</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create PO */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Draft Replenishment Purchase Order"
        subtitle="Autonomous procurement engine with vendor catalog linking"
      >
        <form onSubmit={handleCreatePO} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Product Target</label>
            <select
              value={newSku}
              onChange={(e) => {
                setNewSku(e.target.value);
                if (e.target.value.includes('DAI')) {
                  setNewProductName('Organic Whole Milk 1 Gallon');
                  setNewCategory('Dairy');
                  setNewSupplier('Highland Dairy Cooperative');
                } else if (e.target.value.includes('PRO')) {
                  setNewProductName('Baby Spinach Clamshell 16oz');
                  setNewCategory('Produce');
                  setNewSupplier('GreenValley Hydroponics Co.');
                } else {
                  setNewProductName('Artisan Sourdough Boule');
                  setNewCategory('Bakery');
                  setNewSupplier('Golden Hearth Bakehouse');
                }
              }}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600"
            >
              <option value="SKU-DAI-902">Organic Whole Milk 1 Gallon (Dairy)</option>
              <option value="SKU-PRO-401">Baby Spinach Clamshell 16oz (Produce)</option>
              <option value="SKU-BAK-114">Artisan Sourdough Boule (Bakery)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Store</label>
              <select
                value={newStore}
                onChange={(e) => setNewStore(e.target.value as StoreId)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-600"
              >
                <option value="STORE_A">Store A (Northway)</option>
                <option value="STORE_B">Store B (Metropolitan)</option>
                <option value="STORE_C">Store C (Westside)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Order Quantity</label>
              <input
                type="number"
                min="10"
                max="500"
                value={newQty}
                onChange={(e) => setNewQty(Number(e.target.value))}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-mono focus:outline-hidden focus:border-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Supplier Cooperative</label>
            <input
              type="text"
              value={newSupplier}
              onChange={(e) => setNewSupplier(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-[#062314] font-bold text-xs rounded-xl"
            >
              Confirm & Dispatch PO
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
