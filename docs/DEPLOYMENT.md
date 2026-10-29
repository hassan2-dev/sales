# Deployment

## Environment

Copy `.env.example` → `apps/api/.env` and set strong secrets:

- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` (≥ 32 random chars)
- `DATABASE_URL`
- `CORS_ORIGIN` — comma-separated list of the three frontend origins
- Cloudflare R2 credentials (or leave empty for local `./uploads`)

Each frontend: `VITE_API_URL` must point to the public API URL at **build** time.

```bash
cp apps/website/.env.example apps/website/.env
cp apps/store/.env.example apps/store/.env
cp apps/admin/.env.example apps/admin/.env
```

Local ports:

| App | Command | URL |
|-----|---------|-----|
| Website | `npm run dev:website` | http://localhost:5173 |
| Store | `npm run dev:store` | http://localhost:5174 |
| Admin | `npm run dev:admin` | http://localhost:5175 |
| API | `npm run dev:api` | http://localhost:3000/api |

## Subdomains (independent deploys)

| Host | App | Build |
|------|-----|-------|
| `www.domain.com` | `apps/website` | `npm run build:website` → `apps/website/dist` |
| `store.domain.com` | `apps/store` | `npm run build:store` → `apps/store/dist` |
| `admin.domain.com` | `apps/admin` | `npm run build:admin` → `apps/admin/dist` |
| `api.domain.com` | NestJS (`/api`, `/docs`, `/uploads`) | `npm run build:api` |

Shared backend: one NestJS API + one PostgreSQL database for all three frontends.

## Vercel (frontends)

`404 NOT_FOUND` (e.g. `fra1::…`) usually means the project Root Directory is the repo root, or Output Directory is wrong.

1. Vercel → **Add New Project** → import `hassan2-dev/sales`
2. Set **Root Directory** to `apps/website` (then repeat for `apps/store` and `apps/admin`)
3. Framework: Vite — `vercel.json` in each app sets install/build/output + SPA rewrite
4. Add Production env: `VITE_API_URL`, `VITE_SITE_URL`, `VITE_STORE_URL`, `VITE_ADMIN_URL`
5. Deploy → attach custom domain / subdomain

Do not point one Vercel project at the monorepo root. The API is **not** deployed on Vercel.

## Coolify (API server)

Wrong defaults (`php artisan migrate`, `ghcr.io/your-org/your-app`, monorepo root) cause failed deploys.

### 1) PostgreSQL first

Coolify → **New Resource** → **PostgreSQL** → create DB (e.g. `energy_horizon`).  
Copy the internal `DATABASE_URL` Coolify shows (host like `postgres-xxxx`, not localhost).

### 2) API app — Nixpacks (what Coolify may show as deprecated)

Config file: `apps/api/nixpacks.toml`

| Field | Value |
|-------|--------|
| Source | GitHub `hassan2-dev/sales` branch `main` |
| Build Pack | **Nixpacks** |
| Base directory | `apps/api` |
| Port | `3000` |
| Install / Build / Start | *(empty — use nixpacks.toml)* |
| Pre-deployment | *(empty — delete `php artisan …`)* |
| Post-deployment | *(empty)* |
| Custom Docker options | *(empty)* |
| Publish directory | *(empty / ignore for Node API)* |

### 2b) Prefer Dockerfile (recommended)

| Field | Value |
|-------|--------|
| Build Pack | **Dockerfile** |
| Base directory | `/apps/api` |
| Dockerfile location | `/Dockerfile` |
| Port | `3000` |
| Start / Pre / Post | *(empty)* |
| Custom Docker options | *(empty)* |

Public URL example: `https://api.your-domain.com` or the Coolify `*.sslip.io` URL.

### 3) Environment variables

```env
NODE_ENV=production
PORT=3000
API_PREFIX=api
DATABASE_URL=<from Coolify Postgres>
JWT_ACCESS_SECRET=<random ≥32 chars>
JWT_REFRESH_SECRET=<random ≥32 chars>
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
APP_URL=https://api.energy-horizon.net
CORS_ORIGIN=https://www.energy-horizon.net,https://energy-horizon.net,https://store.energy-horizon.net,https://admin.energy-horizon.net
UPLOAD_MAX_SIZE_MB=10
```

