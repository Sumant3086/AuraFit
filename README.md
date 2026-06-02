# AuraFit

**AI-powered fitness platform.** Personalized workouts, smart nutrition, QR gym check-ins, trainer bookings, and gamified progress — in one web app.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-aurafitgymwebsite.onrender.com-9d00ff?style=flat)](https://aurafitgymwebsite.onrender.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green?style=flat)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue?style=flat)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-00ed64?style=flat)](https://www.mongodb.com/atlas)
[![License](https://img.shields.io/badge/License-MIT-lightgrey?style=flat)](LICENSE)

---

## Overview

AuraFit is a full-stack SaaS fitness platform built with the MERN stack. It combines AI-generated workout and nutrition plans (via Google Gemini), real-time gym check-ins, a social community, gamification, and a multi-role admin dashboard.

**Live:** [https://aurafitgymwebsite.onrender.com](https://aurafitgymwebsite.onrender.com/)

---

## Features

### For Members
- **AI Workout Generator** — Gemini AI builds a weekly training plan from your goals, schedule, and equipment
- **Nutrition Calculator** — Macro targets and meal suggestions tailored to your body composition
- **QR Check-In** — Scan at the gym front desk; attendance tracked automatically with streak rewards
- **Progress Tracking** — Log weight, body fat, and measurements; view trends over time
- **Gamification** — Points, level system, achievement badges, and a community leaderboard
- **Trainer Booking** — Browse trainer profiles, book sessions, submit reviews
- **Community Feed** — Post updates, like and comment; real-time via WebSocket
- **AI Fitness Assistant** — Floating chat widget powered by Gemini for on-demand coaching
- **PWA** — Installable on mobile; works offline with service worker caching

### For Admins
- **Dashboard** — Member stats, attendance trends, order management
- **Business KPIs** — MRR, churn rate, retention, DAU/MAU, conversion funnel
- **User Management** — Role assignment, membership approval, suspension
- **Announcements** — Push gym-wide notifications to all members
- **Analytics** — Revenue charts, membership distribution, user growth
- **Audit Logs** — Immutable log of all admin actions

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Framer Motion, react-hot-toast |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Auth** | JWT (access + refresh tokens), bcryptjs |
| **AI** | Google Gemini API |
| **Payments** | Razorpay (payment gateway + webhooks) |
| **Real-time** | Socket.IO (WebSocket) |
| **Email** | Nodemailer (Gmail SMTP) |
| **PDF** | PDFKit |
| **Security** | Helmet, CORS, express-rate-limit, input sanitization |
| **Logging** | Winston (structured logs, file rotation) |
| **Deployment** | Render (web service + static files) |
| **PWA** | vite-plugin-pwa, Workbox |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- MongoDB Atlas account (free tier works)
- Google AI Studio account (for Gemini API key)

### Local Setup

```bash
# 1. Clone
git clone https://github.com/Sumant3086/AuraFit.git
cd AuraFit

# 2. Install all dependencies
npm install
cd server && npm install && cd ..

# 3. Configure environment
cp server/.env.example server/.env
cp .env.example .env
# Edit both files with your values (see Environment Variables below)

# 4. Start development servers (client + server concurrently)
npm run dev
```

The client runs at `http://localhost:3000` and the API at `http://localhost:5000`.

### Environment Variables

**`server/.env`** (backend — never commit):

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | JWT signing secret (32+ chars) |
| `JWT_REFRESH_SECRET` | ✅ | Refresh token secret (different from above) |
| `GOOGLE_API_KEY` | Recommended | Google Gemini API key |
| `RAZORPAY_KEY_ID` | Recommended | Razorpay test/live key |
| `RAZORPAY_KEY_SECRET` | Recommended | Razorpay key secret |
| `EMAIL_USER` | Optional | Gmail address for emails |
| `EMAIL_APP_PASSWORD` | Optional | Gmail App Password (16 chars) |
| `ADMIN_EMAIL` | Optional | Default admin account email |
| `CLIENT_URL` | Optional | Frontend URL for CORS (default: localhost:3000) |

**`.env`** (frontend Vite — non-secret only):

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend URL (e.g. `/api` in production) |
| `VITE_RAZORPAY_KEY_ID` | Razorpay public key ID |

### First Run

After starting the dev server:

1. Go to `http://localhost:3000/signup` and create an account
2. To create an admin: sign up with the email matching `ADMIN_EMAIL` in `server/.env`
3. Or use `POST /api/seed` (admin-only) to generate demo data

---

## Project Structure

```
AuraFit/
├── src/                    # React frontend
│   ├── assets/             # Images, logos
│   ├── brand/              # Design tokens, brand constants
│   ├── components/         # Feature components
│   │   ├── admin/          # Admin dashboard
│   │   ├── auth/           # Login, signup, forgot password
│   │   ├── common/         # Shared: ErrorBoundary, PageWrapper, etc.
│   │   ├── dashboard/      # Member dashboard
│   │   ├── gamification/   # Leaderboard, achievements
│   │   ├── landing/        # Landing page sections
│   │   ├── social/         # Community feed
│   │   ├── settings/       # User settings
│   │   └── trainers/       # Trainer directory + profiles
│   ├── context/            # AuthContext, ThemeContext, SocketContext
│   ├── hooks/              # Custom hooks
│   ├── services/           # API client
│   └── styles/             # Global CSS, design tokens
│
├── server/                 # Express API
│   ├── config/             # Database connection
│   ├── jobs/               # Cron jobs (streak reminders, etc.)
│   ├── middleware/         # Auth, security, logging, audit
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API route handlers
│   ├── services/           # Business logic (email, notifications, AI)
│   ├── socket/             # WebSocket server
│   └── utils/              # Env validation, helpers
│
├── public/                 # Static assets (favicon, icons, sitemap)
├── .github/workflows/      # CI/CD (GitHub Actions)
├── render.yaml             # Render deployment config
└── package.json
```

---

## API Reference

Base URL: `https://aurafitgymwebsite.onrender.com/api`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/signup` | — | Create account |
| `POST` | `/auth/login` | — | Sign in, get JWT |
| `GET` | `/auth/me` | JWT | Get current user |
| `GET` | `/achievements/leaderboard` | JWT | Leaderboard data |
| `GET` | `/attendance/stats/me` | JWT | My check-in stats |
| `POST` | `/attendance/self-checkin` | JWT | Quick check-in |
| `GET` | `/social/feed` | JWT | Community posts |
| `POST` | `/social` | JWT | Create post |
| `GET` | `/trainers` | — | List all trainers |
| `POST` | `/ai-chat/message` | JWT | Chat with AuraBot |
| `GET` | `/reports/progress` | JWT | Download PDF report |
| `GET` | `/api/health` | — | Server health check |

Full API documentation available in the codebase — see `server/routes/`.

---

## Deployment

### Render (recommended — free tier)

1. Fork this repo and push to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Connect your GitHub repo — Render detects `render.yaml` automatically
4. Set environment variables in the Render dashboard (see above)
5. Deploy — the `render-build` script handles everything

The `render.yaml` in this repo configures:
- Build: `npm ci && npm run build && cd server && npm ci`
- Start: `cd server && node server.js`
- Health check: `/api/health`

### MongoDB Atlas Setup

1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a database user with read/write access
3. Add `0.0.0.0/0` to IP allowlist (for Render's dynamic IPs)
4. Copy the connection string to `MONGODB_URI` in Render's env vars

---

## Architecture Notes

- **JWT authentication** with 15-minute access tokens and 7-day refresh tokens; session tracking per device
- **Rate limiting** on all API routes (100 req/15min general, 5 req/15min auth)
- **WebSocket** (Socket.IO) for real-time community posts, notifications, and leaderboard updates
- **Cron jobs** (node-cron) for streak reminders, membership expiry alerts, and re-engagement emails
- **Audit logging** for all admin actions with 1-year TTL
- **PWA** with Workbox service worker — offline-capable, installable

---

## Screenshots

> Screenshots available at the [live demo](https://aurafitgymwebsite.onrender.com/).

---

## Author

**Sumant Yadav**
- GitHub: [@Sumant3086](https://github.com/Sumant3086)
- Email: sumantyadav3086@gmail.com

---

## License

MIT — see [LICENSE](LICENSE) for details.
