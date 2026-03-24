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
- Login page with Zod validation and error display
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
- `GET /api/tenants/:id` — full detail with complete lease history (all statuses)
- `POST /api/tenants` — create (createdById set from JWT user)
- `PATCH /api/tenants/:id` — update (supports notes)
- `DELETE /api/tenants/:id` — soft delete (`isActive: false`)

### Backend — Dashboard Module
- `GET /api/dashboard/stats` — returns:
  - `totalComplexes`, `totalApartments`, `availableApartments`, `occupiedApartments`
  - `totalTenants`, `activeLeases`, `pendingPayments`

### Frontend
- `Layout` component with persistent `Sidebar` navigation
- Sidebar links: Dashboard · Complexes · Apartments · Tenants
- Sidebar displays logged-in user name, email, role badge, and sign-out button
- `DashboardPage` — 7 stat cards with live data from `/api/dashboard/stats`
- `ComplexesPage` — card grid, inline create/edit form, delete
- `ApartmentsPage` — table view with status badges, inline create/edit form
- `TenantsPage` — table with apartment column and notes preview (📝), inline create/edit form

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
- `POST /api/leases` — assign tenant to apartment:
  - Validates no existing active lease on target apartment
  - Creates lease with `ACTIVE` status
  - Updates apartment status → `OCCUPIED`
  - Runs in a single DB transaction
- `PATCH /api/leases/:id/terminate` — remove tenant from apartment:
  - Sets lease status → `TERMINATED`
  - Updates apartment status → `AVAILABLE`
  - Runs in a single DB transaction
- `PATCH /api/leases/:id/transfer` — move tenant to a different apartment:
  - Validates source lease is `ACTIVE`
  - Validates target apartment exists and is `AVAILABLE`
  - Validates no active lease on target
  - In one atomic transaction:
    1. Creates new `ACTIVE` lease on target apartment
    2. Updates target apartment → `OCCUPIED`
    3. Terminates old lease
    4. Updates old apartment → `AVAILABLE`

### Frontend — ApartmentsPage Enhancements
- **Tenant column** — shows current tenant name if occupied
- **Assign button** (green) — available apartments only → opens modal:
  - Tenant dropdown, start/end dates, monthly rent, deposit, optional notes
- **Move button** (purple) — occupied apartments only → opens modal:
  - Dropdown filtered to `AVAILABLE` apartments only
  - New start/end dates, rent, deposit
  - Shows "no available apartments" message if none exist
- **Remove button** (orange) — occupied apartments only → confirms and terminates lease

### Frontend — TenantsPage Enhancements
- **View button** (indigo) → opens `TenantDetailPanel` side modal:
  - Personal information section (phone, DNI, birth date, member since)
  - **Notes section** — yellow highlight box if present, italic placeholder if empty
  - **Current Apartment** section — apartment number, floor, complex name, rent, lease dates
  - **Lease History** section — all past leases with status badges (TERMINATED, EXPIRED, etc.)
  - Edit button inside panel → closes panel and opens inline edit form
- **Notes preview** in table row — truncated 📝 snippet if notes exist
- **Notes textarea** in create/edit form

---

## Infrastructure Fixes
**Completed:** 2026-03-24

- `backend/Dockerfile` — changed `npm ci` → `npm install`, added `RUN apk add --no-cache openssl` (required by Prisma on Alpine)
- `frontend/Dockerfile` — changed `npm ci` → `npm install`
- `docker-compose.yml` — added `CORS_ORIGIN` env var for remote deployments, `VITE_API_URL` set to server IP

---

## Current Phase Status

| Phase | Status | Completed |
|---|---|---|
| 1 — Foundation | ✅ Complete | 2026-03-08 |
| 2 — Authentication | ✅ Complete | 2026-03-08 |
| 3 — Core CRUD | ✅ Complete | 2026-03-24 |
| 3.5 — Leases & Assignment | ✅ Complete | 2026-03-24 |
| 4 — Payments | 🔮 Planned | — |
| 5 — Maintenance & Expenses | 🔮 Planned | — |
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
| PATCH | `/api/leases/:id/terminate` |
| PATCH | `/api/leases/:id/transfer` |

### Dashboard
| Method | Path |
|---|---|
| GET | `/api/dashboard/stats` |
