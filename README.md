# Property Management System (PMS)

A full-stack web application for managing multiple apartment complexes — including tenants, leases, payments, expenses, and maintenance requests. Built with NestJS, React, PostgreSQL, and Prisma.

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js 20+ / NestJS | REST API framework |
| PostgreSQL 15 | Primary database |
| Prisma ORM | Database access & schema management |
| JWT + Passport | Authentication |
| class-validator | Request validation |
| Swagger / OpenAPI | Auto-generated API docs |

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Vite | Build tool & dev server |
| TailwindCSS | Styling |
| Zustand | Auth state management |
| TanStack React Query | Server state & data fetching |
| React Hook Form | Form handling |
| Axios | HTTP client |

### Infrastructure
| Technology | Purpose |
|---|---|
| Docker + Docker Compose | Containerized development |
| NestJS hot reload | Backend live updates |
| Vite HMR | Frontend live updates |

---

## Project Structure

```
property-management-system/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema (8 models, 9 enums)
│   │   └── seed.ts               # Database seed script
│   ├── src/
│   │   ├── auth/                 # JWT authentication (register, login)
│   │   ├── users/                # User management
│   │   ├── complexes/            # Apartment complex CRUD
│   │   ├── apartments/           # Apartment CRUD
│   │   ├── tenants/              # Tenant CRUD + notes
│   │   ├── leases/               # Lease management (assign, transfer, terminate)
│   │   ├── payments/             # Payment tracking (CRUD, types, mark paid)
│   │   ├── expenses/             # Expense tracking
│   │   ├── maintenance/          # Maintenance requests (full CRUD + workflow)
│   │   ├── dashboard/            # Aggregated stats
│   │   ├── prisma/               # PrismaService
│   │   └── common/               # Guards, decorators, filters, interceptors
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── api/                  # Axios API clients per module
│   │   ├── components/
│   │   │   ├── layout/           # Layout + Sidebar navigation
│   │   │   └── shared/           # ProtectedRoute
│   │   ├── hooks/                # React Query mutation/query hooks
│   │   ├── pages/
│   │   │   ├── auth/             # Login (+ show/hide password), Register
│   │   │   ├── complexes/        # ComplexesPage
│   │   │   ├── apartments/       # ApartmentsPage (assign/move/terminate)
│   │   │   ├── tenants/          # TenantsPage + detail panel
│   │   │   ├── payments/         # PaymentsPage (colored type badges)
│   │   │   ├── maintenance/      # MaintenancePage (full workflow)
│   │   │   └── DashboardPage.tsx
│   │   ├── store/                # Zustand auth store
│   │   └── types/                # TypeScript interfaces
│   └── Dockerfile
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Git

### 1. Clone & configure

```bash
git clone https://github.com/Lautarocp/property-management-system-.git
cd property-management-system-

cp .env.example .env
```

> **Remote deployment:** Update `CORS_ORIGIN` and `VITE_API_URL` in `docker-compose.yml` to use the server IP. Multiple origins are supported as a comma-separated list: `http://192.168.1.10:5173,http://100.x.x.x:5173`

### 2. Start all services

```bash
docker compose up -d --build
```

### 3. Push database schema

```bash
docker compose exec backend npx prisma db push
```

### 4. (Optional) Seed with sample data

```bash
docker compose exec backend npx ts-node prisma/seed.ts
```

### 5. Access the app

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000/api |
| API Docs (Swagger) | http://localhost:3000/api/docs |
| PostgreSQL | localhost:5432 |

