import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { STORES } from '../../data/mockData';
import { StoreId } from '../../types';
import { Sidebar, ActiveTab } from './Sidebar';
import { TopSimBanner } from './TopSimBanner';

interface AppShellProps {
  children: React.ReactNode;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onGlobalSearch?: (query: string) => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  activeTab,
  setActiveTab,
  onGlobalSearch,
}) => {
  const {
    role,
    setRole,
    selectedStore,
    setSelectedStore,
    syncLive,
    lastSyncTime,
  } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (onGlobalSearch) {
      onGlobalSearch(e.target.value);
    }
  };

  const currentStoreObj = STORES.find((s) => s.id === selectedStore) || STORES[0];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col">
      {/* Simulation Banner */}
      <TopSimBanner />

      {/* Main Layout Area */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpenMobile={mobileMenuOpen}
          setIsOpenMobile={setMobileMenuOpen}
        />

        {/* Content Area */}
        <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
          {/* Top Header */}
          <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-emerald-900/10 px-4 sm:px-6 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Left Controls: Mobile trigger + Facility selector + Simulated Window */}
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100"
                  aria-label="Open navigation menu"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                {/* Facility Selector */}
                <div className="relative inline-flex items-center">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs font-semibold text-emerald-900">
                    <svg className="w-4 h-4 text-emerald-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="text-slate-500 font-normal">Facility:</span>
                    <select
                      value={selectedStore}
                      onChange={(e) => setSelectedStore(e.target.value as StoreId)}
                      disabled={role === 'STORE_OWNER'}
                      className="bg-transparent font-bold text-emerald-950 focus:outline-hidden cursor-pointer"
                    >
                      {STORES.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Simulated Window */}
                <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-700">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-slate-500">Simulated Window:</span>
                  <span className="font-bold text-slate-800">Oct 10 – Oct 17</span>
                </div>
              </div>

              {/* Right Controls: Search, Notification, Sync Live, Role pill */}
              <div className="flex items-center gap-2 sm:gap-3 flex-1 sm:flex-initial justify-end">
                {/* Search Bar */}
                <div className="relative flex-1 sm:w-64 max-w-xs">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search SKU or Batch ID..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
                  />
                </div>

                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 rounded-xl text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 border border-slate-200 transition-colors cursor-pointer"
                    aria-label="View notifications"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#062314] text-[#A7F3D0] border border-white text-[9px] font-bold flex items-center justify-center">
                      3
                    </span>
                  </button>

                  {/* Notification Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-emerald-900/10 p-3 z-50 animate-in fade-in zoom-in-95">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-800">Agent Action Alerts</span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">3 Pending</span>
                      </div>
                      <div className="mt-2 space-y-2 text-xs">
                        <div
                          onClick={() => { setActiveTab('recommendations'); setShowNotifications(false); }}
                          className="p-2 rounded-xl bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100 cursor-pointer"
                        >
                          <div className="font-semibold text-emerald-950 flex items-center justify-between">
                            <span>Markdown Proposal: Milk</span>
                            <span className="text-[10px] text-slate-500">4h left</span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5">Batch B-7741 at Store A nearing 48h expiry. -30% proposed.</p>
                        </div>
                        <div
                          onClick={() => { setActiveTab('recommendations'); setShowNotifications(false); }}
                          className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                        >
                          <div className="font-semibold text-slate-900 flex items-center justify-between">
                            <span>Transfer Proposal: Sourdough</span>
                            <span className="text-[10px] text-slate-500">Transit 25m</span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5">40 Boules from Store B to Store A to mitigate stockout.</p>
                        </div>
                        <div
                          onClick={() => { setActiveTab('recommendations'); setShowNotifications(false); }}
                          className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                        >
                          <div className="font-semibold text-slate-900 flex items-center justify-between">
                            <span>Replenishment: Spinach</span>
                            <span className="text-[10px] text-slate-500">Evening</span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5">120 units at Store C recommended for weekend velocity spike.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sync Live Button */}
                <button
                  onClick={syncLive}
                  title={`Last synced: ${lastSyncTime}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50/80 border border-emerald-900/15 text-xs font-semibold text-emerald-950 shadow-2xs hover:border-emerald-500 transition-all cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 text-emerald-600 animate-spin-reverse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Sync Live</span>
                </button>

                {/* Role Switcher Badge */}
                <div className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Role:</span>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="bg-transparent font-bold text-emerald-950 focus:outline-hidden cursor-pointer"
                  >
                    <option value="ADMIN">Admin (Planner)</option>
                    <option value="STORE_OWNER">Store Owner (Store A)</option>
                    <option value="USER">User (Staff / Shopper)</option>
                  </select>
                </div>
              </div>
            </div>
          </header>

          {/* Subheader / Page Context */}
          <div className="px-4 sm:px-6 pt-5 pb-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                  {activeTab === 'dashboard' && 'Planner Overview & Perishable Risk'}
                  {activeTab === 'inventory' && 'Batch-Aware Fresh Inventory'}
                  {activeTab === 'recommendations' && 'Action Review Center (Human-in-the-Loop)'}
                  {activeTab === 'markdown' && 'PriceDecay AI — Dynamic Markdown Optimization & ESL Dispatcher'}
                  {activeTab === 'replenishment' && 'RestockAI — Autonomous Perishable Purchase Order Builder'}
                  {activeTab === 'decaylab' && 'BioDecay Studio — Cold Chain Telematics & Decay Kinetics Lab'}
                  {activeTab === 'forecasts' && 'Demand Forecasting & Baseline Comparison'}
                  {activeTab === 'alerts' && 'Expiry & Freshness Alert Hierarchy'}
                  {activeTab === 'transfers' && 'Inter-Store Inventory Balancing'}
                  {activeTab === 'evaluation' && 'Model Evaluation & Waste Impact Metrics'}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Active facility: <span className="font-semibold text-slate-800">{currentStoreObj.name}</span> • Short-range shelf-life decay & replenishment intelligence
                </p>
              </div>

              {/* Model Confidence Tag */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Model Confidence: 94.2%</span>
              </div>
            </div>
          </div>

          {/* Main Body Children */}
          <main className="flex-1 px-4 sm:px-6 pb-10">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
