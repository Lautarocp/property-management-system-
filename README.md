# Property Management System (PMS)

A full-stack web application for managing multiple apartment complexes — including tenants, leases, payments, expenses, and maintenance requests. Built with NestJS, React, PostgreSQL, and Prisma.

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js 20+ / NestJS | REST API framework |
| PostgreSQL 15 | Primary database |
| Prisma ORM | Database access & migrations |
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
│   │   └── schema.prisma         # Database schema (8 models, 8 enums)
│   ├── src/
│   │   ├── auth/                 # JWT authentication (register, login)
│   │   ├── users/                # User management
│   │   ├── complexes/            # Apartment complex CRUD
│   │   ├── apartments/           # Apartment CRUD
│   │   ├── tenants/              # Tenant CRUD + notes
│   │   ├── leases/               # Lease management (assign, transfer, terminate)
│   │   ├── payments/             # Payment tracking (stub)
│   │   ├── expenses/             # Expense tracking (stub)
│   │   ├── maintenance/          # Maintenance requests (stub)
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
│   │   │   ├── auth/             # Login, Register
│   │   │   ├── complexes/        # ComplexesPage
│   │   │   ├── apartments/       # ApartmentsPage
│   │   │   ├── tenants/          # TenantsPage
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

> **Important:** If deploying on a remote server, update `VITE_API_URL` and `CORS_ORIGIN` in `docker-compose.yml` to use the server's IP instead of `localhost`.

### 2. Start all services

```bash
docker compose up -d --build
```

### 3. Run database migrations

```bash
docker compose exec backend npx prisma migrate dev --name init
```

### 4. Access the app

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000/api |
| API Docs (Swagger) | http://localhost:3000/api/docs |
| PostgreSQL | localhost:5432 |

### 5. Create your first user

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pms.com","password":"Admin123!","firstName":"Admin","lastName":"User","role":"ADMIN"}'
```

---

## Remote Server Deployment

To deploy on a machine in your local network (e.g. a Debian server at `192.168.x.x`):

1. Install Docker on the server (the setup script handles this automatically on Debian).
2. In `docker-compose.yml`, replace both `localhost` references with the server IP:
   ```yaml
   # backend service
   CORS_ORIGIN: http://<SERVER_IP>:5173

   # frontend service
   VITE_API_URL: http://<SERVER_IP>:3000/api
   ```
3. Copy the project and run `docker compose up -d --build`.
4. Run migrations: `docker compose exec -T backend npx prisma db push`

---

## Features

### Phase 1 — Foundation ✅
- Project structure, NestJS configuration, Prisma schema, Docker Compose setup.

### Phase 2 — Authentication ✅
- User registration with bcrypt password hashing.
- JWT login with 7-day tokens.
- Role-based access control (`ADMIN`, `MANAGER`).
- Protected routes on the frontend.
- Login and Register pages.

### Phase 3 — Core CRUD ✅

#### Apartment Complexes
- Create, edit, soft-delete complexes.
- Each complex shows apartment count.
- Fields: name, address, city, state, zip code, description.

#### Apartments
- Create, edit, delete apartments with unit number, floor, bedrooms, bathrooms, area, monthly rent.
- Status: `AVAILABLE`, `OCCUPIED`, `MAINTENANCE`, `INACTIVE`.
- Filter apartments by complex.
- Apartment table shows current tenant name.

#### Tenants
- Create, edit, soft-delete tenants.
- Fields: name, email, phone, DNI/ID, birth date, **notes**.
- **Notes** are displayed inline in the table (📝 preview) and in the detail panel.
- **View** button opens a detail panel showing:
  - Personal information
  - Notes (highlighted)
  - Current apartment & active lease details (rent, start/end dates)
  - Full lease history with status badges

#### Dashboard
- Live stats cards: total complexes, total apartments, available vs occupied, total tenants, active leases, pending payments.

### Phase 3.5 — Tenant ↔ Apartment Assignment ✅

#### Assign Tenant to Apartment
- **Assign** button on available apartments.
- Select tenant, set lease dates, monthly rent, deposit, and optional notes.
- Apartment status automatically changes to `OCCUPIED`.

#### Move Tenant to Different Apartment
- **Move** button on occupied apartments.
- Dropdown shows only `AVAILABLE` apartments.
- On confirm:
  - Old lease is terminated → old apartment becomes `AVAILABLE`.
  - New lease is created → new apartment becomes `OCCUPIED`.
  - Entire operation runs in a single database transaction.

#### Remove Tenant from Apartment
- **Remove** button terminates the active lease and marks the apartment `AVAILABLE`.

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
| GET | `/api/complexes/:id` | Get complex with apartments |
| POST | `/api/complexes` | Create complex |
| PATCH | `/api/complexes/:id` | Update complex |
| DELETE | `/api/complexes/:id` | Soft delete complex |

### Apartments
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/apartments` | List apartments (optional `?complexId=`) |
| GET | `/api/apartments/:id` | Get apartment with active lease |
| POST | `/api/apartments` | Create apartment |
| PATCH | `/api/apartments/:id` | Update apartment |
| DELETE | `/api/apartments/:id` | Delete apartment |

