# PMS Quick Start Guide

## 5-Minute Setup with Docker Compose

### Step 1: Clone & configure
```bash
git clone https://github.com/Lautarocp/property-management-system-.git
cd property-management-system-
cp .env.example .env
```

### Step 2: Start all services
```bash
docker compose up -d --build
```

This starts:
- PostgreSQL database (port 5432)
- NestJS backend (port 3000)
- React frontend (port 5173)

### Step 3: Push database schema
```bash
docker compose exec backend npx prisma db push
```

### Step 4: (Optional) Seed with sample data
```bash
docker compose exec backend npx ts-node prisma/seed.ts
```

### Step 5: Open the app

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API Docs | http://localhost:3000/api/docs |

### Step 6: Create your first user
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pms.com","password":"Admin123!","firstName":"Admin","lastName":"User","role":"ADMIN"}'
```

---

## Remote / VPN Deployment

To access the app from another machine or via Tailscale, update `docker-compose.yml`:

```yaml
# backend service
CORS_ORIGIN: http://192.168.1.10:5173,http://100.x.x.x:5173

# frontend service
VITE_API_URL: http://192.168.1.10:3000/api
```

Then recreate the containers:
```bash
docker compose up -d --no-deps backend frontend
```

Multiple origins are supported via comma-separated values.

---

## Default Credentials

Database:
- User: `pms_user`
- Password: `supersecretpassword`
- Database: `pms_db`

App login (after registering): use the email/password you set during registration.

---

## Useful Commands

### Docker
```bash
docker compose up -d --build          # Start all services (build images)
docker compose up -d --no-deps backend frontend  # Recreate only backend + frontend
docker compose logs -f backend        # Watch backend logs
docker compose exec backend sh        # Shell into backend container
```

### Database
```bash
docker compose exec backend npx prisma db push      # Push schema to DB
docker compose exec backend npx prisma generate     # Regenerate Prisma client
docker compose exec backend npx ts-node prisma/seed.ts  # Seed data
docker compose exec backend npx prisma studio       # Open Prisma Studio (port 5555)
```

### Backend (inside container or locally)
```bash
npm run start:dev    # Dev server with hot reload
npm run build        # Build for production
npm run lint         # ESLint + Prettier
```

### Frontend (inside container or locally)
```bash
npm run dev          # Dev server with HMR
npm run build        # Build for production
npm run type-check   # TypeScript check
```

---

## Project Status

| Phase | Status |
|---|---|
| 1 — Foundation | ✅ Complete |
| 2 — Authentication | ✅ Complete |
| 3 — Core CRUD | ✅ Complete |
| 3.5 — Leases & Assignment | ✅ Complete |
| 4 — Payments | ✅ Complete |
| 5 — Maintenance | ✅ Complete |
| 6 — Reporting | 🔮 Planned |
| 7 — Production | 🔮 Planned |

---

## Troubleshooting

### Port Already in Use
```bash
lsof -ti:5173 | xargs kill -9   # Frontend
lsof -ti:3000 | xargs kill -9   # Backend
lsof -ti:5432 | xargs kill -9   # Database
```

### API Requests Going to Wrong IP
The frontend bakes `VITE_API_URL` at build time. If you change the IP in `docker-compose.yml`, recreate the frontend container:
```bash
docker compose up -d --no-deps --build frontend
```

### Prisma Client Out of Sync
```bash
docker compose exec backend npx prisma db push
docker compose exec backend npx prisma generate
docker compose restart backend
```

### CORS Errors from New Origin
Add the new origin to `CORS_ORIGIN` in `docker-compose.yml` (comma-separated), then:
```bash
docker compose up -d --no-deps backend
```

---

## Key Files

- `docker-compose.yml` — env vars (CORS_ORIGIN, VITE_API_URL, DB creds)
- `backend/prisma/schema.prisma` — database schema
- `backend/src/main.ts` — CORS config, app bootstrap
- `README.md` — full documentation
- `PHASE_1_COMPLETE.md` — detailed implementation history
- `PROJECT_SUMMARY.txt` — feature overview and file structure
