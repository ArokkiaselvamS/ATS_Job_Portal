# AESCION Job Portal

## Project Overview

AESCION is a production-structured full-stack job-seeker platform built with modern technologies:

- **Frontend**: React, Vite, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons
- **Backend**: Node.js, Express.js, TypeScript, Cookie Parser, CORS, JWT
- **Database**: PostgreSQL
- **ORM**: Prisma ORM
- **Authentication**: JWT stored in HTTP-only cookies, bcrypt password hashing

---

## Final Project Structure

```text
aescion-job-portal-source/
│
├── frontend/                     # React + Vite Frontend Application
│   ├── src/
│   │   ├── components/           # Navbar, Hero, ProtectedRoute, AuthenticatedLayout
│   │   ├── context/              # AuthContext (global state & session check)
│   │   ├── data/                 # Realistic mock data matching Prisma schema
│   │   ├── pages/                # Public pages (Home, Login, Register, etc.)
│   │   │   └── dashboard/        # 7 Authenticated user dashboard pages
│   │   ├── services/             # Centralized API client (apiClient.ts)
│   │   ├── styles/               # Scoped auth styles
│   │   ├── App.tsx               # Primary application router
│   │   └── main.tsx              # React entry point with AuthProvider & QueryClient
│   ├── public/
│   ├── .env                      # Frontend environment config (VITE_API_BASE_URL)
│   ├── .env.example              # Example frontend environment variables
│   ├── index.html
│   ├── package.json              # Frontend dependencies & scripts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/                      # Node.js + Express + Prisma Backend REST API
│   ├── src/
│   │   ├── config/               # Environment validation (env.ts)
│   │   ├── controllers/          # Request handlers (auth, jobs)
│   │   ├── middleware/           # Auth guard, role check, error handling
│   │   ├── routes/               # Express API router definitions
│   │   ├── utils/                # Prisma client, JWT, password hashing
│   │   ├── app.ts                # Express app configuration
│   │   └── server.ts             # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma         # PostgreSQL Prisma schema
│   │   └── migrations/           # Database migration files
│   ├── .env                      # Backend environment config (DATABASE_URL, JWT_SECRET)
│   ├── .env.example              # Example backend environment variables
│   ├── package.json              # Backend dependencies & scripts
│   └── tsconfig.json
│
├── aescion-login/                # Integrated authentication UI components
├── README.md                     # Complete project documentation
└── .gitignore
```

---

## Requirements

Ensure you have the following installed on your machine:

- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **PostgreSQL**: `v14.0` or higher

---

## PostgreSQL Database Setup

1. Start your local **PostgreSQL** service.
2. Create a database named `aescion_job_portal`:
   ```bash
   createdb -U postgres aescion_job_portal
   ```
   *(Or create it via pgAdmin / DBeaver / your preferred GUI client).*

3. Configure your database credentials in `backend/.env`:
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/aescion_job_portal?schema=public"
   ```

---

## Installation

Install dependencies for both frontend and backend independently:

### 1. Frontend Dependencies
```bash
cd frontend
npm install
```

### 2. Backend Dependencies
```bash
cd backend
npm install
```

---

## Database Setup & Migrations

Navigate to the `backend/` folder and run the Prisma commands:

```bash
cd backend

# Generate the Prisma Client
npx prisma generate

# Run database migrations to create tables in PostgreSQL
npx prisma migrate dev --name init
```

*(Optional) To inspect your database tables via Prisma Studio:*
```bash
npx prisma studio
```

---

## Development Workflow

Running the application requires **two open terminals** (plus your running PostgreSQL service):

### Terminal 1: Backend Server (Port 5000)
```bash
cd backend
npm run dev
```
- **Backend API URL**: `http://localhost:5000`
- **Health Check Endpoint**: `http://localhost:5000/api/health`

### Terminal 2: Frontend Client (Port 5173)
```bash
cd frontend
npm run dev
```
- **Frontend App URL**: `http://localhost:5173`

---

