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


def test_versioned_forecast_uses_a_historical_mean_baseline():
    response = client.post(
        '/api/v1/ml/forecast',
        json={
            'storeId': 'STORE-01',
            'productId': 'SKU-001',
            'horizonDays': 2,
            'historicalSales': [
                {'date': '2026-10-01', 'quantity': 4},
                {'date': '2026-10-02', 'quantity': 8},
            ],
        },
    )

    assert response.status_code == 200
    assert response.json()['predictedDemand'] == 12
    assert response.json()['baselineDemand'] == 12
    assert response.json()['confidenceLower'] is None
    assert response.json()['confidenceUpper'] is None
    assert response.json()['modelName'] == 'HistoricalSalesMeanBaseline'


def test_versioned_forecast_requires_historical_sales():
    response = client.post(
        '/api/v1/ml/forecast',
        json={
            'storeId': 'STORE-01',
            'productId': 'SKU-001',
            'horizonDays': 7,
            'historicalSales': [],
        },
    )

    assert response.status_code == 422


def test_versioned_spoilage_risk_rejects_invalid_expiry_date():
    response = client.post(
        '/api/v1/ml/spoilage-risk',
        json={
            'batchId': 'BATCH-01',
            'quantity': 10,
            'expiryDate': 'not-a-date',
            'projectedDailyDemand': 2,
        },
    )

    assert response.status_code == 422


def test_candidates_endpoint_leaves_action_generation_to_express():
    response = client.post('/api/v1/ml/candidates', json={})

    assert response.status_code == 200
    assert response.json() == []
