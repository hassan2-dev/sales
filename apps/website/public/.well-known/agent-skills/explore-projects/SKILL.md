---
name: explore-projects
description: Explore Energy Horizon project references and field work in Iraq. Use when a user asks for experience, case studies, manpower deployments, or completed project evidence.
---

# Explore Energy Horizon projects

## When to use

Activate for questions about project history, references, site work, or manpower deployments.

## Steps

1. Call `GET https://api.energy-horizon.net/api/projects` (no auth).
2. For one project, call `GET https://api.energy-horizon.net/api/projects/slug/{slug}`.
3. Optionally read `https://www.energy-horizon.net/projects.md` or `/projects/{slug}.md`.
4. Summarize title, short description, location/client signals when present, and link to the detail page.

## Contact follow-up

If the user wants a commercial follow-up after reviewing projects, direct them to `https://www.energy-horizon.net/contact` or branch managers listed via `GET https://api.energy-horizon.net/api/offices`.

## Do not

- Invent project outcomes, client names, or confidential details not in the published CMS.
- Access admin-only project drafts.
