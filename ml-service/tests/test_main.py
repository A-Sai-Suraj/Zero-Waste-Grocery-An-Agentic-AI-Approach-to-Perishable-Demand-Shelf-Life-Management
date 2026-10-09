from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get('/health')
    assert response.status_code == 200
    assert response.json()['status'] == 'ok'


def test_demand_forecast_endpoint():
    payload = {
        'store_id': 'STORE-01',
        'product_id': 'SKU-001',
        'horizon_days': 14,
        'features': {'sales_index': 1.2, 'weather_index': 0.8},
    }
    response = client.post('/api/forecast/demand', json=payload)
    assert response.status_code == 200
    assert response.json()['forecast_qty'] > 0


def test_spoilage_risk_endpoint():
    payload = {
        'batch_id': 'INV-1002',
        'inventory_qty': 18,
        'days_to_expiry': 2,
        'product_id': 'SKU-002',
        'store_id': 'STORE-01',
    }
    response = client.post('/api/spoilage/risk', json=payload)
    assert response.status_code == 200
    assert response.json()['risk_level'] in {'low', 'medium', 'high'}
