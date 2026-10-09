from fastapi import FastAPI
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
