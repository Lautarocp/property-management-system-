# Property Management System — Implementation History

> This document tracks the complete implementation history across all phases.

---

## Phase 1: Foundation ✅
**Completed:** 2026-03-08

### What Was Built
- Full project structure for backend and frontend
- NestJS app with 9 modules (all stubbed)
- Prisma schema with 8 models and 8 enums
- JWT authentication strategy and guards (scaffold)
- React + Vite + TailwindCSS frontend boilerplate
- Zustand auth store, Axios client, TypeScript types
- Docker Compose infrastructure
- Dockerfiles for backend and frontend

### Architecture Decisions
- Monolithic NestJS backend (scalable to microservices later)
- Single PostgreSQL database
- JWT stateless authentication
- Zustand for lightweight frontend state
- TailwindCSS utility-first styling
- Docker for reproducible environments

---

## Phase 2: Authentication ✅
**Completed:** 2026-03-08

### Backend
- User registration with bcrypt password hashing (salt rounds: 12)
- JWT login endpoint returning signed tokens (7-day expiry)
- `GET /api/auth/me` — returns current authenticated user
- `JwtAuthGuard` protecting all private routes
- `RolesGuard` + `@Roles()` decorator for ADMIN/MANAGER access
- `@CurrentUser()` decorator injecting user from JWT payload
- `UsersService` — create, findByEmail, findOne (password excluded from responses)

### Frontend
- Login page with Zod validation, error display, and show/hide password toggle
- Register page with firstName, lastName, email, password fields
- `useLogin` / `useRegister` / `useLogout` React Query mutation hooks
- `ProtectedRoute` component — redirects unauthenticated users to `/login`
- Axios interceptors — auto-attach Bearer token, handle 401 → redirect to login
- Token persisted to `localStorage` via Zustand store

---

## Phase 3: Core CRUD ✅
**Completed:** 2026-03-24

### Backend — Complexes Module
- `CreateComplexDto` / `UpdateComplexDto` with class-validator
- `GET /api/complexes` — list active complexes with apartment count
- `GET /api/complexes/:id` — detail with apartments list
- `POST /api/complexes` — create (owner set from JWT user)
- `PATCH /api/complexes/:id` — partial update
- `DELETE /api/complexes/:id` — soft delete (`isActive: false`)

### Backend — Apartments Module
- `CreateApartmentDto` / `UpdateApartmentDto`
- `GET /api/apartments?complexId=` — list with active lease + tenant info
- `GET /api/apartments/:id` — detail with complex and active lease
- `POST /api/apartments` — create
- `PATCH /api/apartments/:id` — update
- `DELETE /api/apartments/:id` — hard delete

### Backend — Tenants Module
- `CreateTenantDto` / `UpdateTenantDto` — includes `notes` field
- `GET /api/tenants` — list active tenants with their current active lease + apartment
- `GET /api/tenants/:id` — full detail with complete lease history
- `POST /api/tenants` — create (createdById set from JWT user)
- `PATCH /api/tenants/:id` — update (supports notes)
- `DELETE /api/tenants/:id` — soft delete (`isActive: false`)

### Backend — Dashboard Module
- `GET /api/dashboard/stats` — returns:
  - `totalComplexes`, `totalApartments`, `availableApartments`, `occupiedApartments`
  - `totalTenants`, `activeLeases`, `pendingPayments`

### Frontend
- `Layout` component with persistent `Sidebar` navigation
- Sidebar links: Dashboard · Complexes · Apartments · Tenants · Payments · Maintenance
- Sidebar displays logged-in user name, email, role badge, and sign-out button
- `DashboardPage` — 7 stat cards with live data from `/api/dashboard/stats`
- `ComplexesPage` — card grid, inline create/edit form, delete; card click navigates to filtered apartments via router state
- `ApartmentsPage` — table view with status badges, inline create/edit form
- `TenantsPage` — table with apartment column and notes preview, inline create/edit form

### Schema Change
- Added `notes String?` field to `Tenant` model

---

