# Frontend apps split

Energy Horizon uses **three independent frontends** + one shared API.

```
apps/
  api/       NestJS + Prisma + PostgreSQL (shared)
  website/   Corporate site  → www
  store/     B2B store       → store
  admin/     Admin panel     → admin
```

## Local development

```bash
npm install
npm run dev:api
npm run dev:website   # :5173
npm run dev:store     # :5174
npm run dev:admin     # :5175
```

Each app has its own `.env` (`VITE_API_URL`, `VITE_SITE_URL`, `VITE_STORE_URL`, `VITE_ADMIN_URL`).

## Production (Vercel)

Create **3 Vercel projects** from the same GitHub repo (`hassan2-dev/sales`).  
Do **not** deploy the monorepo root — that causes `404 NOT_FOUND`.

| Project | Root Directory | Domain |
|---------|----------------|--------|
| energy-website | `apps/website` | `www` / apex |
| energy-store | `apps/store` | `store.` |
| energy-admin | `apps/admin` | `admin.` |

Each app already has `vercel.json` (install from repo root, build that app, SPA rewrite → `index.html`).

### Domains (one domain per Vercel project)

| App | Root Directory | Domain |
|-----|----------------|--------|
| Website | `apps/website` | `www.energy-horizon.net` |
| Store | `apps/store` | `store.energy-horizon.net` |
| Admin | `apps/admin` | `admin.energy-horizon.net` |

### Env vars (same on all three projects, Production)

```
VITE_API_URL=https://api.energy-horizon.net/api
VITE_SITE_URL=https://www.energy-horizon.net
VITE_STORE_URL=https://store.energy-horizon.net
VITE_ADMIN_URL=https://admin.energy-horizon.net
```

Optional: `VITE_LOGO_URL=https://…`

Redeploy after changing `VITE_*` (they are baked in at build time).

API stays on Coolify — only the three static frontends go to Vercel.
