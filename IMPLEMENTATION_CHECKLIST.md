# ZeroWaste AI Implementation Checklist

This is a forward-looking implementation plan. Unchecked items need implementation or end-to-end verification; scaffold routes, UI pages, and Prisma models alone do not establish that a workflow is complete. Current API paths and known integration gaps are documented in [INTEGRATION_MAP.md](./INTEGRATION_MAP.md).

## Phase 1 — foundation and contracts

- [ ] Create root monorepo and workspace configuration
- [ ] Define service boundaries and integration IDs
- [ ] Create `.env.example` files for frontend, backend, and ML service
- [ ] Define backend TypeScript contracts and response interfaces
- [ ] Define frontend typed API client contract
- [ ] Document integration map and placeholder status

## Phase 2 — database and persistence

- [ ] Finalize `backend/prisma/schema.prisma` models
- [ ] Add required indexes and uniqueness constraints
- [ ] Document table cardinality and relationship rules
- [ ] Create Prisma migration instructions for Neon PostgreSQL
- [ ] Validate schema with `prisma format` and migration test

## Phase 3 — backend API skeleton

- [ ] Implement Express app bootstrap and health route
- [ ] Add routing for dashboard, inventory, forecast, spoilage, recommendation, and audit APIs
- [ ] Implement controller -> service -> repository flow
- [ ] Add Zod validators for each request contract
- [ ] Add type-safe responses and error handling

## Phase 4 — frontend scaffold

- [ ] Configure Next.js app and Tailwind CSS
- [ ] Build reusable page layout and cards
- [ ] Implement typed API client with mock fallback
- [ ] Implement dashboard, inventory, expiry, and forecast pages
- [ ] Implement recommendation and evaluation screens
- [ ] Ensure role-based access is reflected in page metadata

## Phase 5 — ML service

- [ ] Create FastAPI app bootstrap and health endpoint
- [ ] Add feature schemas for demand and spoilage endpoints
- [ ] Add deterministic mock outputs for model stages
- [ ] Add service route contract and response payloads
- [ ] Add Python tests for schema validation and mock output

## Phase 6 — orchestration and agents

- [ ] Define real demand forecasting agent interface
- [ ] Define spoilage analysis pipeline and feature generation
- [ ] Create replenishment and markdown candidate generation
- [ ] Implement transfer optimization workflow
- [ ] Add business constraint validator
- [ ] Add recommendation persistence and approval lifecycle

## Phase 7 — approval and execution

- [ ] Implement manager review state machine
- [ ] Distinguish recommendation from executed change
- [ ] Log audit events after each action
- [ ] Implement controlled execution after approval
- [ ] Ensure recommendation generation does not directly alter inventory

## Phase 8 — verification and quality

- [ ] Add backend unit/integration tests with Vitest
- [ ] Add Python tests for FastAPI endpoints
- [ ] Verify health endpoints return 200
- [ ] Check typed API contract names match backend endpoints
- [ ] Review placeholder markers before using mock flows in demos

## Dependency order

1. `API-001`, `DB-001`, `DB-002`, `DB-003`, `DB-004`, `DB-005`
2. `API-002`, `API-003`, `API-004`, `API-005`
3. `INT-001`, `INT-002`, `INT-003`
4. `API-006`, `API-007`, `API-008`, `API-009`
5. `API-010`, `API-011`
6. `DB-011` to `DB-018`
7. Approval workflow and restricted execution path
