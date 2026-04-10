# Koyeb Backend Deployment Guide

This guide walks you through deploying the Pantheon FastAPI backend to [Koyeb](https://www.koyeb.com) using the existing Docker setup.

---

## Architecture

```
GitHub (backend/) → Koyeb (Docker container, port 8000)
                         ↑
              Cloudflare Pages frontend makes API calls here
```

---

## Prerequisites

- A [Koyeb account](https://app.koyeb.com/signup) (free tier available)
- Your GitHub repository forked or connected to Koyeb
- A PostgreSQL database (e.g. [Neon](https://neon.tech), [Supabase](https://supabase.com), or any managed Postgres)

---

## Step 1 – Create a Koyeb Account

1. Go to <https://app.koyeb.com/signup> and sign up.
2. Verify your email address.
3. From the Koyeb dashboard, click **"Create App"**.

---

## Step 2 – Connect Your GitHub Repository

1. In the Koyeb dashboard choose **"Deploy from GitHub"**.
2. Authorize the Koyeb GitHub App and select the `Aboyisalive/Pantheon` repository.
3. Set the **branch** to `main` (or your production branch).

---

## Step 3 – Configure the Build

| Setting | Value |
|---|---|
| **Build method** | Dockerfile |
| **Dockerfile path** | `backend/Dockerfile` |
| **Build context** | `backend` |

> Koyeb detects the `Dockerfile` automatically when you point the build context to `backend/`.

---

## Step 4 – Port Configuration

| Setting | Value |
|---|---|
| **Exposed port** | `8000` |
| **Protocol** | `HTTP` |

---

## Step 5 – Environment Variables

Set the following environment variables in the Koyeb **"Environment variables"** panel:

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/pantheon` |
| `SECRET_KEY` | Random secret for JWT signing | `openssl rand -hex 32` output |
| `OPENAI_API_KEY` | API key for Google GenAI / OpenAI | `sk-...` or `AIza...` |
| `FRONTEND_URL` | Comma-separated allowed frontend origins | `https://pantheon.pages.dev,http://localhost:5173` |
| `PORT` | Port Uvicorn listens on (optional) | `8000` |

### Generating a secure SECRET_KEY

```bash
python -c "import secrets; print(secrets.token_hex(32))"
# or
openssl rand -hex 32
```

### FRONTEND_URL for CORS

The backend accepts a **comma-separated** list of origins so you can allow both
your Cloudflare Pages domain and localhost during development:

```
FRONTEND_URL=https://pantheon.pages.dev,http://localhost:5173
```

Replace `pantheon.pages.dev` with your actual Cloudflare Pages domain (or custom domain).

---

## Step 6 – Health Check

Koyeb can monitor your service using the built-in health endpoint.

| Setting | Value |
|---|---|
| **Path** | `/api/v1/health` |
| **Protocol** | `HTTP` |
| **Port** | `8000` |
| **Initial delay** | `10s` |

The health endpoint returns:

```json
{ "status": "healthy", "service": "chatbot-backend" }
```

---

## Step 7 – Deploy

1. Click **"Deploy"** – Koyeb will pull the code, build the Docker image, and start the container.
2. Wait for the deployment to reach the **"Healthy"** state (usually 2–4 minutes).
3. Copy the public URL shown in the dashboard (e.g. `https://pantheon-<hash>.koyeb.app`).

---

## Step 8 – Verify Deployment

Open the following URLs in your browser (replace with your actual Koyeb URL):

```
https://your-app.koyeb.app/
→ {"message": "API is running!"}

https://your-app.koyeb.app/api/v1/health
→ {"status": "healthy", "service": "chatbot-backend"}
```

---

## Updating the Deployment

Koyeb automatically redeploys when you push to the configured branch. To trigger
a manual redeploy, click **"Redeploy"** in the Koyeb dashboard.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Container crashes on start | Missing `DATABASE_URL` | Add the env var in Koyeb settings |
| CORS errors in browser | `FRONTEND_URL` not set | Set `FRONTEND_URL` to your Cloudflare Pages domain |
| 500 errors on `/api/v1/chat` | Missing `OPENAI_API_KEY` | Add the API key in Koyeb settings |
| Build fails | Wrong Dockerfile path | Set build context to `backend` and Dockerfile to `Dockerfile` |
