<div align="center">

# ✈️ Traveloop

**Plan trips. Build itineraries. Share adventures.**

Traveloop is a full-stack travel planning workspace where you can organize every detail of a trip — from day-by-day itineraries and budgets to packing lists, notes, and collaborative sharing.

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

</div>

---

## What it does

| Feature | Description |
|---|---|
| 🗺️ **Itinerary Builder** | Build stop-by-stop plans with activities, timing, and map view |
| 💰 **Budget Planner** | Track trip spend with categorized budget lines |
| 🎒 **Packing Lists** | Create and reuse packing templates per trip |
| 📓 **Trip Notes** | Journal entries and free-form notes per trip |
| 🔗 **Sharing** | Share trips as Public, Unlisted (password), or Private |
| 📬 **Access Requests** | Visitors request full access; owners approve or reject |
| 📋 **Trip Directory** | Browse public trips and copy them to your own workspace |
| 🌙 **Dark / Light Mode** | Full theme support across the entire UI |

---

## Tech Stack

**Frontend**
- React 18 + Vite + TypeScript
- Tailwind CSS
- Zustand (state management)
- React Hook Form + Zod (forms + validation)
- React Router v6
- Leaflet / React-Leaflet (maps)

**Backend**
- Node.js + Express
- Prisma ORM
- SQLite (local dev) → PostgreSQL / MySQL (production)
- JWT authentication

---

## Prerequisites

- Node.js **18+** (20+ recommended)
- npm **9+**

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/traveloop.git
cd traveloop
```

### 2. Install dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 3. Configure environment

Create `backend/.env`:

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

Optionally create `frontend/.env` (defaults to `/api` if not set):

```env
VITE_API_URL="http://localhost:4000/api"
```

### 4. Set up the database

```bash
cd backend
npm run db:generate   # generate Prisma client
npm run db:push       # sync schema to local DB
npm run db:seed       # load sample trips and data
```

### 5. Run the app

```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — frontend
cd frontend && npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:4000 |
| Health check | http://localhost:4000/api/health |

---

## Scripts

**Backend** (`backend/`)

| Command | Description |
|---|---|
| `npm run dev` | Start API with hot reload (nodemon) |
| `npm run start` | Start API in production mode |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:push` | Sync Prisma schema to database |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed sample data |
| `npm run db:studio` | Open Prisma Studio (visual DB browser) |

**Frontend** (`frontend/`)

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## API Reference

| Prefix | Purpose |
|---|---|
| `/api/auth` | Signup, login, password reset |
| `/api/trips` | Private trip CRUD and all sub-features |
| `/api/public` | Public trip directory + share preview |
| `/api/share` | Copy a shared trip to your workspace |
| `/api/dashboard` | User dashboard summary |
| `/api/destinations` | Destination data |
| `/api/browse-activities` | Activity discovery |
| `/api/guides` | Travel guides |

---

## Trip Sharing Modes

| Mode | Who can see it | Access flow |
|---|---|---|
| `PRIVATE` | Owner only | — |
| `UNLISTED` | Anyone with the link + password | Password unlock |
| `PUBLIC` | Listed in public directory | Request → Approve flow |

Public trips show a preview to everyone. To see the full itinerary, a visitor submits an access request. The trip owner approves or rejects it from their inbox.

---

## Project Structure

```
traveloop/
├── backend/
│   ├── prisma/          # Schema, migrations, seed
│   └── src/
│       ├── controllers/ # Route handlers (trips, auth, itinerary, budget…)
│       ├── middleware/  # Auth, error handling
│       ├── routes/      # Express route definitions
│       ├── utils/       # JWT and helpers
│       └── server.js
├── frontend/
│   └── src/
│       ├── api/         # Axios client setup
│       ├── components/  # Shared UI components + AppShell
│       ├── hooks/       # Custom React hooks
│       ├── pages/       # Route-level page components
│       └── store/       # Zustand stores (auth, UI)
└── README.md
```

---

## Troubleshooting

**Frontend can't reach the backend**
- Make sure the backend is running on port `4000`
- Check that `CLIENT_ORIGIN` in `backend/.env` is `http://localhost:5173`
- If problems persist, set `VITE_API_URL=http://localhost:4000/api` in `frontend/.env`

**Prisma client errors**
```bash
cd backend
npm run db:generate
npm run db:push
```

**Seed fails with duplicate data**
```bash
rm backend/prisma/dev.db
npm run db:push && npm run db:seed
```

---

## Production Checklist

- [ ] Replace SQLite with PostgreSQL or MySQL (`DATABASE_URL` in `.env`)
- [ ] Set a strong, randomly generated `JWT_SECRET`
- [ ] Update `CLIENT_ORIGIN` and `PUBLIC_BASE_URL` to your real domain
- [ ] Run the app behind a reverse proxy (Nginx / Caddy) with HTTPS
- [ ] Set `NODE_ENV=production`
- [ ] Run `npm run build` for the frontend and serve the `dist/` folder

---

## License

MIT © Traveloop
