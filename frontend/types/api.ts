// ─── Dashboard ───────────────────────────────────────────────────────────────
export type DashboardOverview = {
  activeStores: number;
  trackedProducts: number;
  totalInventoryUnits: number;
  totalInventoryValuation: number;
  currency: string;
};

export type DashboardAlerts = {
  nearExpiryBatchesCount: number;
  expiredBatchesCount: number;
  pendingRecommendationsCount: number;
};

export type DashboardWasteTracking = {
  period: string;
  totalUnitsWasted: number;
  totalLossValue: number;
};

export type DashboardProposal = {
  id: string;
  recommendationNumber: string;
  actionType: 'MARKDOWN' | 'TRANSFER' | 'REPLENISHMENT' | 'NO_ACTION';
  status: string;
  product: { sku: string; name: string };
  store: { code: string; name: string };
  proposedQuantity: number | null;
  proposedPrice: number | null;
  rationale: string;
  createdAt: string;
};

export type DashboardSummary = {
  overview: DashboardOverview;
  alerts: DashboardAlerts;
  wasteTracking: DashboardWasteTracking;
  recentProposals: DashboardProposal[];
};

// ─── Inventory ───────────────────────────────────────────────────────────────
export type InventoryBatch = {
  id: string;
  batchNumber: string;
  store: { id: string; code: string; name: string; city: string };
  product: {
    id: string;
    sku: string;
    name: string;
    category: string;
    unitOfMeasure: string;
    basePrice: number;
  };
  quantity: number;
  initialQuantity: number;
  unitCost: number;
  receivedDate: string;
  expiryDate: string;
  daysUntilExpiry: number;
  isExpired: boolean;
  status: string;
  source: string;
  createdAt: string;
};

export type InventoryResponse = {
  batches: InventoryBatch[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
};

export type SpoilageRiskEstimate = {
  id: string;
  batchId: string;
  batchNumber: string;
  store: { code: string; name: string };
  product: { sku: string; name: string };
  availableQuantity: number;
  atRiskQuantity: number;
  riskScore: number;
  projectedExpiryDays: number;
  evidence: Record<string, unknown>;
  assumptions: Record<string, unknown>;
  modelVersion: string;
  evaluatedAt: string;
};

// ─── Recommendations ─────────────────────────────────────────────────────────
export type RecommendationDecision = {
  id: string;
  decision: 'APPROVED' | 'MODIFIED' | 'REJECTED';
  actorId: string;
  actorName: string;
  actorRole: string;
  decisionNote: string | null;
  modifiedQuantity: number | null;
  decidedAt: string;
};

export type Recommendation = {
  id: string;
  recommendationNumber: string;
  actionType: 'MARKDOWN' | 'TRANSFER' | 'REPLENISHMENT' | 'NO_ACTION';
  status: 'PROPOSED' | 'APPROVED' | 'MODIFIED' | 'REJECTED' | 'EXECUTION_PENDING' | 'EXECUTED' | 'EXECUTION_FAILED';
  product: { id: string; sku: string; name: string; category: string; basePrice: number };
  store: { id: string; code: string; name: string; city: string };
  donorStore: { id: string; code: string; name: string } | null;
  recipientStore: { id: string; code: string; name: string } | null;
  batch: { id: string; batchNumber: string; quantity: number; expiryDate: string } | null;
  proposedQuantity: number | null;
  proposedPrice: number | null;
  proposedDiscountPercent: number | null;
  proposedTiming?: string;
  rationale: string;
  evidence: Record<string, unknown>;
  assumptions: Record<string, unknown>;
  constraintsChecked?: Record<string, unknown>;
  confidenceScore: number | null;
  modelVersion: string;
  scenarioId?: string | null;
  createdAt: string;
  decisions: RecommendationDecision[];
};

export type RecommendationsResponse = {
  data: Recommendation[];
  count: number;
};

export type RecommendationGenerationResult = {
  message: string;
  count: number;
  recommendations: Array<{
    id: string;
    recommendationNumber: string;
    storeId: string;
    productId: string;
    batchId: string | null;
    actionType: Recommendation['actionType'];
    status: Recommendation['status'];
    proposedQuantity: number | null;
    proposedPrice: number | null;
    proposedDiscountPercent: number | null;
    donorStoreId: string | null;
    recipientStoreId: string | null;
    rationale: string;
    confidenceScore: number | null;
    modelVersion: string;
    scenarioId: string | null;
    createdAt: string;
  }>;
};

export type RecommendationDecisionInput = {
  decision: 'APPROVED' | 'MODIFIED' | 'REJECTED';
  decisionNote?: string;
  modifiedQuantity?: number;
  modifiedPrice?: number;
  modifiedDiscountPercent?: number;
};

export type RecommendationDecisionResult = {
  recommendationId: string;
  recommendationNumber: string;
  newStatus: Recommendation['status'];
  decisionRecord: {
    id: string;
    decision: RecommendationDecision['decision'];
    decidedAt: string;
    actor: string;
  };
};

export type RecommendationExecutionResult = {
  isIdempotentReplay: boolean;
  executionId: string;
  status: 'SUCCESS' | 'FAILED';
  summary: string;
  executedAt: string;
  message?: string;
};

// ─── Forecasts ────────────────────────────────────────────────────────────────
export type ForecastRecord = {
  id: string;
  store: { code: string; name: string };
  product: { sku: string; name: string };
  forecastDate: string;
  horizonDays: number;
  predictedDemand: number;
  baselineDemand?: number | null;
  confidenceLower?: number | null;
  confidenceUpper?: number | null;
  modelName: string;
  modelVersion?: string;
  source?: string;
  generatedAt: string;
};

export type ForecastsResponse = {
  data: ForecastRecord[];
};

export type ForecastGenerationResult = {
  forecastId: string;
  store: { id: string; code: string; name: string };
  product: { id: string; sku: string; name: string };
  horizonDays: number;
  predictedDemand: number;
  baselineDemand?: number;
  confidenceInterval: {
    lower?: number;
    upper?: number;
  };
  modelInfo: {
    name: string;
    version: string;
    isMlOnline: boolean;
    mlFallbackReason: string | null;
    historicalDataPoints: number;
    warning: string | null;
  };
  generatedAt: string;
};

// ─── Legacy aliases so unchanged pages compile ────────────────────────────────
/** @deprecated Use DashboardSummary instead */
export type InventoryItem = InventoryBatch;
