# ZeroWaste AI Architecture and Data Flow

## 1. Overall system architecture

```mermaid
flowchart LR
    U[User / Manager / Admin] --> FE[frontend/app]
    FE --> API[backend/src/routes]
    API --> CTRL[backend/src/controllers]
    CTRL --> SRV[backend/src/services]
    SRV --> REPO[backend/src/repositories]
    REPO --> PG[(PostgreSQL / Neon)]
    SRV --> ML[ml-service/app/main.py]
    ML --> PRED[Forecast + Spoilage model logic]
    SRV --> ORCH[Agent orchestrator]
    ORCH --> VALID[Business constraint validator]
    VALID --> REC[Recommendation persistence]
    REC --> APPR[Manager approval flow]
    APPR --> AUDIT[Audit log]
```

## 2. Frontend-to-backend request flow

```mermaid
sequenceDiagram
    participant UI as frontend/app/page.tsx
    participant APIClient as frontend/lib/api-client.ts
    participant Route as backend/src/routes/dashboard.ts
    participant Controller as backend/src/controllers/dashboard.controller.ts
    participant Service as backend/src/services/dashboard.service.ts
    participant DB as PostgreSQL

    UI->>APIClient: getDashboardMetrics()
    APIClient->>Route: GET /api/dashboard/summary
    Route->>Controller: controller.fetchSummary()
    Controller->>Service: buildSummaryDTO()
    Service->>DB: query stores, inventory, sales, forecasts
    DB-->>Service: aggregated summary
    Service-->>Controller: summary payload
    Controller-->>APIClient: JSON response
    APIClient-->>UI: typed dashboard data
```

## 3. Backend-to-database mapping

```mermaid
flowchart TD
    SVC[backend/src/services] --> REPO[backend/src/repositories]
    REPO --> USERS[users]
    REPO --> STORES[stores]
    REPO --> PROD[products]
    REPO --> INV[inventory_batches]
    REPO --> SALES[sales_history]
    REPO --> PROM[promotions]
    REPO --> FCAST[demand_forecasts]
    REPO --> RISK[spoilage_risk_predictions]
    REPO --> REC[recommendations]
    REPO --> APPROVAL[manager_approvals]
    REPO --> AUDIT[audit_logs]
```

## 4. Backend-to-Python ML communication

```mermaid
sequenceDiagram
    participant BE as backend/src/services
    participant HTTP as axios / HTTP client
    participant ML as ml-service/app/main.py
    participant MODEL as ml-service/app/core

    BE->>HTTP: POST /api/forecast/demand
    HTTP->>ML: demand features JSON
    ML->>MODEL: generate forecast score
    MODEL-->>ML: mock forecast response
    ML-->>HTTP: prediction JSON
    HTTP-->>BE: forecast DTO

    BE->>HTTP: POST /api/spoilage/risk
    HTTP->>ML: batch + history features
    ML->>MODEL: compute spoilage risk
    MODEL-->>ML: risk result
    ML-->>HTTP: spoiled-item JSON
    HTTP-->>BE: spoilage DTO
```

## 5. Agent orchestration workflow

```mermaid
flowchart TD
    INGEST[Data ingestion] --> FCAST[Demand Forecasting Agent]
    INGEST --> SPOIL[Freshness and Spoilage Agent]
    FCAST --> CAND[Candidate actions]
    SPOIL --> CAND
    CAND --> ORCH[Coordinator / Orchestrator]
    ORCH --> OPT[Optimization step]
    OPT --> VALID[Business Constraint Validator]
    VALID --> REC[Recommendation persistence]
    REC --> REVIEW[Manager review]
    REVIEW --> APPROVE[Approval]
    APPROVE --> EXEC[Controlled execution]
    EXEC --> AUDIT[Audit log]
```

## 6. Recommendation approval and execution flow

```mermaid
sequenceDiagram
    participant Agent as Recommendation Agent
    participant DB as PostgreSQL
    participant Manager as Store Manager / Admin
    participant Exec as Controlled execution
    participant Audit as Audit log

    Agent->>DB: create recommendations + items
    DB-->>Manager: send review queue
    Manager->>DB: approve or reject
    DB-->>Exec: approved action payload
    Exec->>DB: write executed change records
    Exec->>Audit: log action and timestamp
```

## 7. Complete data lifecycle

```mermaid
flowchart LR
    SALES[Sales history] --> FEED[Data ingestion]
    INV[Inventory batches] --> FEED
    WEATHER[Weather / events] --> FEED
    FEED --> ML[Forecast and spoilage predictors]
    ML --> ACTIONS[Candidate actions]
    ACTIONS --> ORCH[Coordinator]
    ORCH --> VALIDATE[Business validation]
    VALIDATE --> RECOMMENDATIONS[Persisted recommendations]
    RECOMMENDATIONS --> REVIEW[Manager approval]
    REVIEW --> EXECUTION[Controlled execution]
    EXECUTION --> LOGS[Audit log and evaluation]
    LOGS --> REPORTS[Dashboards and reports]
```

## 8. Cross-service module names

These names are used consistently in the code and docs:

- `dashboard.service.ts`
- `inventory.service.ts`
- `forecast.service.ts`
- `spoilage.service.ts`
- `recommendation.service.ts`
- `constraint.service.ts`
- `approval.service.ts`
- `api-client.ts`
- `main.py`
- `schema.prisma`
