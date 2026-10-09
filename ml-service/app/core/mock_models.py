def generate_forecast(store_id: str, product_id: str, horizon_days: int) -> dict:
    base_qty = 118 if product_id.endswith('1') else 96
    forecast_qty = round(base_qty * (1 + (horizon_days / 30) * 0.2), 2)
    return {
        'store_id': store_id,
        'product_id': product_id,
        'forecast_qty': forecast_qty,
        'confidence': 0.88,
        'horizon_days': horizon_days,
        'model_name': 'mock-demand-model',
    }


def generate_spoilage_risk(batch_id: str, inventory_qty: int, days_to_expiry: int) -> dict:
    risk_score = max(0.0, min(100.0, 100 - (days_to_expiry * 12) + (inventory_qty * 0.15)))
    risk_level = 'high' if risk_score >= 70 else 'medium' if risk_score >= 40 else 'low'
    return {
        'batch_id': batch_id,
        'risk_score': round(risk_score, 2),
        'risk_level': risk_level,
        'days_to_expiry': days_to_expiry,
        'model_name': 'mock-spoilage-model',
    }