### Tenants
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tenants` | List active tenants (includes active lease) |
| GET | `/api/tenants/:id` | Get tenant with full lease history |
| POST | `/api/tenants` | Create tenant |
| PATCH | `/api/tenants/:id` | Update tenant (including notes) |
| DELETE | `/api/tenants/:id` | Soft delete tenant |

### Leases
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/leases` | List leases (optional `?apartmentId=`) |
| GET | `/api/leases/:id` | Get lease |
| POST | `/api/leases` | Create lease (assigns tenant to apartment) |
| PATCH | `/api/leases/:id/terminate` | Terminate lease, frees apartment |
| PATCH | `/api/leases/:id/transfer` | Move tenant to a different apartment |

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
```

### Models
| Model | Key Fields |
|---|---|
| `User` | email, password (hashed), firstName, lastName, role (ADMIN/MANAGER) |
| `ApartmentComplex` | name, address, city, state, zipCode, description, isActive |
| `Apartment` | number, floor, bedrooms, bathrooms, area, monthlyRent, status |
| `Tenant` | firstName, lastName, email, phone, dni, birthDate, **notes**, isActive |
| `Lease` | startDate, endDate, monthlyRent, depositAmount, status, notes |
| `Payment` | amount, dueDate, paidDate, status, type |
| `Expense` | description, amount, date, category |
| `MaintenanceRequest` | title, description, status, priority |

### Enums
- `ApartmentStatus`: `AVAILABLE` · `OCCUPIED` · `MAINTENANCE` · `INACTIVE`
- `LeaseStatus`: `ACTIVE` · `EXPIRED` · `TERMINATED` · `PENDING`
- `PaymentStatus`: `PENDING` · `PAID` · `OVERDUE` · `CANCELLED`
- `PaymentType`: `RENT` · `DEPOSIT` · `LATE_FEE` · `OTHER`
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
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:5173` |

---

## Roadmap

| Phase | Status | Description |
|---|---|---|
| 1 — Foundation | ✅ Done | Project setup, schema, Docker |
| 2 — Authentication | ✅ Done | JWT auth, roles, frontend pages |
| 3 — Core CRUD | ✅ Done | Complexes, apartments, tenants, dashboard |
| 3.5 — Leases | ✅ Done | Assign, move, terminate tenants |
| 4 — Payments | 🔮 Planned | Rent tracking, overdue detection |
| 5 — Maintenance & Expenses | 🔮 Planned | Tickets, expense categories |
| 6 — Reporting | 🔮 Planned | Charts, analytics, exports |
| 7 — Production | 🔮 Planned | Tests, hardening, CI/CD |

---

## Security Notes

- Change `JWT_SECRET` before going to production.
- Use strong database passwords.
- Set `CORS_ORIGIN` to the exact frontend URL only.
- Enable HTTPS in production.
- Keep dependencies updated.

---

## License

ISC