### 6. Create your first user

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pms.com","password":"Admin123!","firstName":"Admin","lastName":"User","role":"ADMIN"}'
```

---

## Remote Server Deployment

To deploy on a machine in your local network or via VPN (e.g. Tailscale):

1. In `docker-compose.yml`, set both env vars to the server IP:
   ```yaml
   # backend service
   CORS_ORIGIN: http://<IP>:5173,http://<TAILSCALE_IP>:5173

   # frontend service
   VITE_API_URL: http://<IP>:3000/api
   ```
2. Run `docker compose up -d --no-deps backend frontend` to recreate containers with new env.
3. Push schema: `docker compose exec -T backend npx prisma db push`

---

## Features

### Phase 1 — Foundation ✅
Project structure, NestJS configuration, Prisma schema, Docker Compose setup.

### Phase 2 — Authentication ✅
- User registration with bcrypt password hashing.
- JWT login with 7-day tokens.
- Role-based access control (`ADMIN`, `MANAGER`).
- Protected routes on the frontend.
- Login and Register pages.
- Show/hide password toggle on login.

### Phase 3 — Core CRUD ✅

#### Apartment Complexes
- Create, edit, soft-delete complexes.
- Each complex shows apartment count.
- Click a complex card to navigate directly to its apartments.

#### Apartments
- Create, edit, delete apartments.
- Status: `AVAILABLE`, `OCCUPIED`, `MAINTENANCE`, `INACTIVE`.
- Filter apartments by complex.
- Apartment table shows current tenant name.

#### Tenants
- Create, edit, soft-delete tenants.
- Notes field displayed inline and in detail panel.
- **View** button opens detail panel: personal info, notes, current lease, full lease history.

#### Dashboard
- Live stats: total complexes, apartments (available/occupied), tenants, active leases, pending payments.

### Phase 3.5 — Leases ✅

#### Assign Tenant to Apartment
- Select tenant, set lease dates, rent, deposit, and notes.
- Apartment status automatically becomes `OCCUPIED`.

#### Move Tenant to Different Apartment
- Dropdown shows only `AVAILABLE` apartments.
- Atomic transaction: old lease terminated, new lease created.

#### Terminate Lease
- Modal shows pending **MAINTENANCE charges** on the lease.
- Choose to deduct charges from deposit or leave them pending.

### Phase 4 — Payments ✅
- Payment list with type, status, amount, due date, tenant, and apartment.
- Color-coded type badges: RENT, DEPOSIT, LATE FEE, MAINTENANCE, OTHER.
- Filter by status and type.
- Mark payments as paid.
- MAINTENANCE payments auto-created when a tenant charge is set on a maintenance ticket.

### Phase 5 — Maintenance ✅

#### Maintenance Requests
- Create tickets: apartment, title, description, priority, notes.
- Priority levels: LOW, MEDIUM, HIGH, URGENT.
- Status workflow: OPEN → IN_PROGRESS → RESOLVED → CLOSED.
- **Reopen** option for CLOSED tickets.

#### Resolve Flow
- Repair cost and tenant charge are entered **at resolve time** (not at creation).
- Confirming RESOLVED opens an inline form for costs.
- Costs are displayed in the detail panel only after the ticket is resolved.

#### Tenant Charge
- Tenant charge amount can be **edited** inline from the detail panel at any time after resolving.
- Setting a charge automatically creates a MAINTENANCE payment linked to the active lease.
- Changing the charge updates the linked payment; setting it to 0 cancels it.

---

## API Reference

All endpoints (except `/api/auth/*`) require a `Bearer` token in the `Authorization` header.

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user |

### Complexes
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/complexes` | List all active complexes |
| POST | `/api/complexes` | Create complex |
| PATCH | `/api/complexes/:id` | Update complex |
| DELETE | `/api/complexes/:id` | Soft delete complex |

### Apartments
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/apartments?complexId=` | List apartments |
| GET | `/api/apartments/:id` | Get apartment with active lease |
| POST | `/api/apartments` | Create apartment |
| PATCH | `/api/apartments/:id` | Update apartment |
| DELETE | `/api/apartments/:id` | Delete apartment |

### Tenants
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tenants` | List active tenants |
| GET | `/api/tenants/:id` | Get tenant with lease history |
| POST | `/api/tenants` | Create tenant |
| PATCH | `/api/tenants/:id` | Update tenant |
| DELETE | `/api/tenants/:id` | Soft delete tenant |

### Leases
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/leases?apartmentId=` | List leases |
| POST | `/api/leases` | Create lease |
| GET | `/api/leases/:id/pending-charges` | Get pending MAINTENANCE charges |
| PATCH | `/api/leases/:id/terminate` | Terminate lease (accepts `{ deductFromDeposit }`) |
| PATCH | `/api/leases/:id/transfer` | Move tenant to different apartment |

### Payments
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/payments` | List payments |
| POST | `/api/payments` | Create payment |
| PATCH | `/api/payments/:id` | Update payment |
| DELETE | `/api/payments/:id` | Delete payment |

### Maintenance
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/maintenance?apartmentId=&status=` | List requests |
| GET | `/api/maintenance/:id` | Get request detail |
| POST | `/api/maintenance` | Create request |
| PATCH | `/api/maintenance/:id` | Update request (status, costs) |
| DELETE | `/api/maintenance/:id` | Delete request |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/stats` | Returns aggregated property stats |

Full interactive docs available at `/api/docs` (Swagger UI).

---

## Database Schema

```
User ──< ApartmentComplex ──< Apartment ──< Lease >── Tenant
                                    └──< MaintenanceRequest >── Tenant
                          └──< Expense
         Lease ──< Payment >── Tenant
         Payment ──> MaintenanceRequest
```

### Models
| Model | Key Fields |
|---|---|
| `User` | email, password (hashed), firstName, lastName, role |
| `ApartmentComplex` | name, address, city, state, zipCode, isActive |
| `Apartment` | number, floor, bedrooms, bathrooms, area, monthlyRent, status |
| `Tenant` | firstName, lastName, email, phone, dni, birthDate, notes, isActive |
| `Lease` | startDate, endDate, monthlyRent, depositAmount, status, notes |
| `Payment` | amount, dueDate, paidDate, status, type, maintenanceRequestId |
| `Expense` | description, amount, date, category |
| `MaintenanceRequest` | title, description, status, priority, repairCost, tenantChargeAmount, resolvedAt |

### Enums
- `ApartmentStatus`: `AVAILABLE` · `OCCUPIED` · `MAINTENANCE` · `INACTIVE`
- `LeaseStatus`: `ACTIVE` · `EXPIRED` · `TERMINATED` · `PENDING`
- `PaymentStatus`: `PENDING` · `PAID` · `OVERDUE` · `CANCELLED`
- `PaymentType`: `RENT` · `DEPOSIT` · `LATE_FEE` · `MAINTENANCE` · `OTHER`
- `MaintenanceStatus`: `OPEN` · `IN_PROGRESS` · `RESOLVED` · `CLOSED`
- `MaintenancePriority`: `LOW` · `MEDIUM` · `HIGH` · `URGENT`
- `ExpenseCategory`: `REPAIRS` · `UTILITIES` · `CLEANING` · `INSURANCE` · `TAXES` · `STAFF` · `OTHER`

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://pms_user:...@localhost:5432/pms_db` |
| `DB_PASSWORD` | PostgreSQL password | `supersecretpassword` |
| `JWT_SECRET` | JWT signing secret | *(change in production)* |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `NODE_ENV` | Environment | `development` |
| `CORS_ORIGIN` | Allowed frontend origins (comma-separated) | `http://localhost:5173` |

---

## Roadmap

| Phase | Status | Description |
|---|---|---|
| 1 — Foundation | ✅ Done | Project setup, schema, Docker |
| 2 — Authentication | ✅ Done | JWT auth, roles, frontend pages |
| 3 — Core CRUD | ✅ Done | Complexes, apartments, tenants, dashboard |
| 3.5 — Leases | ✅ Done | Assign, move, terminate tenants |
| 4 — Payments | ✅ Done | Payment tracking with types and MAINTENANCE integration |
| 5 — Maintenance | ✅ Done | Full ticket workflow, costs, tenant charges |
| 6 — Reporting | 🔮 Planned | Charts, analytics, exports |
| 7 — Production | 🔮 Planned | Tests, hardening, CI/CD |

---

## Security Notes

- Change `JWT_SECRET` before going to production.
- Use strong database passwords.
- Set `CORS_ORIGIN` to the exact frontend URL(s) only.
- Enable HTTPS in production.
- Keep dependencies updated.

---

## License

ISC
