# MedMatch Pro - National Medical Recruiting Platform

A complete, production-ready full-stack application for medical staffing and recruiting.

## Architecture

- **Backend**: Node.js + Express + TypeScript + Prisma ORM + PostgreSQL
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + React Query
- **Real-time**: Socket.IO for messaging and notifications
- **Payments**: Stripe integration for placement fees and shift payments
- **Security**: Full HIPAA compliance with audit trails, encryption, and access controls
- **Matching**: AI-powered job/provider matching algorithm

## Features

### For Healthcare Providers
- Create detailed professional profiles with specialties and credentials
- Upload and manage licenses, certifications, and board credentials
- Search and apply to jobs nationwide
- Real-time messaging with employers
- Smart job matching based on specialty, location, and preferences
- Credential expiry alerts

### For Healthcare Employers
- Post positions with detailed requirements and benefits
- Search provider database with filters
- Review applications and schedule interviews
- Manage Business Associate Agreements (BAA)
- Integrated payment processing for placement fees
- Review and rating system

### Compliance & Security
- Full HIPAA audit logging for all PHI access
- AES-256 encryption for sensitive fields
- State medical license requirement tracking
- Compact license (IMLC, NLC) support
- Data retention policies
- Role-based access control

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)

### Docker Deployment
```bash
# Clone and enter directory
cd medical-recruiting-platform

# Set environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your values

# Start all services
docker-compose up -d

# Run database migrations
docker-compose exec backend npx prisma migrate dev

# Seed the database
docker-compose exec backend npx prisma db seed
```

### Local Development
```bash
# Backend
cd backend
npm install
npx prisma migrate dev
npm run db:seed
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get current user

### Providers
- `GET /api/v1/providers/search` - Search providers
- `GET /api/v1/providers/:id` - Get provider details
- `PUT /api/v1/providers/profile` - Update profile
- `GET /api/v1/providers/matches` - Get job matches
- `POST /api/v1/providers/credentials` - Add credential

### Employers
- `GET /api/v1/employers/search` - Search employers
- `GET /api/v1/employers/:id` - Get employer details
- `PUT /api/v1/employers/profile` - Update profile

### Jobs
- `GET /api/v1/jobs/search` - Search jobs
- `GET /api/v1/jobs/:id` - Get job details
- `POST /api/v1/jobs` - Create job (employer)
- `PUT /api/v1/jobs/:id` - Update job
- `DELETE /api/v1/jobs/:id` - Cancel job

### Applications
- `POST /api/v1/applications` - Apply to job
- `GET /api/v1/applications/my-applications` - Get my applications
- `PATCH /api/v1/applications/:id/status` - Update status

### Messages
- `GET /api/v1/messages/conversations` - Get conversations
- `GET /api/v1/messages/:userId` - Get messages with user
- `POST /api/v1/messages` - Send message

### Matching
- `GET /api/v1/matching/my-matches` - Get matches
- `POST /api/v1/matching/run/:jobId` - Run matching for job

### Payments
- `POST /api/v1/payments/create-intent` - Create payment intent
- `GET /api/v1/payments/my-payments` - Get payment history

### State Licenses
- `GET /api/v1/state-licenses/requirements` - Get all state requirements
- `GET /api/v1/state-licenses/compact-states` - Get compact states

### HIPAA
- `GET /api/v1/hipaa/my-audit-log` - Get audit log
- `GET /api/v1/hipaa/consents` - Get privacy consents
- `POST /api/v1/hipaa/consent` - Update consent

## Environment Variables

See `backend/.env.example` for required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT signing
- `STRIPE_SECRET_KEY` - Stripe API key
- `SMTP_*` - Email configuration

## Database Schema

The platform uses PostgreSQL with Prisma ORM. Key entities:
- Users (Providers, Employers, Admins)
- Provider Profiles with credentials and availability
- Employer Profiles with company details
- Jobs with requirements and benefits
- Applications with status tracking
- Messages with real-time delivery
- Payments with Stripe integration
- HIPAA Audit Logs
- State License Requirements
- Compact License tracking

## License

Commercial - All rights reserved.
