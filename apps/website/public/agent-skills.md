# Energy Horizon agent skills

> How AI agents should use Energy Horizon public content and APIs.

## When to use

Use these skills when a user asks about Energy Horizon supply capability in Iraq, represented brands, project references, offices/managers, or how to call the public API.

## Prefer structured sources

1. Read [llms.txt](https://www.energy-horizon.net/llms.txt) for the curated index.
2. Prefer Markdown mirrors (`*.md`) over scraping HTML.
3. Prefer published CMS JSON from `https://api.energy-horizon.net/api` for services, brands, projects, offices, and products.
4. Use [OpenAPI](https://api.energy-horizon.net/docs-json) for exact request/response shapes.
5. Do not invent OAuth discovery; see [auth notes](https://www.energy-horizon.net/auth.md). Protected admin/store routes use JWT Bearer tokens. Public CMS list/detail endpoints require no auth.

## Public endpoints

- `GET /api/services` and `GET /api/services/slug/{slug}`
- `GET /api/brands` and `GET /api/brands/slug/{slug}`
- `GET /api/projects` and `GET /api/projects/slug/{slug}`
- `GET /api/offices`
- `GET /api/products` (store catalog; paginated)
- `GET /api/health`

## Language

Site UI supports Arabic and English. Prefer English fields (`name`, `description`, `shortDescription`) and use `nameAr` / `descriptionAr` / `shortDescriptionAr` when answering in Arabic.
