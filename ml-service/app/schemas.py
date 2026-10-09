from pydantic import BaseModel, ConfigDict, Field
from typing import Literal


class ForecastRequest(BaseModel):
    store_id: str = Field(..., description='Store identifier')
    product_id: str = Field(..., description='Product identifier')
    horizon_days: int = Field(..., ge=1, le=30)
    features: dict


class ForecastResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    store_id: str
    product_id: str
    forecast_qty: float
    confidence: float
    horizon_days: int
    model_name: str = 'mock-demand-model'


class SpoilageRequest(BaseModel):
    batch_id: str
    inventory_qty: int = Field(..., ge=0)
    days_to_expiry: int = Field(..., ge=0)
    product_id: str
    store_id: str


class SpoilageResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    batch_id: str
    risk_score: float
    risk_level: Literal['low', 'medium', 'high']
    days_to_expiry: int
    model_name: str = 'mock-spoilage-model'
