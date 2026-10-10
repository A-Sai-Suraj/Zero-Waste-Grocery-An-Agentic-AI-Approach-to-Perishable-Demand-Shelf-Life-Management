# ZeroWaste AI Integration Map

This document separates routes that currently exist from frontend requests and system capabilities that remain unimplemented. The detailed architecture is in [docs/architecture.md](./docs/architecture.md).

## 1. Current service boundaries

| Service | Location | Current responsibility | Important limitation |
|---|---|---|---|
| Frontend | `frontend/` | Next.js pages and typed API client | API client defaults to `http://localhost:5000/api/v1`; this does not match the current Express route prefix. |
| Express API | `backend/` | Dashboard, inventory, and sample recommendation routes | Routes are mounted under `/api`; sample data is not read from or written to PostgreSQL. |
| FastAPI service | `ml-service/` | Health, mock, baseline, and rule-based forecast/risk endpoints | Forecast/risk outputs are not trained or validated model predictions. |
| Prisma schema | `backend/prisma/schema.prisma` | Intended PostgreSQL data model | No migration history or seed script is checked in; current sample services do not persist to it. |

## 2. Express routes currently implemented

The app mounts `backend/src/routes/index.ts` at `/api`. It also serves `GET /health` directly.

| Method | Path | Current behavior |
|---|---|---|
| `GET` | `/health` | Express process health |
| `GET` | `/api/health` | API health |
| `GET` | `/api/dashboard/summary` | Sample dashboard summary |
| `GET` | `/api/inventory` | Sample inventory |
| `GET` | `/api/inventory/expiry-alerts` | Sample expiry alerts |
| `GET` | `/api/recommendations` | Sample recommendation list |
| `POST` | `/api/recommendations/generate` | Generates a sample recommendation |
| `PATCH` | `/api/recommendations/:id/approve` | In-memory sample state transition |
| `PATCH` | `/api/recommendations/:id/reject` | In-memory sample state transition |

These routes do not establish database persistence, authorization, execution, or a durable audit trail.

## 3. FastAPI routes currently implemented

| Method | Path | Behavior |
|---|---|---|
| `GET` | `/health` | ML-service health |
| `POST` | `/api/forecast/demand` | Deterministic mock forecast |
| `POST` | `/api/spoilage/risk` | Deterministic mock spoilage estimate |
| `POST` | `/api/v1/ml/forecast` | Historical-sales mean baseline; no confidence intervals |
| `POST` | `/api/v1/ml/spoilage-risk` | Deterministic sell-through estimate under a uniform-demand assumption |
| `POST` | `/api/v1/ml/candidates` | Empty candidate list; candidate orchestration belongs in the application backend |

See `ml-service/app/main.py` and its schemas for request/response details. These endpoints should not be described as trained-model predictions.

## 4. Frontend request contract and gaps

`frontend/lib/api-client.ts` uses the `/api/v1` base URL and currently requests:

| Operation | Requested path |
|---|---|
| Dashboard | `GET /dashboard/summary` |
| Inventory batches | `GET /inventory/batches` |
| Spoilage assessment | `POST /spoilage-risk/evaluate` |
| Recommendations | `GET /recommendations` |
| Generate recommendations | `POST /recommendations/generate` |
| Decide recommendation | `POST /recommendations/:id/decision` |
| Execute recommendation | `POST /recommendations/:id/execute` |
| Forecast list | `GET /forecasts` |
| Generate forecast | `POST /forecasts/generate` |

The client combines these paths with `/api/v1`, but the current Express API exposes the route set above under `/api`. Apart from a few similar path names, the prefixes, paths, methods, and behavior do not form a compatible API contract. The missing forecast generation, risk evaluation, planner decision, and execution endpoints must be implemented and tested in Express before those UI flows can be called end to end. API errors should remain visible; do not replace them with fake success responses.

## 5. Intended data model

The Prisma schema describes the following domain areas. These are schema entities, not proof that the corresponding flows are active or database-backed.

| Domain area | Prisma models |
|---|---|
| Identity and stores | `User`, `Store` |
| Catalog and inventory | `ProductCategory`, `Product`, `InventoryBatch` |
| Demand context | `SalesHistory`, `Promotion`, `WeatherEvent`, `DemandForecast` |
| Supply | `Supplier`, `DeliveryRecord` |
| Risk and actions | `SpoilageRiskPrediction`, `Recommendation`, `RecommendationItem`, `ProposedAction` |
| Review and traceability | `ManagerApproval`, `AuditLog`, `EvaluationResult` |

For relationships, see [docs/database-schema.md](./docs/database-schema.md). For the Windows setup and safe database caveats, see [SETUP_GUIDE.md](./SETUP_GUIDE.md).

## 6. Integration work still required

- Align the Express API version and paths with the frontend client, or intentionally change the client to the supported API contract.
- Implement and test forecast generation, spoilage-risk assessment, recommendation decisions, and controlled execution before presenting those flows as live.
- Configure database access, create and review migrations, and add an idempotent seed process before claiming persistent sample data.
- Add authorization, domain constraints, transaction-safe inventory updates, idempotency, and durable audit records before enabling real execution.
- Add contract tests that exercise the actual frontend-to-Express and Express-to-ML request and response shapes.

The checklist in [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md) is a forward-looking plan; the presence of a schema, route, or UI page alone does not mean its end-to-end integration is complete.
