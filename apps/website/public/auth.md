# Auth.md

## Energy Horizon API Authentication

The Energy Horizon API uses JWT Bearer Token
authentication for protected endpoints.

## API Base URL

https://api.energy-horizon.net/api

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
official Energy Horizon authentication process.

Do not assume OAuth 2.0 or OpenID Connect support.
There is no public agent self-registration endpoint.

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