## Phase 3.5: Tenant ↔ Apartment Assignment ✅
**Completed:** 2026-03-24

### Backend — Leases Module
- `CreateLeaseDto` — apartmentId, tenantId, startDate, endDate, monthlyRent, depositAmount, notes
- `TransferLeaseDto` — newApartmentId, startDate, endDate, monthlyRent, depositAmount
- `GET /api/leases?apartmentId=` — list leases with tenant and apartment info
- `GET /api/leases/:id` — lease detail
- `GET /api/leases/:id/pending-charges` — returns pending MAINTENANCE payments on a lease
- `POST /api/leases` — assign tenant to apartment (atomic transaction)
- `PATCH /api/leases/:id/terminate` — remove tenant, free apartment; accepts `{ deductFromDeposit }`:
  - If `deductFromDeposit: true`: marks all pending MAINTENANCE payments as PAID with a deposit note
  - If `false`: leaves pending charges as-is
- `PATCH /api/leases/:id/transfer` — atomic move: creates new lease, terminates old one, swaps apartment statuses

### Frontend — ApartmentsPage Enhancements
- **Assign button** — available apartments → modal with tenant dropdown, dates, rent, deposit, notes
- **Move button** — occupied apartments → modal with AVAILABLE apartments only
- **Terminate button** — opens `TerminateModal`:
  - Fetches pending MAINTENANCE charges via `GET /api/leases/:id/pending-charges`
  - Shows each charge with amount
  - Two actions: "Terminate & deduct from deposit" / "Terminate & leave charges pending"

### Frontend — TenantsPage Enhancements
- **View button** → opens `TenantDetailPanel`:
  - Personal info, notes (yellow highlight), current apartment, full lease history with status badges
- Notes preview in table row
- Notes textarea in create/edit form

---

## Phase 4: Payments ✅
**Completed:** 2026-03-29

### Backend — Payments Module
- Full CRUD: list (with filters), create, update, delete
- `PaymentType` enum extended with `MAINTENANCE` value
- `Payment` model has `maintenanceRequestId String?` for traceability

### Frontend — PaymentsPage
- Payments table: type, status, amount, due date, tenant name, apartment
- **Color-coded type badges**: RENT (blue), DEPOSIT (green), LATE FEE (orange), MAINTENANCE (purple), OTHER (gray)
- Filter by payment status and type
- Mark payments as paid

---

## Phase 5: Maintenance ✅
**Completed:** 2026-03-30

### Schema Changes
- Added `repairCost Decimal?` and `tenantChargeAmount Decimal?` to `MaintenanceRequest`
- Added `maintenanceRequestId String?` to `Payment` model

### Backend — Maintenance Module
- `CreateMaintenanceDto` — title, description, apartmentId, optional priority/notes
- `UpdateMaintenanceDto` — all fields optional including status, repairCost, tenantChargeAmount
- `GET /api/maintenance?apartmentId=&status=` — list with filters
- `GET /api/maintenance/:id` — detail with apartment and tenant
- `POST /api/maintenance` — create; auto-assigns tenant from active lease
- `PATCH /api/maintenance/:id` — update:
  - If `tenantChargeAmount` changes: creates, updates, or cancels linked MAINTENANCE payment
  - If status set to `RESOLVED`: sets `resolvedAt` timestamp
- `DELETE /api/maintenance/:id` — delete; cancels any linked pending MAINTENANCE payment

### Frontend — MaintenancePage
- Create form: apartment, title, description, priority, notes (no costs at creation)
- Card list showing status/priority badges, tenant name, repair cost and tenant charge (resolved/closed only)
- **DetailPanel**:
  - Status/priority badges, apartment, description, tenant
  - Costs section (repair cost + tenant charge) shown only when RESOLVED or CLOSED
  - Tenant charge has inline **Edit** button for updating amount post-resolve
  - Status buttons for non-closed tickets: OPEN, IN_PROGRESS, RESOLVED (inline form), CLOSED
  - **RESOLVED** button opens an inline form asking for repair cost + tenant charge before confirming
  - **Reopen** button shown for CLOSED tickets → sets status back to OPEN

