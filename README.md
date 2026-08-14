# Bookora — Universal Booking Management System

Production-ready, white-label booking platform for clinics, salons, gyms, consultants, and more.

**Status: Phases 1–8 complete (core platform ready)**

---

## Features

- White-label design system (Deep Teal / Warm Sand / Muted Coral)
- Full Arabic + English with RTL/LTR
- Role-based access (Super Admin, Owner, Manager, Staff, Customer)
- JWT + HTTP-only refresh cookies
- Business / Services / Categories / Staff management
- Availability engine with conflict protection
- Booking flow APIs (create, cancel, reschedule)
- Admin & Customer dashboards + analytics
- In-app notifications (email/SMS architecture)
- Reviews & ratings
- Seed data for quick demos

---

## Tech Stack

| Layer    | Stack                                      |
|----------|--------------------------------------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4 |
| State    | TanStack Query, React Context              |
| Forms    | React Hook Form + Zod                      |
| i18n     | i18next + react-i18next                    |
| Charts   | Recharts                                   |
| Backend  | Node.js, Express, TypeScript               |
| Database | MongoDB + Mongoose                         |
| Auth     | JWT + bcrypt + HTTP-only cookies           |

---

## Project Structure

```
booking-system/
├── client/                 # React frontend
│   └── src/
│       ├── components/     # UI + shared + dashboard
│       ├── config/         # businessConfig
│       ├── i18n/           # en + ar
│       ├── layouts/
│       ├── pages/
│       ├── routes/
│       ├── services/       # API clients
│       └── store/
├── server/                 # Express API
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middlewares/    # auth, rate limit, validate, errors
│       ├── models/
│       ├── routes/
│       ├── services/
│       ├── validators/
│       └── jobs/seed.ts
└── README.md
```

---

## Quick Start

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)

### Install

```bash
cd client && npm install && cd ..
cd server && npm install && cd ..
```

### Environment

```bash
cp server/.env.example server/.env
# Edit MONGODB_URI, JWT secrets, CLIENT_URL

cp client/.env.example client/.env
# VITE_API_URL=http://localhost:5000/api/v1
```

### Seed demo data

```bash
cd server && npm run seed
```

**Demo accounts** (password: `Password123`):

| Email                 | Role            |
|-----------------------|-----------------|
| owner@bookora.app     | business_owner  |
| manager@bookora.app   | manager         |
| staff@bookora.app     | staff           |
| customer@bookora.app  | customer         |

Business slug: `cairo-care`

### Run

```bash
# API
cd server && npm run dev

# Frontend
cd client && npm run dev
```

- Frontend: http://localhost:5173
- API health: http://localhost:5000/api/v1/health

---

## API Overview

```
/api/v1/auth           register, login, refresh, logout, me
/api/v1/businesses     CRUD + categories + services + staff
/api/v1/bookings       availability, create, list, cancel, reschedule
/api/v1/analytics      overview, trends, popular services, revenue
/api/v1/notifications  list, mark read
/api/v1/reviews        list, create, reply
```

---

## Security (Phase 7)

- Helmet security headers
- CORS allowlist
- Rate limiting (API / auth / bookings)
- Zod validation on inputs
- bcrypt password hashing
- HTTP-only refresh cookies
- No secrets in frontend
- Body size limits

---

## Deployment

### Frontend → Vercel
- Root directory: `client`
- Build command: `npm run build`
- Output: `dist`
- Env: `VITE_API_URL=https://your-api.example.com/api/v1`

### Backend → Railway / Render
- Root: `server`
- Start: `npm run build && npm start` (or tsx)
- Set all env vars from `.env.example`
- `CLIENT_URL` = your Vercel URL
- `NODE_ENV=production`

### Database → MongoDB Atlas
- Create cluster + user
- Network access for host IPs
- Put URI in `MONGODB_URI`

---

## Production Checklist

- [ ] Strong unique JWT secrets (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`)
- [ ] NODE_ENV=production
- [ ] MongoDB Atlas with auth (`MONGODB_URI`)
- [ ] CLIENT_URL = exact frontend origin (CORS + reset links)
- [ ] VITE_API_URL = API base including `/api/v1` (Vercel env)
- [ ] HTTPS (required for SameSite=None refresh cookies)
- [ ] Never run seed in production
- [ ] Public register always creates `customer` only

---

## Future improvements

- Public Landing Page + multi-step Booking wizard UI
- Full Admin CRUD UIs (Services, Staff, Calendar)
- Email (Resend/SendGrid) + SMS (Twilio)
- Automated tests
- Multi-tenant SaaS billing

---

Built as a commercially sellable white-label product.