## API Health Check

Before testing the login/register flow, verify that the backend API is online by opening your browser or running:

```bash
curl http://localhost:5000/api/health
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Aescion API is running"
}
```

---

## Login & Registration Architecture

```text
               PostgreSQL Database (aescion_job_portal)
                                 ▲
                                 │ Prisma ORM
                                 ▼
                     Express.js Backend API
                     (http://localhost:5000)
                                 ▲
                                 │ REST API / CORS / Credentials (Cookie)
                                 ▼
                    React / Vite Frontend Client
                     (http://localhost:5173)
                                 │
           ┌─────────────────────┴─────────────────────┐
           ▼                                           ▼
      /register                                     /login
(aescion-login Register UI)                   (aescion-login Login UI)
           │                                           │
           └─────────────────────┬─────────────────────┘
                                 ▼
                     Authentication Established
                                 │
                                 ▼
                         /home (Dashboard)
                                 │
  [Home | Resume Builder | Connections | Explore Jobs |
   Application Tracker | Services | Invite]
```

---

## Troubleshooting Guide

### "Unable to connect to the server" Error on Login/Register

If you see this notification when clicking **Login** or **Create Account**, follow this checklist:

1. **Is the Backend Running?**
   Make sure you ran `npm run dev` inside `backend/` and that `http://localhost:5000/api/health` responds in your browser.
2. **Is PostgreSQL Running?**
   Ensure your local PostgreSQL server is active on port `5432`.
3. **Is `DATABASE_URL` Correct?**
   Check `backend/.env` and ensure `postgres:password` matches your actual PostgreSQL credentials.
4. **Is `VITE_API_BASE_URL` Configured?**
   Verify `frontend/.env` contains `VITE_API_BASE_URL=http://localhost:5000/api`.
5. **Are Database Tables Created?**
   Ensure you ran `npx prisma migrate dev` inside `backend/`.
6. **Is CORS Configured?**
   `backend/src/app.ts` is configured to accept requests from `http://localhost:5173` with `credentials: true`.

---

## Environment Variables Reference

### `frontend/.env`
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### `backend/.env`
```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/aescion_job_portal?schema=public"
JWT_SECRET="super_secret_jwt_key_12345!@#$%"
PORT=5000
FRONTEND_URL="http://localhost:5173"
```

---

## Development Commands Summary

| Task | Location | Command |
| :--- | :--- | :--- |
| **Start Frontend** | `frontend/` | `npm run dev` |
| **Build Frontend** | `frontend/` | `npm run build` |
| **Start Backend** | `backend/` | `npm run dev` |
| **Build Backend** | `backend/` | `npm run build` |
| **Prisma Generate**| `backend/` | `npx prisma generate` |
| **Prisma Migrate** | `backend/` | `npx prisma migrate dev` |
| **Prisma Studio**  | `backend/` | `npx prisma studio` |
| **Seed Super Admin** | `backend/` | `node prisma/seed-admin.js` |

---

## Super Admin Portal

AESCION includes a **Super Admin** role that provides full platform management capabilities.

### Super Admin Login

| Field | Value |
| :--- | :--- |
| **Login URL** | `http://localhost:5173/admin` |
| **Email** | `admin@aescion.com` |
| **Password** | `Admin@123456` |

> **Important:** The `/admin` route is exclusively for Super Admin access. Job Seekers and Company Admins cannot access this portal.

### How to Access the Admin Portal

1. Start the backend and frontend servers
2. Open `http://localhost:5173/admin` in your browser
3. Enter the Super Admin credentials above
4. You will be redirected to the Admin Dashboard

### Creating Additional Super Admin Accounts

Run the seed script with different environment variables:

```bash
cd backend

# Using defaults (admin@aescion.com / Admin@123456)
node prisma/seed-admin.js

# Using custom credentials
ADMIN_EMAIL="newadmin@aescion.com" ADMIN_PASSWORD="MyPass123" node prisma/seed-admin.js
```

Or create directly via Prisma Studio:

