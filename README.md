# TransUA

Ride and parcel booking service: **Ukraine ↔ Norway / Sweden**

## Stack

- **Backend**: NestJS 10 + Prisma ORM + PostgreSQL + JWT auth
- **Frontend**: Next.js 14 + Tailwind CSS + next-intl (uk / no / sv / pl)
- **Monorepo**: pnpm workspaces

## Prerequisites

- Node.js 20+
- pnpm — `npm i -g pnpm`
- PostgreSQL running locally

## Setup

### 1. Install dependencies
```bash
pnpm install
```

### 2. Backend — configure & migrate
```bash
cd apps/api
cp .env.example .env
# Edit .env — set DATABASE_URL and JWT secrets
npx prisma migrate dev --name init
cd ../..
```

### 3. Frontend — configure
```bash
cd apps/web
cp .env.local.example .env.local
cd ../..
```

### 4. Run dev servers
```bash
pnpm dev
# API  → http://localhost:3001/api
# Web  → http://localhost:3000
```

## Phase 1 — What works now

| Feature | Status |
|---|---|
| Register / Login / Logout | ✅ |
| JWT access + refresh tokens | ✅ |
| `GET /api/users/me` | ✅ |
| `PATCH /api/users/me` | ✅ |
| 4-language UI (uk/no/sv/pl) | ✅ |
| Route protection (server + client) | ✅ |
| User dashboard | ✅ |

## API — Auth endpoints

| Method | Endpoint | Auth |
|---|---|---|
| POST | `/api/auth/register` | public |
| POST | `/api/auth/login` | public |
| POST | `/api/auth/refresh` | public |
| POST | `/api/auth/logout` | JWT |
| GET | `/api/users/me` | JWT |
| PATCH | `/api/users/me` | JWT |

## Coming next

- **Phase 2** — Trip search, seat picker, Stripe payments, PDF tickets
- **Phase 3** — Parcel booking, public tracking by code, SMS (Twilio)
- **Phase 4** — Driver dashboard, admin panel, live GPS tracking
