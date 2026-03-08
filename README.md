# Property Management System (PMS)

A modern full-stack web application for managing multiple apartment complexes, built with NestJS, React, PostgreSQL, and Prisma.

## Tech Stack

### Backend
- **Runtime**: Node.js 20+
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL 15
- **ORM**: Prisma
- **Authentication**: JWT + Passport
- **Validation**: class-validator & class-transformer

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Data Fetching**: Axios + React Query
- **Forms**: React Hook Form + Zod

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Development**: Hot reload for both frontend and backend

## Project Structure

```
pms-app/
├── backend/                 # NestJS application
│   ├── prisma/             # Database schema & migrations
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── users/          # Users management
│   │   ├── complexes/      # Apartment complexes
│   │   ├── apartments/     # Apartments
│   │   ├── tenants/        # Tenant management
│   │   ├── leases/         # Lease management
│   │   ├── payments/       # Payment tracking
│   │   ├── expenses/       # Expense tracking
│   │   ├── maintenance/    # Maintenance requests
│   │   ├── dashboard/      # Dashboard stats
│   │   └── common/         # Guards, decorators, filters
│   └── Dockerfile
│
├── frontend/                # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── api/            # API client
│   │   ├── store/          # Zustand stores
│   │   ├── hooks/          # Custom hooks
│   │   └── types/          # TypeScript types
│   └── Dockerfile
│
├── docker-compose.yml       # Development environment
└── .env.example             # Environment template
```

## Getting Started

### Prerequisites
- Docker & Docker Compose (recommended for development)
- Node.js 20+ (if running without Docker)
- PostgreSQL 15+ (if running without Docker)

### Option 1: Using Docker Compose (Recommended)

```bash
cd pms-app

# Copy environment variables
cp .env.example .env

# Start all services
docker-compose up

# In another terminal, run migrations
docker-compose exec backend npx prisma migrate dev --name init
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- API Docs: http://localhost:3000/api/docs
- Database: localhost:5432

### Option 2: Local Development Setup

#### Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Setup environment
cp ../.env.example .env

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Start development server
npm run start:dev
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## Available Scripts

### Backend
```bash
npm run start:dev    # Development with hot reload
npm run build        # Build for production
npm run start:prod   # Run production build
npm run test         # Run tests
npm test:e2e         # Run E2E tests
```

### Frontend
```bash
npm run dev          # Development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run type-check   # Type check only
```

## Development Roadmap

### Phase 1: Foundation ✅
- [x] Project structure setup
- [x] NestJS configuration
- [x] Prisma schema & models
- [x] Docker Compose setup

### Phase 2: Authentication (Next)
- [ ] User registration & login
- [ ] JWT tokens & refresh
- [ ] Role-based access control
- [ ] Frontend auth pages

### Phase 3: Core CRUD (TBD)
- [ ] Apartment complexes management
- [ ] Apartments listing
- [ ] Tenants management
- [ ] Dashboard skeleton

### Phase 4: Leases & Payments (TBD)
- [ ] Lease creation & management
- [ ] Payment tracking
- [ ] Overdue detection

### Phase 5: Maintenance & Expenses (TBD)
- [ ] Maintenance requests
- [ ] Expense tracking
- [ ] Category management

### Phase 6: Dashboard & Reporting (TBD)
- [ ] Dashboard statistics
- [ ] Charts & analytics
- [ ] Reports generation

### Phase 7: Production Ready (TBD)
- [ ] API documentation
- [ ] Unit & E2E tests
- [ ] Performance optimization
- [ ] Security hardening

## Database Schema

The database includes the following main entities:

- **Users**: System users with roles (ADMIN, MANAGER)
- **ApartmentComplex**: Properties managed in the system
- **Apartments**: Individual units within complexes
- **Tenants**: People renting apartments
- **Leases**: Rental contracts
- **Payments**: Rent and fee payments
- **Expenses**: Complex-related expenses
- **MaintenanceRequests**: Repair and maintenance tickets

For full schema details, see `backend/prisma/schema.prisma`

## API Documentation

Once the backend is running, visit: http://localhost:3000/api/docs

## Environment Variables

See `.env.example` for all required environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT signing
- `JWT_EXPIRES_IN`: Token expiration time
- `NODE_ENV`: Environment (development/production)

## Security Notes

- Change `JWT_SECRET` in production
- Use strong database passwords
- Enable CORS only for allowed origins
- Validate all user inputs
- Use HTTPS in production
- Keep dependencies updated

## Contributing

Follow the coding style guidelines:
- Use TypeScript for all new code
- Follow NestJS module structure
- Use DTOs for request/response validation
- Write tests for critical logic
- Follow commit message conventions

## License

ISC

## Support

For issues or questions, please check the documentation or raise an issue in the repository.
