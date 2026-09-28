# Deployment

## Environment

Copy `.env.example` → `apps/api/.env` and set strong secrets:

- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` (≥ 32 random chars)
- `DATABASE_URL`
- `CORS_ORIGIN` — comma-separated list of the three frontend origins
- S3 credentials (or local uploads volume)

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

## Database migrations

```bash
cd apps/api
npx prisma migrate deploy
```

## Production checklist

- [ ] Rotate JWT secrets
- [ ] Change seed admin password
- [ ] Enable HTTPS / TLS termination on all subdomains
- [ ] Configure real S3/MinIO bucket + CORS
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
