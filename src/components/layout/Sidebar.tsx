import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';

export type ActiveTab =
  | 'dashboard'
  | 'inventory'
  | 'recommendations'
  | 'markdown'
  | 'transfers'
  | 'replenishment'
  | 'decaylab'
  | 'forecasts'
  | 'alerts'
  | 'evaluation';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile,
  setIsOpenMobile,
}) => {
  const { role, setRole, user, canViewTransfers, canViewEvaluation, canViewForecasting } = useAuth();

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#062314] text-white flex flex-col justify-between border-r border-emerald-950 transition-transform duration-200 lg:translate-x-0 overflow-y-auto ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Logo & Workspace Heading */}
        <div className="p-5">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-[#062314] shadow-md shadow-emerald-950/60 font-bold">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <div>
              <div className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
                ZeroWaste <span className="text-emerald-400 font-black">AI</span>
              </div>
              <div className="text-[11px] font-medium text-emerald-300/70">
                Shelf-Life Intelligence
              </div>
            </div>
          </div>

          {/* Section 1: PLANNER WORKSPACE */}
          <div className="text-[10px] font-bold tracking-wider uppercase text-emerald-400/80 mb-2 px-2">
            PLANNER WORKSPACE
          </div>

          <nav className="space-y-1 mb-5">
            {/* Dashboard */}
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-[#10B981] text-[#062314] shadow-sm'
                  : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span>Dashboard</span>
              </div>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  activeTab === 'dashboard'
                    ? 'bg-[#062314] text-emerald-300'
                    : 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                }`}
              >
                LIVE
              </span>
            </button>

            {/* Batch Inventory */}
            <button
              onClick={() => handleNavClick('inventory')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-[#10B981] text-[#062314]'
                  : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>Batch Inventory</span>
              </div>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeTab === 'inventory'
                    ? 'bg-[#062314] text-white'
                    : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/40'
                }`}
              >
                54
              </span>
            </button>

            {/* Recommendations / Review Center */}
            {role !== 'USER' && (
              <button
                onClick={() => handleNavClick('recommendations')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'recommendations'
                    ? 'bg-[#10B981] text-[#062314]'
                    : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Recommendations</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    activeTab === 'recommendations'
                      ? 'bg-[#062314] text-emerald-300'
                      : 'bg-emerald-900/80 text-emerald-300 border border-emerald-700/50'
                  }`}
                >
                  3 New
                </span>
              </button>
            )}

            {/* Expiry Alerts */}
            <button
              onClick={() => handleNavClick('alerts')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'alerts'
                  ? 'bg-[#10B981] text-[#062314]'
                  : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Expiry Alerts</span>
              </div>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeTab === 'alerts'
                    ? 'bg-[#062314] text-white'
                    : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/40'
                }`}
              >
                14
              </span>
            </button>
          </nav>

          {/* Section 2: INTELLIGENCE APPLICATIONS */}
          <div className="text-[10px] font-bold tracking-wider uppercase text-emerald-400/80 mb-2 px-2">
            INTELLIGENCE APPLICATIONS
          </div>

          <nav className="space-y-1">
            {/* App 1: PriceDecay AI Markdown Optimizer */}
            <button
              onClick={() => handleNavClick('markdown')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'markdown'
                  ? 'bg-[#10B981] text-[#062314]'
                  : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span>PriceDecay Optimizer</span>
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-900/80 text-emerald-300">
                ESL
              </span>
            </button>

            {/* App 2: StoreRelay Transfer Balancing */}
            {canViewTransfers && (
              <button
                onClick={() => handleNavClick('transfers')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'transfers'
                    ? 'bg-[#10B981] text-[#062314]'
                    : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <span>StoreRelay Transfers</span>
                </div>
              </button>
            )}

            {/* App 3: RestockAI Autonomous Replenishment */}
            {role !== 'USER' && (
              <button
                onClick={() => handleNavClick('replenishment')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'replenishment'
                    ? 'bg-[#10B981] text-[#062314]'
                    : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>RestockAI Orders</span>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-900/80 text-emerald-300">
                  EDI
                </span>
              </button>
            )}

            {/* App 4: BioDecay Shelf-Life Kinetics Lab */}
            <button
              onClick={() => handleNavClick('decaylab')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'decaylab'
                  ? 'bg-[#10B981] text-[#062314]'
                  : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                <span>BioDecay Lab</span>
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                Q₁₀
              </span>
            </button>

            {/* Demand Forecast */}
            {canViewForecasting && (
              <button
                onClick={() => handleNavClick('forecasts')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'forecasts'
                    ? 'bg-[#10B981] text-[#062314]'
                    : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                  <span>Demand Forecast</span>
                </div>
              </button>
            )}

            {/* Evaluation & Impact Reports */}
            {canViewEvaluation && (
              <button
                onClick={() => handleNavClick('evaluation')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'evaluation'
                    ? 'bg-[#10B981] text-[#062314]'
                    : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Impact & ESG Ledger</span>
                </div>
              </button>
            )}
          </nav>
        </div>

        {/* Bottom Profile & Role Switcher */}
        <div className="p-4 border-t border-emerald-950/80 bg-[#041a0f]/50">
          {/* Role Quick Toggle */}
          <div className="mb-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/70 mb-1.5 flex items-center justify-between">
              <span>Active Role</span>
              <span className="text-[9px] bg-emerald-900/80 text-emerald-300 px-1 py-0.2 rounded font-mono">RBAC</span>
            </div>
            <div className="grid grid-cols-3 gap-1 bg-[#062314] p-1 rounded-lg border border-emerald-900/60">
              {(['USER', 'STORE_OWNER', 'ADMIN'] as Role[]).map((r) => {
                const label = r === 'USER' ? 'Staff' : r === 'STORE_OWNER' ? 'Owner' : 'Admin';
                const isCurrent = role === r;
                return (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`py-1 text-[10px] font-semibold rounded transition-colors text-center cursor-pointer ${
                      isCurrent
                        ? 'bg-emerald-500 text-[#062314] font-bold shadow-xs'
                        : 'text-emerald-200/60 hover:text-white hover:bg-emerald-900/40'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* User Badge */}
          <div className="flex items-center gap-3 pt-2">
            <div className="w-9 h-9 rounded-full bg-emerald-800 border border-emerald-600/50 flex items-center justify-center font-bold text-xs text-white">
              {user.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate">{user.name}</div>
              <div className="text-[11px] text-emerald-300/80 truncate flex items-center gap-1">
                <svg className="w-3 h-3 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="truncate">{user.title}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
