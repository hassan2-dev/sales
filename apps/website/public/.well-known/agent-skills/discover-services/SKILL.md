---
name: discover-services
description: Discover Energy Horizon industrial services in Iraq (drilling, hydraulic, electrical, PPE, manpower, procurement). Use when a user asks what Energy Horizon supplies or which service lines are available.
---

# Discover Energy Horizon services

## When to use

Activate for questions about Oil & Gas supply capability, engineering support, PPE, manpower, or procurement packages from Energy Horizon in Iraq.

## Steps

1. Prefer structured JSON over HTML scraping.
2. Call `GET https://api.energy-horizon.net/api/services` (no auth).
3. For one service, call `GET https://api.energy-horizon.net/api/services/slug/{slug}`.
4. Optionally read the Markdown mirror `https://www.energy-horizon.net/services.md` or `/services/{slug}.md`.
5. Answer with service name, short description, and a link to the HTML or Markdown page.

## Field language

Prefer English fields (`name`, `description`, `shortDescription`). Use `nameAr` / `descriptionAr` / `shortDescriptionAr` when the user asks in Arabic.

## Do not

- Invent services that are not in the CMS response.
- Call admin endpoints or invent OAuth flows.