```bash
npx prisma studio
```

Then add a new User with `role` set to `SUPER_ADMIN`.

### Admin Portal Features

| Section | Route | Description |
| :--- | :--- | :--- |
| **Dashboard** | `/admin/dashboard` | Platform statistics and overview |
| **Job Seekers** | `/admin/job-seekers` | Manage job seeker accounts |
| **Company Admins** | `/admin/company-admins` | Manage company admin accounts |
| **Companies** | `/admin/companies` | Company verification and management |
| **Jobs** | `/admin/jobs` | Job moderation and management |
| **Applications** | `/admin/applications` | Application monitoring |
| **Feed Sources** | `/admin/job-feeds` | External job feed configuration |
| **Sync History** | `/admin/job-feeds/sync-history` | Feed synchronization logs |
| **Failed Jobs** | `/admin/job-feeds/failed-jobs` | Failed feed imports and retry |
| **Categories** | `/admin/categories` | Job category management |
| **Skills** | `/admin/skills` | Skill management and merging |
| **Reports** | `/admin/reports` | Platform report management |
| **Analytics** | `/admin/analytics` | Real-time platform analytics |
| **Security** | `/admin/security` | Security monitoring center |
| **Audit Logs** | `/admin/audit-logs` | Admin action audit trail |
| **Notifications** | `/admin/notifications` | Notification management |
| **ATS Settings** | `/admin/ats-settings` | ATS engine configuration |
| **Platform Settings** | `/admin/settings` | Platform-wide settings |

### Admin API Endpoints

All admin API endpoints are prefixed with `/api/admin` and require `SUPER_ADMIN` role authentication.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/admin/auth/login` | Admin login |
| POST | `/api/admin/auth/logout` | Admin logout |
| GET | `/api/admin/auth/me` | Get current admin |
| GET | `/api/admin/dashboard` | Dashboard statistics |
| GET | `/api/admin/job-seekers` | List job seekers |
| PATCH | `/api/admin/job-seekers/:id/suspend` | Suspend user |
| PATCH | `/api/admin/job-seekers/:id/activate` | Activate user |
| PATCH | `/api/admin/job-seekers/:id/block` | Block user |
| GET | `/api/admin/companies` | List companies |
| PATCH | `/api/admin/companies/:id/verify` | Verify company |
| PATCH | `/api/admin/companies/:id/reject` | Reject company |
| PATCH | `/api/admin/companies/:id/suspend` | Suspend company |
| GET | `/api/admin/jobs` | List jobs |
| PATCH | `/api/admin/jobs/:id/approve` | Approve job |
| PATCH | `/api/admin/jobs/:id/reject` | Reject job |
| PATCH | `/api/admin/jobs/:id/suspend` | Suspend job |
| GET | `/api/admin/applications` | List applications |
| GET | `/api/admin/job-feeds` | List feed sources |
| POST | `/api/admin/job-feeds` | Create feed source |
| POST | `/api/admin/job-feeds/:id/sync` | Trigger sync |
| GET | `/api/admin/categories` | List categories |
| POST | `/api/admin/categories` | Create category |
| GET | `/api/admin/skills` | List skills |
| POST | `/api/admin/skills` | Create skill |
| GET | `/api/admin/reports` | List reports |
| GET | `/api/admin/analytics` | Analytics data |
| GET | `/api/admin/security` | Security data |
| GET | `/api/admin/audit-logs` | Audit logs |
| GET | `/api/admin/notifications` | Notifications |
| GET | `/api/admin/settings` | Platform settings |
| PATCH | `/api/admin/settings` | Update settings |

### Three User Roles

| Role | Login URL | Description |
| :--- | :--- | :--- |
| **JOB_SEEKER** | `http://localhost:5173/login` | Job seekers looking for opportunities |
| **COMPANY_ADMIN** | `http://localhost:5173/login` | Company administrators managing jobs |
| **SUPER_ADMIN** | `http://localhost:5173/admin` | Platform administrators with full access |
