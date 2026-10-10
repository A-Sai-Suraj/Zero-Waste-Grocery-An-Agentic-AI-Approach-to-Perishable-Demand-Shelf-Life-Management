export type Role = 'USER' | 'STORE_OWNER' | 'ADMIN';

export type StoreId = string;

export interface Store {
  id: StoreId;
  name: string;
  code: string;
  locationName: string;
  address?: string;
  manager?: string;
  totalBatches?: number;
}

export type Category = string;

export type BatchStatus = 'Fresh' | 'Monitor' | 'Warning' | 'Critical' | 'Expired';

export interface BatchItem {
  id: string; // e.g. B-7741
  sku: string; // e.g. SKU-DAI-902
  productName: string;
  category: Category;
  storeId: StoreId;
  storeName: string;
  availableQty: number;
  unit: string;
  receivedDate?: string;
  expiryDate: string;
  daysLeft: number;
  status: BatchStatus;
  unitCost?: number;
  retailPrice?: number;
  predictedDailyDemand?: number;
  spoilageRiskScore?: number;
  lotNumber?: string;
  storageTemp?: string;
  supplier?: string;
  ethyleneSensitive?: boolean;
}

export type RecommendationType = 'MARKDOWN' | 'INTER_STORE_TRANSFER' | 'REPLENISHMENT';

export type RecommendationStatus = 'PROPOSED' | 'APPROVED' | 'MODIFIED' | 'REJECTED' | 'EXECUTED' | 'FAILED';

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface Recommendation {
  id: string;
  type: RecommendationType;
  status: RecommendationStatus;
  targetSku: string;
  productName: string;
  storeId: StoreId;
  storeName: string;
  destinationStoreId?: StoreId;
  destinationStoreName?: string;
  proposedValue: string; // e.g. "-30% Discount" or "40 Units"
  timingWindow?: string;
  wasteUnitsPrevented?: number;
  costAvoidance?: number;
  algorithmicEvidence: string[];
  confidence: ConfidenceLevel;
  confidenceScore: number;
  proposedQty?: number;
  proposedDiscountPct?: number;
  actionNotes?: string;
  modifiedValue?: string;
  rejectionReason?: string;
  timestamp: string;
  relatedBatchId?: string;
}

export type AlertTier = 'Expired' | 'Critical' | 'At Risk' | 'Monitor' | 'No Current Risk';

export interface ExpiryAlert {
  id: string;
  batchId: string;
  sku: string;
  productName: string;
  category: Category;
  storeId: StoreId;
  storeName: string;
  unitsAtRisk: number;
  daysToExpiry: number;
  projectedDemandBeforeExpiry?: number;
  unmetSpoilageUnits?: number;
  tier: AlertTier;
  riskScore: number;
  wholesaleValueAtRisk?: number;
  modelEvidence: string;
  relatedRecommendationId?: string;
  actionTaken?: boolean;
}

export interface ForecastDataPoint {
  date: string;
  label: string;
  historicalSales: number | null;
  predictedDemand: number | null;
  lowerBound?: number;
  upperBound?: number;
  baselineMovingAvg?: number;
}

export interface ForecastModelMetadata {
  modelName: string;
  modelVersion: string;
  generationTimestamp: string;
  horizon: string;
  mae: number;
  wape: number;
  modelConfidence: number;
}

export interface TransferRoute {
  id: string;
  donorStoreId: StoreId;
  donorStoreName: string;
  recipientStoreId: StoreId;
  recipientStoreName: string;
  sku: string;
  productName: string;
  category: Category;
  surplusUnits: number;
  recipientDeficitUnits: number;
  proposedTransferQty: number;
  transitTimeMinutes: number;
  transferCost: number;
  remainingShelfLifeHours: number;
  feasibilityScore: number;
  netSavings: number;
  status: 'PENDING' | 'DISPATCHED' | 'IN_TRANSIT' | 'COMPLETED';
}

export interface ReplenishmentOrder {
  id: string;
  sku: string;
  productName: string;
  category: Category;
  targetStoreId: StoreId;
  targetStoreName: string;
  supplier: string;
  orderQty: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  estimatedDeliveryDate: string;
  leadTimeHours: number;
  safetyStockTrigger: number;
  currentStock: number;
  status: 'PROPOSED' | 'APPROVED' | 'TRANSMITTED' | 'FULFILLED';
}

export interface EvaluationMetrics {
  wasteReductionPct: number;
  stockoutPreventionPct: number;
  serviceLevelPct: number;
  baselineWape: number;
  mlModelWape: number;
  totalFinancialSaved: number;
  co2EmissionsSavedKg: number;
  totalSimulatedDays: number;
  evaluatedBatchesCount: number;
}
