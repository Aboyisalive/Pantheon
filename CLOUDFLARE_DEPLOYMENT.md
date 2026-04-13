# Cloudflare Pages Frontend Deployment Guide

This guide walks you through deploying the Pantheon React + Vite frontend to
[Cloudflare Pages](https://pages.cloudflare.com).

---

## Architecture

```
GitHub (frontend/pantheon/) → Cloudflare Pages (global CDN)
                                        ↓
                              API calls to Koyeb backend
```

---

## Prerequisites

- A [Cloudflare account](https://dash.cloudflare.com/sign-up) (free tier available)
- Your GitHub repository accessible to Cloudflare
- The Koyeb backend already deployed (see [KOYEB_DEPLOYMENT.md](./KOYEB_DEPLOYMENT.md))

---

## Step 1 – Create a Cloudflare Account

1. Go to <https://dash.cloudflare.com/sign-up> and sign up.
2. From the dashboard, open the **"Workers & Pages"** section in the left sidebar.

---

## Step 2 – Connect Your GitHub Repository

1. Click **"Create application"** → **"Pages"** → **"Connect to Git"**.
2. Authorize the Cloudflare GitHub App and select the `Aboyisalive/Pantheon` repository.
3. Choose the **branch** to deploy from (e.g. `main`).

---

## Step 3 – Configure Build Settings

| Setting | Value |
|---|---|
| **Framework preset** | `Vite` |
| **Build command** | `npm install && npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | `frontend/pantheon` |

> **Important:** set the root directory to `frontend/pantheon` so Cloudflare
> looks for `package.json` in the right place.

---

## Step 4 – Environment Variables

Add the following variable in the **"Environment variables (production)"** section:

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Public URL of the Koyeb backend | `https://your-app.koyeb.app` |

To also set variables for **preview deployments** (pull-request previews), add
them under the **"Environment variables (preview)"** section as well.

> Vite only embeds variables that start with `VITE_` at build time. Do **not**
> put secrets here.

---

## Step 5 – Deploy

1. Click **"Save and Deploy"**.
2. Cloudflare will clone the repo, install dependencies, and build the app.
3. Once complete, your site is live at `https://<project>.pages.dev`.

---

## Step 6 – Verify Deployment

1. Open `https://<project>.pages.dev` in your browser.
2. Log in or register – the app should communicate with the Koyeb backend.
3. Send a chat message to confirm end-to-end connectivity.

---

## Step 7 – Custom Domain (Optional)

1. In the Cloudflare Pages project, click **"Custom domains"** → **"Set up a custom domain"**.
2. Enter your domain (e.g. `app.example.com`).
3. Follow the DNS instructions – Cloudflare manages the SSL certificate automatically.
4. Update the `FRONTEND_URL` environment variable on Koyeb to include the new domain:
   ```
   FRONTEND_URL=https://app.example.com,https://<project>.pages.dev
   ```

---

## Automatic Deployments

Every push to the configured branch triggers a new build and deployment.
Pull requests create isolated **preview URLs** automatically.

To disable automatic deployments, go to the Pages project settings and pause
builds for the relevant branch.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Blank page after deploy | Wrong output directory | Ensure **Build output directory** is `dist` |
| API calls fail with network error | `VITE_API_URL` not set | Add the env var and redeploy |
| CORS error from backend | Backend `FRONTEND_URL` missing | Add your Pages domain to `FRONTEND_URL` on Koyeb |
| Build fails – `package.json` not found | Wrong root directory | Set **Root directory** to `frontend/pantheon` |
| Old code still showing | Browser cache | Hard-refresh (`Ctrl+Shift+R`) or clear cache |
