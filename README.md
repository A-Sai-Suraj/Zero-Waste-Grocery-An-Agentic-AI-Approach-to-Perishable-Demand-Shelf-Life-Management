# ZeroWaste AI — Architecture Template and Integration Blueprint

This repository is a runnable monorepo scaffold for a ZeroWaste AI system that tracks grocery inventory, demand forecasts, spoilage risk, replenishment, markdown, and inter-store transfer recommendations.

The scaffold intentionally separates the project into:

- Frontend: Next.js + TypeScript + Tailwind
- Backend: Node.js + Express + TypeScript + Prisma + Zod
- ML Service: Python + FastAPI + scikit-learn + XGBoost + Pandas
- Database: PostgreSQL schema definitions via Prisma

The repository has a Prisma-backed backend and FastAPI adapter. Use `DEMO_MODE=true` only for an isolated local UI/demo without PostgreSQL; production routes require the configured database.

## Monorepo structure

- `frontend/` — Next.js pages, typed API client, dashboard mock data, shared components
- `backend/` — Express API, controllers, services, Prisma schema, validation, test harness
- `ml-service/` — FastAPI service for forecasting, spoilage risk, and optimization integrations
- `docs/` — ER diagrams, architecture diagrams, integration maps, checklists

## Quick setup

### 1) Install Node dependencies

```bash
npm install
```

### 2) Install backend dependencies

```bash
npm --workspace backend install
```

### 3) Install frontend dependencies

```bash
npm --workspace frontend install
```

### 4) Start backend

```bash
npm run dev:backend
```

### 5) Start frontend

```bash
npm run dev:frontend
```

### 6) Start ML service

```bash
cd ml-service
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Environment files

Each service contains a `.env.example` file. Copy it to `.env` and set the values for your local environment.

### Backend database setup

1. Copy `backend/.env.example` to `backend/.env`.
2. Set `DATABASE_URL` to a Neon development/test connection string (include the SSL parameters provided by Neon).
3. Only after verifying the database target is not production, set `DATABASE_ENV=development`, `NODE_ENV=development`, and `DATABASE_TARGET_CONFIRMATION=I_HAVE_VERIFIED_THIS_IS_NOT_PRODUCTION`.
4. From PowerShell, run:

```powershell
npm --workspace backend run prisma:validate
npm --workspace backend run prisma:generate
npm --workspace backend run prisma:migrate
npm --workspace backend run prisma:seed
```

The migration command uses `prisma migrate deploy` and does not reset or drop data. The checked-in initial migration is intended for an empty database. If a Neon database already contains tables, do not run the initial migration blindly: first compare its schema with `backend/prisma/schema.prisma` and baseline only after confirming they match. No live database migration or seed was run as part of the code audit.

The seed uses namespaced `demo-*` records, upserts them without updating existing records, and runs in a transaction. Migration/seed scripts require explicit environment labels and the non-production confirmation value; this confirmation is an operator assertion, not automatic proof of the target identity.

### Backend integration tests

Integration tests make real database writes and clean up only records with their unique integration-test IDs. Use a disposable PostgreSQL database, set `DATABASE_ENV=test`, `NODE_ENV=test`, `DATABASE_TARGET_CONFIRMATION=I_HAVE_VERIFIED_THIS_IS_NOT_PRODUCTION`, and `ALLOW_DATABASE_INTEGRATION_TESTS=true`, then run:

```powershell
npm --workspace backend run test:integration
```

The command fails before running tests unless the database URL and all safety opt-ins are present. The operator must verify that the URL points to a disposable test database before setting them.

## Major integration IDs

- `API-001` Dashboard summary
- `API-002` Inventory list
- `API-003` Forecast demand
- `API-004` Spoilage risk prediction
- `API-005` Recommendation generation
- `API-006` Recommendation approval
- `DB-001` users
- `DB-002` stores
- `DB-003` products
- `DB-004` inventory_batches
- `INT-001` frontend-to-backend API flow
- `INT-002` backend-to-ML service flow
- `INT-003` recommendation orchestration

## Documentation

- `INTEGRATION_MAP.md` — module responsibilities, API catalog, integration mapping, placeholders
- `IMPLEMENTATION_CHECKLIST.md` — phased implementation order with dependency tracking
- `docs/architecture.md` — Mermaid diagrams and service relationship map
- `backend/prisma/schema.prisma` — PostgreSQL schema using Prisma

## Demo and integration status

- Core store, product, inventory, dashboard and recommendation queries use PostgreSQL outside explicit demo mode.
- `DEMO_MODE=true` enables in-memory fixtures only outside production, for local demonstration and unit tests.
- Sales, inventory, receipt, promotion and waste ingestion have persistent backend paths with optional idempotency keys.
- Demand forecast and spoilage prediction call the FastAPI contract and persist validated results. FastAPI model internals remain owned by Person 3.
- Live Neon migrations, persistence and FastAPI calls require separately configured services; API success is not claimed until those integration tests run against the intended environment.

## Security notes

- Keep all secrets in service-level `.env` files only
- Never expose database credentials in frontend code
- Use role-based access checks in the API layer before performing writes or approvals
