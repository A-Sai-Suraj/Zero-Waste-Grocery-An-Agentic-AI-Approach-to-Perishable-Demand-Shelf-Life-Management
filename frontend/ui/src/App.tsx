import React, { Component, ErrorInfo, useEffect, useState } from 'react';
import { AlertsView } from './components/alerts/AlertsView';
import { DecayLabApp } from './components/apps/DecayLabApp';
import { MarkdownOptimizerApp } from './components/apps/MarkdownOptimizerApp';
import { ReplenishmentApp } from './components/apps/ReplenishmentApp';
import { MetricCard } from './components/common/MetricCard';
import { EvaluationView } from './components/evaluation/EvaluationView';
import { ForecastView } from './components/forecasts/ForecastView';
import { InventoryTable } from './components/inventory/InventoryTable';
import { AppShell } from './components/layout/AppShell';
import { ActiveTab } from './components/layout/Sidebar';
import { DecisionModal } from './components/recommendations/DecisionModal';
import { RecommendationCard } from './components/recommendations/RecommendationCard';
import { AuthProvider, useAuth } from './context/AuthContext';
import { api } from './lib/api';
import { BatchItem, Recommendation, Store } from './types';

class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ZeroWaste App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-white p-8 rounded-3xl border border-emerald-900/10 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center mx-auto mb-4 font-bold text-xl">
              !
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Display Diagnostic Notice</h2>
            <p className="text-xs text-slate-600 mb-4">
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#062314] text-white text-xs font-bold rounded-xl"
            >
              Reload Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const MainAppContent: React.FC = () => {
  const { role, selectedStore } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [dashboardSummary, setDashboardSummary] = useState<Awaited<ReturnType<typeof api.getDashboardSummary>> | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');

  // Decision Modal State
  const [activeRecForModal, setActiveRecForModal] = useState<Recommendation | null>(null);
  const [modalMode, setModalMode] = useState<'APPROVE' | 'MODIFY' | 'REJECT'>('APPROVE');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load datasets
  const loadData = async () => {
    setIsLoading(true);
    setDataError(null);
    try {
      const [b, r, s, summary] = await Promise.all([
        api.getBatches(selectedStore),
        api.getRecommendations(selectedStore),
        api.getStores(),
        api.getDashboardSummary(selectedStore),
      ]);
      setBatches(b);
      setRecommendations(r);
      setStores(s);
      setDashboardSummary(summary);
      setDataError(null);
    } catch (error) {
      setBatches([]);
      setRecommendations([]);
      setStores([]);
      setDashboardSummary(null);
      setDataError(error instanceof Error ? error.message : 'The backend request failed.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [selectedStore]);

  // Modal Handlers
  const handleOpenApprove = (rec: Recommendation) => {
    setActiveRecForModal(rec);
    setModalMode('APPROVE');
    setIsModalOpen(true);
  };

  const handleOpenModify = (rec: Recommendation) => {
    setActiveRecForModal(rec);
    setModalMode('MODIFY');
    setIsModalOpen(true);
  };

  const handleOpenReject = (rec: Recommendation) => {
    setActiveRecForModal(rec);
    setModalMode('REJECT');
    setIsModalOpen(true);
  };

  const handleConfirmApprove = async (id: string, notes?: string) => {
    await api.approveRecommendation(id, notes);
    await loadData();
  };

  const handleConfirmModify = async (
    id: string,
    mod: { proposedValue: string; reason: string; qty?: number; discountPct?: number }
  ) => {
    if (!activeRecForModal) throw new Error('No recommendation is selected.');
    await api.modifyRecommendation(id, mod, activeRecForModal.type);
    await loadData();
  };

  const handleConfirmReject = async (id: string, reason: string) => {
    await api.rejectRecommendation(id, reason);
    await loadData();
  };

  // Recommendations pending review
  const pendingRecommendations = recommendations.filter((r) => r.status === 'PROPOSED');

  return (
    <AppShell
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onGlobalSearch={setGlobalSearchTerm}
      stores={stores}
    >
    {dataError && (
      <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        <span>Live backend data could not be loaded: {dataError}</span>
        <button
          type="button"
          onClick={() => void loadData()}
          className="ml-3 font-bold underline"
        >
          Retry
        </button>
      </div>
    )}
    {isLoading && (
      <div role="status" className="mb-5 text-sm text-slate-500">
        Loading backend data…
      </div>
    )}
      {/* TAB: DASHBOARD (OVERVIEW) */}
      {activeTab === 'dashboard' && !isLoading && !dataError && (
        <div className="space-y-6">
          {/* 5 High-Contrast Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Card 1: Total Available Units */}
            <MetricCard
              label="TOTAL AVAILABLE UNITS"
              value={batches.reduce((total, batch) => total + batch.availableQty, 0).toLocaleString()}
              subLabel={`${dashboardSummary?.totalStores ?? '—'} backend stores`}
              variant="primary"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              }
            />

            {/* Card 2: Backend spoilage alerts */}
            <MetricCard
              label="BACKEND SPOILAGE ALERTS"
              value={dashboardSummary?.spoilageAlerts.toLocaleString() ?? '—'}
              subLabel="From dashboard summary API"
              deltaType="negative"
              icon={
                <svg className="w-5 h-5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />

            {/* Card 3: Est. At-Risk Spoilage */}
            <MetricCard
              label="WASTE (UNITS)"
              value={dashboardSummary?.projectedWaste.toLocaleString() ?? '—'}
              subLabel="Units from dashboard summary API"
              icon={
                <svg className="w-5 h-5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              }
            />

            {/* Card 4: Predicted Stockouts */}
            <MetricCard
              label="LOW-STOCK BATCH RATE"
              value={dashboardSummary ? `${dashboardSummary.stockoutRisk}%` : '—'}
              subLabel="Batches with quantity ≤ 5"
              deltaType="negative"
              icon={
                <svg className="w-5 h-5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              }
            />

            {/* Card 5: Pending Actions */}
            <MetricCard
              label="PENDING ACTIONS"
              value={`${pendingRecommendations.length} Actions`}
              deltaText="Human-in-Loop"
              subLabel="Awaiting Review"
              icon={
                <svg className="w-5 h-5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              }
            />
          </div>

          {/* Quick-Launch Application Suite */}
          <div className="bg-white rounded-3xl p-4 border border-emerald-900/10 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3 px-1">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  INTELLIGENCE PLATFORM SUITE
                </span>
                <span className="text-xs font-bold text-slate-800">
                  Specialized Autonomous Perishable Management Applications
                </span>
              </div>
              <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                4 Active Engines
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                onClick={() => setActiveTab('markdown')}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/80 hover:border-emerald-300 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100/60 px-1.5 py-0.2 rounded">
                    PRICEDECAY
                  </span>
                  <span className="text-slate-400 group-hover:text-emerald-700">→</span>
                </div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-950">
                  Markdown Optimizer
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Elasticity & ESL Tag Dispatcher
                </div>
              </button>

              <button
                onClick={() => setActiveTab('transfers')}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/80 hover:border-emerald-300 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold text-slate-800 bg-slate-200/70 px-1.5 py-0.2 rounded">
                    STORERELAY
                  </span>
                  <span className="text-slate-400 group-hover:text-emerald-700">→</span>
                </div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-950">
                  Grid Transfers
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Reefer Shuttle Rebalancing
                </div>
              </button>

              <button
                onClick={() => setActiveTab('replenishment')}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/80 hover:border-emerald-300 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100/60 px-1.5 py-0.2 rounded">
                    RESTOCKAI
                  </span>
                  <span className="text-slate-400 group-hover:text-emerald-700">→</span>
                </div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-950">
                  Procurement Builder
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Lead Time & Vendor EDI
                </div>
              </button>

              <button
                onClick={() => setActiveTab('decaylab')}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/80 hover:border-emerald-300 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold text-[#062314] bg-emerald-200/80 px-1.5 py-0.2 rounded">
                    BIODECAY
                  </span>
                  <span className="text-slate-400 group-hover:text-emerald-700">→</span>
                </div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-950">
                  Shelf-Life Kinetics Lab
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Thermal Excursion Testing
                </div>
              </button>
            </div>
          </div>

          <div role="note" className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
            Historical sales charts and category-level spoilage breakdowns are not exposed by the current backend API.
          </div>

          {/* Action Review Center (Human-in-the-Loop) */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">
                    Action Review Center (Human-in-the-Loop)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Review, modify, or reject algorithmic proposals before automated dispatch to store inventory
                  </p>
                </div>
              </div>

              {/* Compliance Banner Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-xs font-semibold text-emerald-900">
                <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Mandatory compliance notes required for modifications and rejections.</span>
              </div>
            </div>

            {/* 3 Action Cards matching Image 1.png */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {pendingRecommendations.slice(0, 3).map((rec) => (
                <RecommendationCard
                  key={rec.id}
                  recommendation={rec}
                  onApprove={handleOpenApprove}
                  onModify={handleOpenModify}
                  onReject={handleOpenReject}
                />
              ))}
              {pendingRecommendations.length === 0 && (
                <p className="col-span-full rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
                  No pending backend recommendations for this store.
                </p>
              )}
            </div>
          </div>

          {/* Relational Batch-Level Inventory Section */}
          <InventoryTable
            batches={batches}
            limit={5}
            initialSearch={globalSearchTerm}
            onSelectBatch={() => {}}
          />
        </div>
      )}

      {/* TAB: BATCH INVENTORY */}
      {activeTab === 'inventory' && !isLoading && !dataError && (
        <div className="space-y-6">
          <InventoryTable batches={batches} initialSearch={globalSearchTerm} />
        </div>
      )}

      {/* TAB: RECOMMENDATIONS (FULL REVIEW CENTER) */}
      {activeTab === 'recommendations' && !isLoading && !dataError && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
              ✓
            </div>
            <div className="text-xs text-slate-700">
              <span className="font-bold text-emerald-950">Supply Chain Agent Governance:</span>{' '}
              All actions are staged in <span className="font-mono font-bold text-slate-800">PROPOSED</span> state. Store Managers and Supply Chain Planners validate shelf constraints, markdown elasticity, and physical transit windows. Every decision is immutable and logged in the system audit trail.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recommendations.map((rec) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                onApprove={handleOpenApprove}
                onModify={handleOpenModify}
                onReject={handleOpenReject}
              />
            ))}
            {recommendations.length === 0 && (
              <p className="col-span-full rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
                No backend recommendations are available for this store.
              </p>
            )}
          </div>
        </div>
      )}

      {/* TAB: DEMAND FORECAST */}
      {activeTab === 'forecasts' && <ForecastView />}

      {/* TAB: EXPIRY ALERTS */}
      {activeTab === 'alerts' && (
        <AlertsView
          onNavigateToRecommendation={() => {
            setActiveTab('recommendations');
          }}
        />
      )}

      {/* TAB: PRICEDECAY OPTIMIZER (MARKDOWN & ESL) */}
      {activeTab === 'markdown' && <MarkdownOptimizerApp />}

      {/* TAB: RESTOCKAI (AUTONOMOUS REPLENISHMENT) */}
      {activeTab === 'replenishment' && <ReplenishmentApp />}

      {/* TAB: BIODECAY STUDIO (SHELF-LIFE KINETICS LAB) */}
      {activeTab === 'decaylab' && <DecayLabApp />}

      {/* TAB: STORE TRANSFERS */}
      {activeTab === 'transfers' && (
        <div role="status" className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          Inter-store transfer recommendations and dispatch are not implemented by the current backend. No simulated transfer routes are shown here.
        </div>
      )}

      {/* TAB: IMPACT & EVALUATION */}
      {activeTab === 'evaluation' && <EvaluationView />}

      {/* Interactive Decision Modal (Approve / Modify / Reject) */}
      <DecisionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        recommendation={activeRecForModal}
        mode={modalMode}
        onConfirmApprove={handleConfirmApprove}
        onConfirmModify={handleConfirmModify}
        onConfirmReject={handleConfirmReject}
      />
    </AppShell>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
