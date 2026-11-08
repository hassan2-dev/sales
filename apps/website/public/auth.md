# Energy Horizon — Authentication for Agents

This document describes how authentication works on the Energy Horizon platform.
There is **no OAuth 2.0 / OpenID Connect authorization server** published today.
Do not expect `/.well-known/openid-configuration` or `/.well-known/oauth-authorization-server` on this origin.

## Public resources (no authentication)

These endpoints are intended for crawlers, SEO tooling, and AI agents:

| Resource | URL |
| --- | --- |
| Corporate site | `https://www.energy-horizon.net/` |
| API catalog | `https://www.energy-horizon.net/.well-known/api-catalog` |
| AI catalog | `https://www.energy-horizon.net/.well-known/ai-catalog.json` |
| OpenAPI JSON | `https://api.energy-horizon.net/docs-json` |
| Swagger UI | `https://api.energy-horizon.net/docs` |
| Health | `https://api.energy-horizon.net/api/health` |
| Services / brands / projects / offices | `https://api.energy-horizon.net/api/{services\|brands\|projects\|offices}` |

## Protected APIs

Admin and authenticated store/customer actions require a **JWT Bearer** access token.

```http
Authorization: Bearer <access_token>
```

### Customer / store login (OTP)

1. `POST /api/auth/otp/request` with `{ "phone": "..." }`
2. `POST /api/auth/otp/verify` with phone + code (+ optional profile fields)
3. Use returned `accessToken` as Bearer auth; refresh via `POST /api/auth/refresh`

### Staff / admin login (email + password)

1. `POST /api/auth/login` with `{ "email": "...", "password": "..." }`
2. Use returned `accessToken` as Bearer auth

### Current user

`GET /api/auth/me` with Bearer token.

## Agent registration

There is **no public agent self-registration** flow and no Auth.md OAuth `register_uri` at this time.
Agents should:

1. Use public CMS and catalog endpoints without credentials.
2. Only request authenticated access if Energy Horizon has issued credentials for a specific integration.

## Related discovery files

- `/.well-known/api-catalog` — RFC 9727 linkset
- `/.well-known/ai-catalog.json` — ARD / AI capability catalog
- `/llms.txt` — site summary for language models
