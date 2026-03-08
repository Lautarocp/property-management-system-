# PMS Quick Start Guide

## ⚡ 5-Minute Setup with Docker Compose

### Step 1: Start the Services
```bash
cd /home/n1ce/pms-app
docker-compose up
```

This will start:
- PostgreSQL database (port 5432)
- NestJS backend (port 3000)
- React frontend (port 5173)

### Step 2: Run Database Migrations
In a new terminal:
```bash
cd /home/n1ce/pms-app/backend
npx prisma migrate dev --name init
```

### Step 3: Open the Application
- **Frontend**: http://localhost:5173
- **API Docs**: http://localhost:3000/api/docs
- **Database**: localhost:5432 (pms_user / supersecretpassword)

---

## 🛠️ Local Development Setup

### Backend Setup
```bash
cd /home/n1ce/pms-app/backend

# Dependencies already installed!
# npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Start development server
npm run start:dev
```

### Frontend Setup
```bash
cd /home/n1ce/pms-app/frontend

# Dependencies already installed!
# npm install

# Start development server
npm run dev
```

---

## 📁 Project Locations

```
/home/n1ce/pms-app/
├── backend/           # NestJS API
├── frontend/          # React app
├── docker-compose.yml # Full stack config
└── README.md          # Full documentation
```

---

## 🔧 Useful Commands

### Backend
```bash
cd backend
npm run start:dev      # Development with hot reload
npm run build          # Build for production
npm run test           # Run tests
npm run lint           # ESLint + Prettier
```

### Frontend
```bash
cd frontend
npm run dev            # Development server
npm run build          # Build for production
npm run type-check     # TypeScript check
npm run lint           # ESLint check
```

### Database
```bash
# View database
npx prisma studio

# Create migration
npx prisma migrate dev --name <description>

# Reset database
npx prisma migrate reset
```

---

## 📊 Project Status

**Phase 1: Foundation** ✅ COMPLETE

What's ready:
- ✅ Project structure
- ✅ Database schema (Prisma)
- ✅ Module stubs (9 modules)
- ✅ Authentication infrastructure
- ✅ Docker setup
- ✅ Frontend setup

What's next:
- [ ] Phase 2: Authentication (login/register)
- [ ] Phase 3: CRUD operations
- [ ] Phase 4: Leases & Payments
- [ ] Phase 5: Maintenance & Expenses
- [ ] Phase 6: Dashboard & Analytics
- [ ] Phase 7: Production hardening

---

## 🔑 Default Credentials

Database:
- User: `pms_user`
- Password: `supersecretpassword`
- Database: `pms_db`

JWT Secret (change in production):
```
your-super-secret-jwt-key-change-this-in-production
```

---

## 📚 Important Files

- `/home/n1ce/pms-app/PHASE_1_COMPLETE.md` - Detailed Phase 1 summary
- `/home/n1ce/pms-app/README.md` - Full project documentation
- `/home/n1ce/pms-app/backend/prisma/schema.prisma` - Database schema
- `/home/n1ce/pms-app/docker-compose.yml` - Infrastructure config

---

## ❓ Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9

# Kill process on port 3000 (backend)
lsof -ti:3000 | xargs kill -9

# Kill process on port 5432 (database)
lsof -ti:5432 | xargs kill -9
```

### Database Connection Error
Ensure PostgreSQL is running (via Docker Compose):
```bash
docker-compose ps  # Check status
docker-compose logs postgres  # View logs
```

### Dependencies Issue
```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📞 Next Steps

1. Review the full architecture in `README.md`
2. Check `PHASE_1_COMPLETE.md` for what was created
3. Start implementing Phase 2 (Authentication)
4. See the full development roadmap in the plan file

---

**Ready to build? Start with:** `docker-compose up`
