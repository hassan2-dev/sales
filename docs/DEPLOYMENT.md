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

## Subdomains

| Host | App |
|------|-----|
| `www.domain.com` | `apps/website/dist` |
| `store.domain.com` | `apps/store/dist` |
| `admin.domain.com` | `apps/admin/dist` |
| `api.domain.com` | NestJS (`/api`, `/docs`, `/uploads`) |

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
