# ZeroWaste AI — Architecture Template and Integration Blueprint

This repository is a runnable monorepo scaffold for a ZeroWaste AI system that tracks grocery inventory, demand forecasts, spoilage risk, replenishment, markdown, and inter-store transfer recommendations.

The scaffold intentionally separates the project into:

- Frontend: Next.js + TypeScript + Tailwind
- Backend: Node.js + Express + TypeScript + Prisma + Zod
- ML Service: Python + FastAPI + scikit-learn + XGBoost + Pandas
- Database: PostgreSQL schema definitions via Prisma

The goal is not to implement the full business system yet. Instead, it implements a clean integration blueprint with placeholders, mock data, typed API contracts, health checks, and module boundaries so the team can expand without mixing responsibilities.

## Monorepo structure

- `frontend/` — Next.js pages, typed API client, dashboard mock data, shared components
- `backend/` — Express API, controllers, services, Prisma schema, validation, test harness
- `ml-service/` — FastAPI service for forecasting, spoilage risk, and optimization integrations
- `docs/` — ER diagrams, architecture diagrams, integration maps, checklists

## Quick setup

For a Windows-first setup walkthrough, environment variables, database configuration, and verified limitations, see [SETUP_GUIDE.md](./SETUP_GUIDE.md).

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

## Placeholder notice

This scaffold intentionally contains mock implementations where actual model logic or automation is not yet ready. Any endpoint or page marked as a mock is clearly labelled in the code and docs.

## Security notes

- Keep all secrets in service-level `.env` files only
- Never expose database credentials in frontend code
- Use role-based access checks in the API layer before performing writes or approvals
