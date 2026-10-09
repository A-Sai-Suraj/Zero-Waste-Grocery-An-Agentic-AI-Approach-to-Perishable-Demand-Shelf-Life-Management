from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import ForecastRequest, ForecastResponse, SpoilageRequest, SpoilageResponse
from app.core.mock_models import generate_forecast, generate_spoilage_risk

app = FastAPI(title='ZeroWaste ML Service', version='0.1.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.get('/health')
def health() -> dict:
    return {
        'status': 'ok',
        'service': 'zerowaste-ml-service',
        'model_mode': 'mock',
    }


@app.post('/api/forecast/demand', response_model=ForecastResponse)
def forecast_demand(payload: ForecastRequest) -> ForecastResponse:
    result = generate_forecast(payload.store_id, payload.product_id, payload.horizon_days)
    return ForecastResponse(**result)


@app.post('/api/spoilage/risk', response_model=SpoilageResponse)
def spoilage_risk(payload: SpoilageRequest) -> SpoilageResponse:
    result = generate_spoilage_risk(payload.batch_id, payload.inventory_qty, payload.days_to_expiry)
    return SpoilageResponse(**result)


# --- Full ZeroWaste AI API Contract Endpoints for Person 2 Integration ---

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone

class HistoricalSaleItem(BaseModel):
    date: str
    quantity: float = Field(ge=0)

class V1ForecastRequest(BaseModel):
    storeId: str
    productId: str
    horizonDays: int = Field(default=7, ge=1, le=30)
    historicalSales: List[HistoricalSaleItem] = Field(default_factory=list)

class V1ForecastResponse(BaseModel):
    predictedDemand: float
    baselineDemand: float
    confidenceLower: Optional[float] = None
    confidenceUpper: Optional[float] = None
    modelName: str
    modelVersion: str

class V1SpoilageRiskRequest(BaseModel):
    batchId: str
    quantity: float = Field(ge=0)
    expiryDate: datetime
    projectedDailyDemand: float = Field(ge=0)

class V1SpoilageRiskResponse(BaseModel):
    atRiskQuantity: float
    riskScore: float
    projectedExpiryDays: int
    evidence: Dict[str, Any]
    assumptions: Dict[str, Any]
    modelVersion: str


@app.post('/api/v1/ml/forecast', response_model=V1ForecastResponse)
def v1_forecast(payload: V1ForecastRequest) -> V1ForecastResponse:
    if not payload.historicalSales:
        raise HTTPException(
            status_code=422,
            detail='historicalSales is required to calculate a demand baseline.',
        )

    total = sum(s.quantity for s in payload.historicalSales)
    avg_daily = total / len(payload.historicalSales)
    baseline = round(avg_daily * payload.horizonDays, 2)

    return V1ForecastResponse(
        predictedDemand=baseline,
        baselineDemand=baseline,
        modelName="HistoricalSalesMeanBaseline",
        modelVersion="historical-mean-v1",
    )


@app.post('/api/v1/ml/spoilage-risk', response_model=V1SpoilageRiskResponse)
def v1_spoilage_risk(payload: V1SpoilageRiskRequest) -> V1SpoilageRiskResponse:
    expiry = payload.expiryDate
    if expiry.tzinfo is None:
        expiry = expiry.replace(tzinfo=timezone.utc)
    days_left = max(
        0,
        (expiry.astimezone(timezone.utc) - datetime.now(timezone.utc)).days,
    )

    expected_sell_through = days_left * payload.projectedDailyDemand
    at_risk = max(0.0, round(payload.quantity - expected_sell_through, 2))

    if days_left <= 0:
        score = 1.0
    elif at_risk <= 0:
        score = 0.05
    else:
        score = min(1.0, round(at_risk / max(1.0, payload.quantity), 2))

    return V1SpoilageRiskResponse(
        atRiskQuantity=at_risk,
        riskScore=score,
        projectedExpiryDays=days_left,
        evidence={
            "currentBatchStock": payload.quantity,
            "projectedExpiryDays": days_left,
            "projectedSalesVelocity": payload.projectedDailyDemand,
            "expectedSellThrough": round(expected_sell_through, 2),
            "calculatedAtRisk": at_risk
        },
        assumptions={
            "sellThroughAssumption": "Uniform daily demand until the expiry date",
            "modelMode": "deterministic rule-based estimate"
        },
        modelVersion="sell-through-rule-v1"
    )


class V1CandidatesRequest(BaseModel):
    storeId: Optional[str] = None
    scenarioId: Optional[str] = None
    inventoryState: Any = None


@app.post('/api/v1/ml/candidates')
def v1_candidates(payload: V1CandidatesRequest) -> list:
    # Candidate generation is handled by rule-based orchestrator in Express.
    # ML service returns an empty list; Express merges with its own rule output.
    return []
