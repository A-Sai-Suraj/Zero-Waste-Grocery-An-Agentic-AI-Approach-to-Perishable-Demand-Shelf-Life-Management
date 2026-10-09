# ZeroWaste AI Backend API Contract

## Runtime configuration

- Backend base URL: `http://localhost:4000/api/v1`
- PostgreSQL: `DATABASE_URL`
- FastAPI base URL: `ML_SERVICE_URL` or `FASTAPI_BASE_URL` (defaults to `http://localhost:8000`)
- Demo fixtures are enabled only with `DEMO_MODE=true` outside production. Without a database or demo mode, data routes return a service error rather than fake persisted results.

## Read endpoints

- `GET /health`: checks database connectivity; returns HTTP 503 when a configured database is unavailable or missing. Demo mode reports `status: demo` and `databaseConnected: false`.
- `GET /stores?page=1&limit=20`: paginated stores from PostgreSQL.
- `GET /products?page=1&limit=20`: paginated products from PostgreSQL.
- `GET /inventory?storeId=&productId=&status=&page=1&limit=20`: paginated inventory batches with product names.
- `GET /inventory/:batchId`: one batch or HTTP 404.
- `GET /alerts`: expiring inventory batches within seven days. The result is a backend expiry calculation, not an ML prediction.
- `GET /spoilage`: persisted latest model risk for each batch.
- `GET /forecasts?page=1&limit=20`: persisted demand forecasts.
- `GET /dashboard/summary?storeId=`: aggregates stores, batches, waste and recent sales from PostgreSQL.
- `GET /recommendations`: latest 200 recommendations and planner decision history.
- `GET /recommendations/:id`: one recommendation or HTTP 404.
- `GET /audit-logs?page=1&limit=20`: persisted audit rows.

## Ingestion

Successful ingestion writes the primary record and audit row in one database transaction. Foreign keys are enforced by PostgreSQL. An optional `idempotencyKey` is stored as a unique source identifier; retrying with the same key returns the existing record (`accepted: 0`, `rejected: 0`, `duplicate: true`, HTTP 200). Requests without a key are treated as separate source events. A new record returns `accepted: 1`, `rejected: 0`, `duplicate: false`, and its record in `data`.

### `POST /ingestion/inventory`

```json
{
  "idempotencyKey": "supplier-a:batch:1042",
  "batchId": "optional-batch-id",
  "storeId": "store-id",
  "productId": "product-id",
  "quantity": 12,
  "expiryDate": "2026-10-20",
  "status": "warning"
}
```

`batchId`, `idempotencyKey`, and `status` are optional. The alternate `POST /inventory/ingest` route has the same input and response contract.

### `POST /ingestion/sales`

```json
{
  "idempotencyKey": "pos-a:transaction:1042",
  "storeId": "store-id",
  "productId": "product-id",
  "quantity": 2,
  "revenue": 7.5,
  "soldAt": "2026-10-09T12:00:00Z"
}
```

### `POST /ingestion/receipts`

```json
{
  "idempotencyKey": "supplier-a:receipt:1042",
  "storeId": "store-id",
  "supplierName": "Supplier",
  "orderDate": "2026-10-09T12:00:00Z",
  "deliveredAt": "2026-10-09T13:00:00Z",
  "totalCost": 80,
  "lines": [
    { "productId": "product-id", "batchId": "optional-existing-batch-id", "quantity": 10, "unitCost": 8 }
  ]
}
```

Receipt and all lines are committed transactionally. A provided batch must match the specified store and product.

### `POST /ingestion/promotions`

Requires `storeId`, `name`, `discountPct` (0–100), and `startsAt`; accepts optional `productId`, `idempotencyKey`, and `endsAt`.

### `POST /ingestion/waste`

Requires `storeId`, `productId`, positive integer `quantity`, `reason`, and `recordedAt`; accepts optional `batchId` and `idempotencyKey`. A provided batch must match both store and product.

## Recommendations and planner workflow

- `POST /recommendations/generate`: creates a draft recommendation, initial action, revision, `CREATED` decision, and audit row transactionally.
- `PATCH /recommendations/:id/modify`: draft-only modification; writes a separate immutable revision and a `MODIFIED` decision.
- `PATCH /recommendations/:id/approve`: requires `{ "approved": true }`; writes decision and audit rows.
- `PATCH /recommendations/:id/reject`: requires `{ "approved": false }`; writes decision and audit rows.
- `POST /recommendations/:id/execute`: simulated only; conditional status transition and unique execution record make successful execution idempotent. It does not send an order or modify retailer inventory.

All write routes (ingestion, planner mutations, and ML prediction persistence) are allowed for local development but return HTTP 503 in production until an identity provider and authorization contract are integrated. Actor values are server-assigned labels, not proof of identity; do not expose write routes to untrusted non-production clients.

## CORS and environment

- `CORS_ORIGINS` is a comma-separated list of allowed origins. Development defaults to `http://localhost:3000` and `http://127.0.0.1:3000`; production requires explicitly configured HTTPS origins.
- Credentials are enabled only for allow-listed origins. Wildcards, origin paths, and non-HTTPS production origins are rejected at startup.
- `DATABASE_URL`, `DATABASE_ENV`, `DATABASE_TARGET_CONFIRMATION`, `NODE_ENV`, and `DEMO_MODE` control database/demo operation. `ML_SERVICE_URL` or `FASTAPI_BASE_URL` configures FastAPI.
- Production cannot enable demo fixtures.

## FastAPI integration

- `POST /forecasts/generate` accepts `{ "storeId": "...", "productId": "...", "horizonDays": 1 }`. Backend loads trailing 30-day sales features, calls FastAPI `POST /api/forecast/demand`, validates the documented snake_case response, then persists the forecast and audit entry.
- `POST /spoilage/predict` accepts `{ "batchId": "..." }`. Backend loads the batch and related product/store, calls FastAPI `POST /api/spoilage/risk`, validates the response, then persists risk and audit data.
- Upstream timeouts return HTTP 504; unavailable service returns 503; upstream HTTP or response-contract errors return 502. The Node client timeout is five seconds.

## Error responses and persistence limits

- Invalid body/query: HTTP 400
- Unknown record: HTTP 404
- Conflicting unique/idempotency key or invalid planner state: HTTP 409
- Missing database config, unreachable database or unavailable FastAPI: HTTP 503 (FastAPI timeouts: 504)
- Server error: HTTP 500 with no internal connection details

## Frontend integration notes (Person 1)

The frontend should set `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1`; its current example omits `/v1`.

There are also response-shape mismatches to coordinate before disabling frontend mock mode:

- `GET /inventory` returns `{ "data": InventoryItem[], "pagination": { "page": 1, "limit": 20, "total": 0 } }`; the frontend client/types currently expect `InventoryItem[]` directly.
- `GET /recommendations` returns `RecommendationRecord[]` with `actionType`, `reason`, and `evidence`; the frontend currently expects `Recommendation[]` with `type` and `suggestedAction`. The frontend should map the backend contract or coordinate a deliberate API contract change.
- Dashboard summary and the recommendation status values overlap with the frontend types, but the API client currently falls back to fixtures on failed requests. A successful UI render alone does not confirm that live API responses are being consumed.

Person 1's frontend files have not been modified.

Production API results are PostgreSQL-backed. Demo fixtures are for explicit local demo/test mode only and are neither durable nor suitable for verifying persistence.
