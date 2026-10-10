# ZeroWaste AI Architecture and Data Flow

## 1. Current prototype architecture

The diagram below describes the checked-in implementation, not a production deployment.

```mermaid
flowchart LR
    U[User] --> FE[Next.js frontend]
    FE -->|Requests under /api/v1| API[Express API under /api]
    API -->|Current routes| SAMPLE[Sample dashboard, inventory, and recommendation services]
    SAMPLE -->|Recommendation state is in process memory| API
    FE -.->|Path and contract mismatch; not all requests are served| API
    ML[FastAPI service] --> LEGACY[Deterministic mock forecast and risk endpoints]
    ML --> BASELINE[Versioned historical-mean forecast and rule-based risk endpoints]
    API -.->|No complete integration in this checkout| ML
    DB[(PostgreSQL schema)] -.->|Schema only; no migrations or current persistence| API
```

The frontend API client targets `/api/v1`, while the Express app currently mounts its routes under `/api`. The frontend therefore cannot use all of its current pages and actions against this Express route set. Backend sample services do not persist their responses to PostgreSQL, and recommendation state is lost when the process restarts.

The standalone FastAPI service provides deterministic legacy mock endpoints and versioned endpoints that identify their baseline/rule-based behavior. These are not trained or validated predictive models. The current Express services do not provide a complete integration with this service.

## 2. Implemented request paths

```mermaid
sequenceDiagram
    participant UI as Next.js page
    participant Client as frontend/lib/api-client.ts
    participant Express as Express app
    participant Routes as backend/src/routes/index.ts

    UI->>Client: Request dashboard, inventory, forecast, or planner data
    Client->>Express: Request under configured /api/v1 base URL
    Express->>Routes: Route registration under /api
    Routes-->>Express: 404 for frontend paths not implemented by this route set
    Express-->>Client: Error response
    Client-->>UI: Surface request error
```

The frontend reports failed requests rather than substituting a successful-looking hard-coded API response.

## 3. Intended data and decision flow

The following is the target architecture. Its database persistence, complete service integration, model validation, and controlled execution are not implemented end to end in this checkout.

```mermaid
flowchart LR
    SALES[Sales history] --> FEED[Data ingestion]
    INV[Inventory batches] --> FEED
    WEATHER[Weather and events] --> FEED
    FEED --> ML[Forecast and spoilage estimation]
    ML --> CAND[Candidate actions]
    CAND --> VALIDATE[Business constraint validation]
    VALIDATE --> REVIEW[Manager review]
    REVIEW -->|Approved action| EXEC[Controlled execution]
    EXEC --> AUDIT[Persistent audit record]
    DB[(PostgreSQL)] -.-> FEED
    DB -.-> AUDIT
```

Recommendation generation should remain separate from inventory changes. A production workflow must validate actions, require appropriate authorization, prevent invalid inventory quantities, persist decisions, and record execution in an audit trail.

## 4. Database model

`backend/prisma/schema.prisma` describes the intended relational model for users, stores, products, inventory batches, sales, forecasts, spoilage estimates, recommendations, approvals, and audit records. It is a schema blueprint only at present: this checkout has no migration history or seed script, and the current sample services do not use it for persistence. See [database-schema.md](./database-schema.md).

## 5. Service boundaries

- `frontend/`: Next.js user interface and typed API client.
- `backend/`: Express routes and sample domain services, mounted under `/api`.
- `ml-service/`: FastAPI contracts for mock, baseline, and rule-based estimates.
- `backend/prisma/schema.prisma`: intended PostgreSQL data model; not proof of live persistence.

See [INTEGRATION_MAP.md](../INTEGRATION_MAP.md) for the actual route catalog and documented integration gaps.
