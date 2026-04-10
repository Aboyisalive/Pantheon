# Pantheon Deployment Guide

This document gives a high-level overview of the production deployment
architecture and links to the detailed per-platform guides.

---

## Architecture

```
┌─────────────────────────────────────────────┐
│         GitHub Repository                   │
│        Aboyisalive/Pantheon                 │
└──────────┬──────────────────────┬───────────┘
           │ push to main         │ push to main
           ▼                      ▼
     ┌───────────┐         ┌────────────────────┐
     │   Koyeb   │         │  Cloudflare Pages  │
     │  Backend  │◄────────│    Frontend        │
     │ (FastAPI) │  API     │  (React + Vite)    │
     │  port 8000│  calls   │  global CDN        │
     └───────────┘         └────────────────────┘
           │
           ▼
     PostgreSQL DB
     (Neon / Supabase / etc.)
```

| Layer | Platform | Auto-deploy |
|---|---|---|
| Backend API | [Koyeb](https://koyeb.com) – Docker container | ✅ on push |
| Frontend | [Cloudflare Pages](https://pages.cloudflare.com) – static CDN | ✅ on push |
| Database | Any managed PostgreSQL (e.g. Neon, Supabase) | n/a |

---

## Quick Start

### 1 – Prepare environment variables

```bash
cp .env.example .env
# Edit .env and fill in all values
```

See [Environment Variable Checklist](#environment-variable-checklist) below.

### 2 – Deploy the backend to Koyeb

Follow [KOYEB_DEPLOYMENT.md](./KOYEB_DEPLOYMENT.md).  
You will end up with a URL like `https://your-app.koyeb.app`.

### 3 – Deploy the frontend to Cloudflare Pages

Follow [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md).  
Set `VITE_API_URL=https://your-app.koyeb.app` in the Cloudflare project settings.

### 4 – Update CORS on Koyeb

Once you have your Cloudflare Pages URL, set the `FRONTEND_URL` environment
variable on Koyeb to include it:

```
FRONTEND_URL=https://pantheon.pages.dev,http://localhost:5173
```

Koyeb will redeploy the backend automatically.

---

## Local Development

Run the backend only (the frontend can be served with `npm run dev`):

```bash
cp .env.example .env
# Edit .env with your local values

docker-compose up --build
```

The backend will be available at `http://localhost:8000`.

For the frontend:

```bash
cd frontend/pantheon
cp .env.example .env          # VITE_API_URL=http://127.0.0.1:8000
npm install
npm run dev                   # http://localhost:5173
```

---

## Environment Variable Checklist

### Backend (Koyeb / docker-compose)

- [ ] `DATABASE_URL` – PostgreSQL connection string
- [ ] `SECRET_KEY` – Random 32-byte hex string for JWT signing
- [ ] `OPENAI_API_KEY` – API key for Google GenAI / OpenAI
- [ ] `FRONTEND_URL` – Comma-separated allowed origins (include your Cloudflare domain)

### Frontend (Cloudflare Pages)

- [ ] `VITE_API_URL` – Full URL of the Koyeb backend (no trailing slash)

---

## Detailed Guides

- **Backend** → [KOYEB_DEPLOYMENT.md](./KOYEB_DEPLOYMENT.md)
- **Frontend** → [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md)

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Frontend shows CORS error | Add Cloudflare domain to `FRONTEND_URL` on Koyeb and redeploy |
| API calls return 404 | Check `VITE_API_URL` in Cloudflare Pages env vars |
| Login / register fails | Verify `DATABASE_URL` and `SECRET_KEY` are set on Koyeb |
| Backend unhealthy on Koyeb | Check Koyeb logs; ensure all env vars are set |
| Build fails on Cloudflare | Confirm **Root directory** is `frontend/pantheon` |
