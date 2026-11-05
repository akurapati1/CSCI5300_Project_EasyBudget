# EasyBudget — Personal Finance Manager

A full-stack personal-finance web app for tracking **income, expenses and savings goals**, with a live dashboard, charts and secure account management. Built as the **CSCI 5300** course project (React + Express + MongoDB) and since hardened and cleaned up.

> **Looking to deploy it?** The [EasyBudgetProductionRepo](https://github.com/akurapati1/EasyBudgetProductionRepo) edition adds Dockerfiles, Docker Compose and deployment notes on top of the same code. This repository is the simple, run-it-locally version.

## Features
- **Accounts** — registration with strong-password rules, JWT login, **forgot / reset password by e-mail** (single-use, expiring links)
- **Budget tracking** — record weekly / bi-weekly / monthly income and expenses; delete entries
- **Dashboard** — totals, net savings, savings rate, budget utilisation and expense breakdown
- **Charts & analytics** — 6-month income-vs-expense trend, this-month summary, expense breakdown (Chart.js)
- **Savings goals** — target amounts with allocated percentage of income
- **Calendar view** of recurring entries

## Tech stack
| Layer | Technology |
|---|---|
| Frontend | React 18, React Router 6, Context API + reducer, Axios, Chart.js, styled-components |
| Backend | Node.js 20, Express 4, Mongoose 8 (MongoDB), JWT, bcrypt, Nodemailer |
| Security | helmet, CORS allow-list, rate-limited `/auth`, input validation, hashed reset tokens, NoSQL-injection guards |
| DevOps | GitHub Actions (backend tests, client tests + production build) |

## Architecture
```
React SPA (client/)  ──HTTPS/JSON──▶  Express API (Backend/)  ──▶  MongoDB
  AuthContext (session)                 /auth/*      routes → controllers → Mongoose models
  UserContext (budget data)             /api/budget/* (JWT-protected)
```
All user data lives on one `User` document with embedded `income[]`, `expenses[]` and `savingsGoals[]` arrays. See [`HighLevelDesignDocument.md`](HighLevelDesignDocument.md) for the full design.

## Quick start

### Run locally
Requires Node 18+ and a MongoDB instance (local or Atlas).
```bash
# API
cd Backend
cp .env.example .env        # set MONGODB_URI and JWT_SECRET
npm install
npm run dev                 # http://localhost:5001

# Client (new terminal)
cd client
cp .env.example .env        # REACT_APP_API_URL=http://localhost:5001
npm install
npm start                   # http://localhost:3000
```

## API
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | – | `{username, email, password}` (password: 8+ chars, upper, lower, digit, symbol) |
| POST | `/auth/login` | – | Returns `{token, user}` (token valid 7 days) |
| GET | `/auth/me` | JWT | Current user with income, expenses, goals |
| POST | `/auth/forgot-password` | – | `{email}` — always responds identically (no account enumeration) |
| POST | `/auth/reset-password/:token` | – | `{password}` — token is single-use and expires in 1 hour |
| POST | `/api/budget/income` · `/expense` | JWT | `{date, amount>0, description, frequency}` |
| POST | `/api/budget/saving` | JWT | `{goalName, goalAmount>0, allocatedPercentage (0-100]}` |
| DELETE | `/api/budget/income/:id` · `/expense/:id` · `/saving/:id` | JWT | Remove an entry |
| GET | `/health` | – | Liveness probe |

Send the token as `Authorization: Bearer <token>`. Validation failures return `400 {message}`; bad/expired tokens return `401`.

## Configuration
**Backend (`Backend/.env`)** — see `Backend/.env.example`

| Variable | Required | Purpose |
|---|---|---|
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | JWT signing key — the server refuses to start without both |
| `CLIENT_ORIGIN` | | Allowed CORS origin(s), comma-separated (default `http://localhost:3000`) |
| `EMAIL_SERVICE` / `EMAIL_USER` / `EMAIL_PASS` | | SMTP account for reset e-mails (Gmail needs an App Password) |
| `AUTH_RATE_LIMIT` | | Max `/auth` requests per 15 min per IP (default 100) |

**Client** — `REACT_APP_API_URL` (default `http://localhost:5001`) is baked in at build time.

## Tests & CI
```bash
cd Backend && npm test                 # 17 API tests (in-memory model, no database needed)
cd client  && CI=true npm test -- --watchAll=false
```
GitHub Actions (`.github/workflows/main.yaml`) runs the backend tests and the client tests + production build on every push / PR.

## Project structure
```
Backend/   app.js (Express app) · server.js (DB + listen) · routes/ · controllers/ · middleware/ · models/ · utils/ · tests/
client/    src/Components (pages, dashboard, charts) · src/context (Auth, User) · src/__tests__
.github/workflows/main.yaml · HighLevelDesignDocument.md
```

## Deployment
See [EasyBudgetProductionRepo](https://github.com/akurapati1/EasyBudgetProductionRepo) for Docker images, Compose and hosting notes. In short: set `CLIENT_ORIGIN` to the client URL, build the client with `REACT_APP_API_URL` pointing at the API, and serve both over HTTPS.

## Roadmap
Edit entries, per-category budgets, CSV export, refresh tokens / httpOnly cookie sessions.
