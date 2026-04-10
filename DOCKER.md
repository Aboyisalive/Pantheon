# Docker Deployment Guide

This guide explains how to run the Pantheon chatbot using Docker Compose.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) ≥ 24
- [Docker Compose](https://docs.docker.com/compose/install/) ≥ 2.20

## Quick Start

1. **Copy the example environment file and fill in your values:**

   ```bash
   cp .env.example .env
   ```

   | Variable | Description |
   |---|---|
   | `DATABASE_URL` | PostgreSQL connection string, e.g. `postgresql://user:pass@host:5432/pantheon` |
   | `SECRET_KEY` | Random secret used to sign JWT tokens |
   | `OPENAI_API_KEY` | Your OpenAI API key |

2. **Build and start all services:**

   ```bash
   docker compose up --build
   ```

3. **Open the app in your browser:**

   ```
   http://localhost
   ```

   The backend API is available at `http://localhost:8000`.

## Services

| Service | Container | Host port | Description |
|---|---|---|---|
| `frontend` | `pantheon-frontend` | 80 | React + Vite app served by Nginx |
| `backend` | `pantheon-backend` | 8000 | FastAPI + Uvicorn API server |

Nginx proxies any request whose path starts with `/api/` to the backend container, so the browser only ever talks to a single origin (`localhost:80`).

## Stopping the stack

```bash
docker compose down
```

To also remove volumes:

```bash
docker compose down -v
```

## Rebuilding after code changes

```bash
docker compose up --build
```