Add Cloudflare R2 vars when ready (`R2_ACCOUNT_ID`, keys, `R2_BUCKET`, `R2_PUBLIC_URL`).

### 4) Deploy & seed once

Deploy → open `https://YOUR-API-HOST/docs` (Swagger).  
Seed once (Coolify terminal / one-off exec):

```bash
npx tsx prisma/seed.ts
```

(or run seed from a machine that can reach the same `DATABASE_URL`).  
Admin: `admin@energy-horizon.net` / `Admin@12345` — change after first login.

### 5) Vercel frontends (3 projects)

| Project root | Domain |
|--------------|--------|
| `apps/website` | `www.energy-horizon.net` (+ apex `energy-horizon.net` if needed) |
| `apps/store` | `store.energy-horizon.net` |
| `apps/admin` | `admin.energy-horizon.net` |

Each project gets **its own** domain — do not attach all three to one Vercel project.

Shared build-time env for all three:

```env
VITE_API_URL=https://api.energy-horizon.net/api
VITE_SITE_URL=https://www.energy-horizon.net
VITE_STORE_URL=https://store.energy-horizon.net
VITE_ADMIN_URL=https://admin.energy-horizon.net
```

Redeploy after changing `VITE_*`.

## Docker Compose

```bash
docker compose up -d postgres minio
# migrate + seed locally once, then:
docker compose up -d --build api
```

Example nginx for one frontend (repeat per subdomain):

```nginx
server {
  listen 80;
  server_name admin.domain.com;
  root /var/www/energy-horizon-admin;
  index index.html;

  location / {
    try_files $uri /index.html;
  }
}

server {
  listen 80;
  server_name api.domain.com;

  location /api/ {
    proxy_pass http://127.0.0.1:3000/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }

  location /uploads/ {
    proxy_pass http://127.0.0.1:3000/uploads/;
  }

  location /docs {
    proxy_pass http://127.0.0.1:3000/docs;
  }
}
```

## Object storage (Cloudflare R2)

Uploads go through `StorageService` → Cloudflare R2 when these are set in `apps/api/.env`:

```env
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET=energy-horizon
R2_PUBLIC_URL=https://media.your-domain.com
R2_REGION=auto
```

1. Cloudflare Dashboard → **R2** → create bucket  
2. **Manage R2 API Tokens** → create Access Key ID + Secret  
3. Enable a **public bucket URL** or attach a custom domain → put that in `R2_PUBLIC_URL`  
4. Restart the API — logs should show: `Storage ready: Cloudflare R2`

If R2 keys are empty, the API falls back to `S3_*` (MinIO/AWS) or local `./uploads`.

### Folder layout (professional prefixes)

| Folder | Use |
|--------|-----|
| `products/images/` | Product gallery photos |
| `products/documents/` | Datasheets / PDFs |
| `brands/logos/` | Brand logos |
| `cms/media/` | CMS / marketing assets |
| `users/avatars/` | User avatars |
| `misc/` | Everything else |

Object keys: `{folder}/{yyyy}/{mm}/{uuid}-{filename}`  
Example: `products/images/2026/10/a1b2-pump.jpg`  
Check live status: `GET /api/media/storage` (auth + `media:read`).

## Database migrations

```bash
cd apps/api
npx prisma migrate deploy
```

## Production checklist

- [ ] Rotate JWT secrets
- [ ] Change seed admin password
- [ ] Enable HTTPS / TLS termination on all subdomains
- [ ] Configure Cloudflare R2 (`R2_ACCOUNT_ID`, keys, bucket, `R2_PUBLIC_URL`) + CORS on the public bucket/domain
- [ ] Restrict `CORS_ORIGIN` to the three frontends + API
- [ ] Set `NODE_ENV=production`
- [ ] Backups for PostgreSQL
- [ ] Rate limiting verified
- [ ] robots.txt / sitemap for public domains

## Scaling notes

- Stateless API → horizontal scale behind load balancer
- Sticky sessions not required (JWT)
- Cart uses `X-Session-Id` or customer id
- Object storage keeps media off the DB
- Frontends can be deployed independently (CDN / static hosting)
- Future: payments, ERP, shipping as new Nest modules without core rewrite