### Lease Termination Integration
- Terminate modal fetches pending maintenance charges before confirming
- User can choose to deduct charges from deposit or leave them pending

---

## Infrastructure Fixes
**Completed:** 2026-03-24

- `backend/Dockerfile` — changed `npm ci` → `npm install`, added `RUN apk add --no-cache openssl`
- `frontend/Dockerfile` — changed `npm ci` → `npm install`
- `docker-compose.yml` — `CORS_ORIGIN` supports multiple comma-separated origins (parsed in `main.ts`)
- `backend/src/main.ts` — CORS callback reads `CORS_ORIGIN` env var, splits on comma, allows all matching origins

---

## Bug Fixes
**Completed:** 2026-03-24

### Sidebar User Info Not Showing After Refresh
- **Root cause:** Zustand store initializes `user: null` on every page load.
- **Fix:** Persist `user` to `localStorage`, restore via `loadUser()` on init. `ProtectedRoute` fetches `/auth/me` when token exists but `user` is null. Sidebar queries via React Query as source of truth.

### Sidebar Visual Improvement
- Circular avatar with initials, name/email row, role badge, animated skeleton while loading.

### CORS Multi-Origin
- Root cause: `docker-compose.yml` hardcoded a single `CORS_ORIGIN` value, blocking requests from VPN/Tailscale IP.
- Fix: comma-separated origins in docker-compose, callback-based CORS check in `main.ts`.

---

## Current Phase Status

| Phase | Status | Completed |
|---|---|---|
| 1 — Foundation | ✅ Complete | 2026-03-08 |
| 2 — Authentication | ✅ Complete | 2026-03-08 |
| 3 — Core CRUD | ✅ Complete | 2026-03-24 |
| 3.5 — Leases & Assignment | ✅ Complete | 2026-03-24 |
| 4 — Payments | ✅ Complete | 2026-03-29 |
| 5 — Maintenance | ✅ Complete | 2026-03-30 |
| 6 — Dashboard & Reporting | 🔮 Planned | — |
| 7 — Production Ready | 🔮 Planned | — |

---

## Active API Endpoints

### Auth
| Method | Path | Auth |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | JWT |

### Complexes
| Method | Path |
|---|---|
| GET | `/api/complexes` |
| GET | `/api/complexes/:id` |
| POST | `/api/complexes` |
| PATCH | `/api/complexes/:id` |
| DELETE | `/api/complexes/:id` |

### Apartments
| Method | Path |
|---|---|
| GET | `/api/apartments?complexId=` |
| GET | `/api/apartments/:id` |
| POST | `/api/apartments` |
| PATCH | `/api/apartments/:id` |
| DELETE | `/api/apartments/:id` |

### Tenants
| Method | Path |
|---|---|
| GET | `/api/tenants` |
| GET | `/api/tenants/:id` |
| POST | `/api/tenants` |
| PATCH | `/api/tenants/:id` |
| DELETE | `/api/tenants/:id` |

### Leases
| Method | Path |
|---|---|
| GET | `/api/leases?apartmentId=` |
| GET | `/api/leases/:id` |
| POST | `/api/leases` |
| GET | `/api/leases/:id/pending-charges` |
| PATCH | `/api/leases/:id/terminate` |
| PATCH | `/api/leases/:id/transfer` |

### Payments
| Method | Path |
|---|---|
| GET | `/api/payments` |
| POST | `/api/payments` |
| PATCH | `/api/payments/:id` |
| DELETE | `/api/payments/:id` |

### Maintenance
| Method | Path |
|---|---|
| GET | `/api/maintenance?apartmentId=&status=` |
| GET | `/api/maintenance/:id` |
| POST | `/api/maintenance` |
| PATCH | `/api/maintenance/:id` |
| DELETE | `/api/maintenance/:id` |

### Dashboard
| Method | Path |
|---|---|
| GET | `/api/dashboard/stats` |
