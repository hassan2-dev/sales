# API Overview

Base URL: `http://localhost:3000/api`

Interactive docs: `http://localhost:3000/docs` (Swagger)

## Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/login` | Public | Login |
| POST | `/auth/refresh` | Public | Refresh tokens |
| POST | `/auth/logout` | JWT | Revoke refresh token |
| GET | `/auth/me` | JWT | Current user + permissions |

## Catalog

| Method | Path | Auth |
|--------|------|------|
| GET | `/products` | Public (ACTIVE) / Admin |
| GET | `/products/:id` | JWT |
| GET | `/products/slug/:slug` | Public |
| POST | `/products` | `products:create` |
| PATCH | `/products/:id` | `products:update` |
| DELETE | `/products/:id` | `products:delete` |
| GET/POST | `/categories` | Public list / `categories:*` |
| GET/POST | `/brands` | Public list / `brands:*` |
| GET/PATCH | `/inventory/:productId` | `inventory:*` |
| POST | `/media/upload` | `media:create` |

Query params for products: `page`, `limit`, `search`, `sortBy`, `sortOrder`, `categoryId`, `brandId`, `availability`, `featured`, `status`

## Cart & Orders

| Method | Path | Notes |
|--------|------|-------|
| GET/POST/PATCH/DELETE | `/cart` | Header `X-Session-Id` |
| POST | `/orders` | Totals from DB prices |
| GET | `/orders` | `orders:read` |
| GET | `/orders/:id` | |
| PATCH | `/orders/:id/status` | Writes status history |
| POST | `/orders/:id/notes` | Internal notes |

## Quotes

| Method | Path |
|--------|------|
| POST | `/quotes` | Public / customer |
| GET | `/quotes` | `quotes:read` |
| PATCH | `/quotes/:id` | status / assign |

## CMS

`/pages`, `/services`, `/projects`, `/news`, `/offices` — public published reads; write requires CMS permissions.

## Support

| Method | Path |
|--------|------|
| GET/POST | `/tickets` |
| POST | `/tickets/:id/messages` |
| PATCH | `/tickets/:id` | assign, priority, status |

## Dashboard

| Method | Path |
|--------|------|
| GET | `/dashboard/overview` |
| GET | `/dashboard/sales` |
| GET | `/dashboard/orders` |

## Error format

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2026-09-28T12:00:00.000Z",
  "path": "/api/products"
}
```

Never trust `price`, `role`, `permissions`, `userId`, or order totals from the client.
