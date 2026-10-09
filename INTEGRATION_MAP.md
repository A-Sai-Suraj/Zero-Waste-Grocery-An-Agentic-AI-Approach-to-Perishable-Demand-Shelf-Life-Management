# ZeroWaste AI Integration Map

## 1. High-level module map

| Module ID | Module | Responsibility | Primary Inputs | Primary Outputs |
|---|---|---|---|---|
| MOD-001 | `frontend/app` | UI, route composition, page state | user actions, API responses | rendered screens and interactions |
| MOD-002 | `frontend/lib/api-client.ts` | typed API access and mock fallback | endpoint names, params | typed data objects |
| MOD-003 | `backend/src/routes` | HTTP route registration | request payloads | controller invocation |
| MOD-004 | `backend/src/controllers` | request validation and orchestration | validated payloads | service calls and response data |
| MOD-005 | `backend/src/services` | domain logic | business inputs | validated actions and transformation |
| MOD-006 | `backend/src/repositories` | Prisma data access | query shapes | entity records |
| MOD-007 | `backend/prisma/schema.prisma` | relational schema | DB entities | Prisma models |
| MOD-008 | `ml-service/app/main.py` | prediction and optimization endpoints | feature JSON | prediction JSON |
| MOD-009 | `ml-service/app/core` | ML and optimization logic | feature vectors | forecast / risk score |
| MOD-010 | `backend/src/validation` | Zod schemas | raw requests | validated requests |
| MOD-011 | `backend/src/types` | shared TypeScript interfaces | schema definitions | typed contracts |
| MOD-012 | `docs/architecture.md` | traceability and diagrams | modules and interfaces | visual architecture |

## 2. API catalog

| Endpoint ID | Method | URL | Auth / role | Purpose |
|---|---|---|---|---|
| API-001 | GET | `/api/dashboard/summary` | Admin / Store Manager | Returns KPI summary |
| API-002 | GET | `/api/inventory` | Admin / Store Manager | Returns inventory batches |
| API-003 | GET | `/api/inventory/expiry-alerts` | Admin / Store Manager | Finds near-expiry items |
| API-004 | GET | `/api/forecast/demand` | Admin / Store Manager | Returns demand forecast output |
| API-005 | GET | `/api/spoilage/risk` | Admin / Store Manager | Returns spoilage risk predictions |
| API-006 | POST | `/api/recommendations/generate` | Admin / Store Manager | Generate candidate actions |
| API-007 | GET | `/api/recommendations` | Admin / Store Manager | Lists recommendations |
| API-008 | PATCH | `/api/recommendations/:id/approve` | Admin | Manager approval flow |
| API-009 | PATCH | `/api/recommendations/:id/reject` | Admin | Reject proposal |
| API-010 | GET | `/api/evaluation/report` | Admin | Performance comparison |
| API-011 | GET | `/api/health` | Public | Health-check |
| API-012 | POST | `/api/forecast/demand` | ML service internal | Forecast ingestion |
| API-013 | POST | `/api/spoilage/risk` | ML service internal | Spoilage scoring |

## 3. Frontend-to-backend integration map

| Source | Destination | Data sent | Purpose | Implementation |
|---|---|---|---|---|
| `frontend/app/dashboard/page.tsx` | `backend/src/routes/dashboard.ts` | dashboard metrics request | display KPIs | `frontend/lib/api-client.ts` -> `/api/dashboard/summary` |
| `frontend/app/inventory/page.tsx` | `backend/src/routes/inventory.ts` | inventory filters | list inventory and expiry risk | typed API client |
| `frontend/app/recommendations/page.tsx` | `backend/src/routes/recommendations.ts` | selected store and products | show recommendations | typed API client |
| `frontend/app/evaluation/page.tsx` | `backend/src/routes/evaluation.ts` | date range and store ID | show report | typed API client |
| `frontend/lib/api-client.ts` | `backend/src/controllers/*` | HTTP request + JSON body | fetch and update app data | central API client |
| `backend/src/controllers/*` | `backend/src/services/*` | validated input object | business logic | controller -> service |
| `backend/src/services/*` | `backend/src/repositories/*` | query params and DTOs | database access | Prisma repositories |
| `backend/src/repositories/*` | `backend/prisma/schema.prisma` | Prisma queries | read or write PostgreSQL | repository layer |

## 4. Backend-to-ML integration map

| Source | Destination | Data sent | Purpose | Implementation |
|---|---|---|---|---|
| `backend/src/services/forecast.service.ts` | `ml-service/app/main.py` | JSON features | demand forecast | HTTP client to `/api/forecast/demand` |
| `backend/src/services/spoilage.service.ts` | `ml-service/app/main.py` | inventory + history features | spoilage risk score | HTTP client to `/api/spoilage/risk` |
| `ml-service/app/main.py` | `backend/src/services/*` | prediction JSON | prediction response | FastAPI response schema |
| `backend/src/services/recommendation.service.ts` | `backend/src/services/constraint.service.ts` | candidate actions | rules validation | orchestrator stage |

## 5. Database mapping

| DB ID | Table | Primary Key | Key reads/writes | Notes |
|---|---|---|---|---|
| DB-001 | `users` | `id` | auth, admin, recommendations approval | role-based access |
| DB-002 | `stores` | `id` | inventory, demand, transfers | store metadata |
| DB-003 | `products` | `id` | inventory, sales, forecasts | SKU master record |
| DB-004 | `product_categories` | `id` | product grouping | category classification |
| DB-005 | `inventory_batches` | `id` | expiry tracking, stockouts | batch-level expiry, quantity |
| DB-006 | `sales_history` | `id` | demand forecasting, reports | product movement history |
| DB-007 | `suppliers` | `id` | replenishment inputs | vendor details |
| DB-008 | `delivery_records` | `id` | replenishment service | inbound shipments |
| DB-009 | `promotions` | `id` | markdown decisions | active campaign data |
| DB-010 | `weather_events` | `id` | forecast feature input | local weather context |
| DB-011 | `demand_forecasts` | `id` | reporting, recommendations | demand estimate per product/store/date |
| DB-012 | `spoilage_risk_predictions` | `id` | expiry and alerts | risk score per batch |
| DB-013 | `recommendations` | `id` | coordinator, approvals | recommendation header |
| DB-014 | `recommendation_items` | `id` | recommendation detail | per-item action |
| DB-015 | `proposed_actions` | `id` | action semantics | replenish/markdown/transfer |
| DB-016 | `manager_approvals` | `id` | approval workflow | approval and rejection records |
| DB-017 | `audit_logs` | `id` | traceability | all actions and decisions |
| DB-018 | `evaluation_results` | `id` | reports and model comparison | baseline vs current performance |

## 6. Placeholder and mocked integrations

- `ml-service` forecasting and spoilage endpoints are mocked with deterministic sample data until models are trained.
- `backend/src/services/recommendation.service.ts` contains orchestrator skeleton logic and mock action generation.
- `frontend/lib/mock-data.ts` provides fallback data for page-level exploration before backend integration is complete.
- `frontend` uses a typed API client but is designed to fall back to mock data when the backend is not running.

## 7. Required integration tests

- API health check returns 200 from backend and ML service
- Inventory list endpoint returns list of batches and metadata
- Demand forecast endpoint validates response schema
- Spoilage endpoint returns risk score for sample batch
- Recommendation generation returns valid action objects
- Approval endpoint rejects unauthorized roles
- Prisma schema validates required fields and foreign keys
