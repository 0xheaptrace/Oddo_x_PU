# TRAVELOOP

Traveloop is a full-stack travel planning app for building, organizing, and sharing trips in one workspace.

It includes itinerary planning, budgeting, packing lists, notes, public sharing, access requests, and trip collaboration basics (activity status + assignee).

---

## Tech Stack

### Frontend
- React + Vite + TypeScript
- Tailwind CSS
- React Router
- Zustand
- React Hook Form + Zod
- Leaflet / React-Leaflet

### Backend
- Node.js + Express
- Prisma ORM
- SQLite (current local default in this repo)
- JWT auth

---

## Project Structure

```text
traveloop/
  backend/    # Express API + Prisma schema/seed
  frontend/   # React app (Vite)
```

---

## Core Features

- User auth (signup/login/forgot/reset password)
- Trip CRUD (create, update, duplicate, delete)
- Itinerary builder (stops, activities, reordering)
- Itinerary views (timeline/list/calendar + map)
- Budget planning with categorized lines
- Packing lists and templates
- Trip notes/journal
- Public sharing modes:
  - `PRIVATE`
  - `UNLISTED` (password-based unlock)
  - `PUBLIC` (request/approval flow for full details)
- Public trips directory + trip copy to workspace

---

## Prerequisites

- Node.js 18+ (Node 20+ recommended)
- npm 9+

---

## Environment Variables

Create/update `backend/.env`:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="replace-with-a-strong-secret"
JWT_EXPIRES_IN="7d"
PORT=4000
NODE_ENV=development
CLIENT_ORIGIN="http://localhost:5173"
UPLOAD_DIR="./uploads"
PUBLIC_BASE_URL="http://localhost:4000"
```

Optional frontend env (`frontend/.env`):

```env
VITE_API_URL="http://localhost:4000/api"
```

If `VITE_API_URL` is not set, frontend defaults to `/api`.

---

## Setup and Run

### 1) Install dependencies

From project root:

```bash
cd backend && npm install
cd ../frontend && npm install
```

---

### 2) Setup database (backend)

```bash
cd backend
npm run db:generate
npm run db:push
npm run db:seed
```

Notes:
- `db:push` applies Prisma schema directly to the local DB.
- `db:seed` inserts sample data (including demo trip/cities).

---

### 3) Start backend

```bash
cd backend
npm run dev
```

Backend runs at: `http://localhost:4000`

Health check: `http://localhost:4000/api/health`

---

### 4) Start frontend

Open a second terminal:

```bash
cd frontend
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Default Scripts

### Backend (`backend/package.json`)
- `npm run dev` - start API with nodemon
- `npm run start` - start API in normal mode
- `npm run db:generate` - generate Prisma client
- `npm run db:push` - sync schema to DB
- `npm run db:migrate` - Prisma migrate dev
- `npm run db:seed` - seed sample data
- `npm run db:studio` - open Prisma Studio

### Frontend (`frontend/package.json`)
- `npm run dev` - start Vite dev server
- `npm run build` - type-check + production build
- `npm run preview` - preview production build
- `npm run lint` - run ESLint

---

## API Base Paths

- Auth: `/api/auth`
- Trips (private): `/api/trips`
- Public directory/share preview: `/api/public`
- Shared trip copy: `/api/share`
- Dashboard: `/api/dashboard`
- Destinations: `/api/destinations`
- Browse activities: `/api/browse-activities`
- Guides: `/api/guides`

---

## Troubleshooting

- **Frontend cannot reach backend**
  - Ensure backend is running on port `4000`.
  - Confirm `CLIENT_ORIGIN` in backend `.env` is `http://localhost:5173`.
  - If needed, set `frontend/.env` with `VITE_API_URL=http://localhost:4000/api`.

- **Prisma/client issues**
  - Re-run:
    - `npm run db:generate`
    - `npm run db:push`

- **Seed fails due to existing/duplicate data**
  - Remove old local DB (`backend/prisma/dev.db`) and run setup again.

---

## Production Notes

- Replace SQLite with PostgreSQL/MySQL for production workloads.
- Set a strong `JWT_SECRET`.
- Set correct `CLIENT_ORIGIN` and public API host.
- Run behind reverse proxy (Nginx/Caddy) with HTTPS.

