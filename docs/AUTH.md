# Authentication Flow

## Login

```
Client                         API
  |                             |
  |-- POST /auth/login -------->|
  |   { email, password }       |
  |                             |-- verify bcrypt hash
  |                             |-- load role + permissions
  |                             |-- issue access JWT (15m)
  |                             |-- store refresh token (7d)
  |<-- { accessToken,           |
  |      refreshToken, user } --|
```

## Authenticated request

```
Authorization: Bearer <accessToken>
```

JWT payload includes `sub` (userId), `email`, `role`. Permissions are loaded in the JWT strategy from the database on each request (or cached in token claims depending on implementation) so permission changes take effect without waiting for full logout.

## Refresh

```
POST /auth/refresh
{ "refreshToken": "..." }
```

Returns a new access token and rotated refresh token. Old refresh token is revoked.

## Logout

```
POST /auth/logout
{ "refreshToken": "..." }
```

Revokes the refresh token server-side.

## Frontend storage

- Access token: memory or `localStorage` (admin SPA)
- Refresh token: `localStorage` or httpOnly cookie (prefer cookie in hardened deployments)
- Axios interceptor retries once on `401` via `/auth/refresh`

## Password policy

- Hashed with bcrypt (cost factor ≥ 10)
- Never returned in API responses
- Seed passwords must be changed in production
