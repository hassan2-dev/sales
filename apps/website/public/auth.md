# Auth.md

## Energy Horizon API Authentication

The Energy Horizon API uses JWT Bearer Token
authentication for protected endpoints.

## API Base URL

https://api.energy-horizon.net/api

## AI Agents — access policy

AI agents may freely use public discovery and catalog resources:

- Website HTML and Markdown mirrors (`Accept: text/markdown` or `*.md`)
- `llms.txt`, `auth.md`, API Catalog, ARD (`/.well-known/ard.json`)
- Public CMS JSON: services, brands, projects, offices
- OpenAPI: https://api.energy-horizon.net/docs-json

AI agents must not:

- Access admin dashboards or customer/order data
- Invent OAuth/OIDC flows (not supported)
- Self-register for credentials
- Share or embed access tokens in public prompts

Authorized commercial integrations that need write access
(quotes / inquiry) must contact Energy Horizon for approval.
There is no public agent OAuth registration endpoint.

## Public API

Public endpoints do not require authentication.

Examples:

- GET /services
- GET /brands
- GET /projects
- GET /offices
- GET /health

## Protected API

Protected endpoints require:

Authorization: Bearer YOUR_ACCESS_TOKEN

Staff login: POST /auth/login  
Customer OTP: POST /auth/otp/request then POST /auth/otp/verify  
Refresh: POST /auth/refresh

## Token Acquisition

Access tokens must be obtained through the
official Energy Horizon authentication process
(email/password for staff, phone OTP for store customers).

Do not assume OAuth 2.0 or OpenID Connect support.

## Security

Never expose credentials or access tokens
to unauthorized agents.

Never put tokens in URLs or public logs.
Do not attempt to access admin or customer data
without explicit authorization.

## Documentation

https://api.energy-horizon.net/docs

## Contact

https://www.energy-horizon.net/contact
