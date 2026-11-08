---
name: discover-brands
description: Discover brands and manufacturers represented by Energy Horizon. Use when a user asks which brands, OEM lines, or product partners Energy Horizon carries in Iraq.
---

# Discover Energy Horizon brands

## When to use

Activate for questions about represented brands, manufacturers, or OEM partnerships.

## Steps

1. Call `GET https://api.energy-horizon.net/api/brands` (no auth).
2. For one brand, call `GET https://api.energy-horizon.net/api/brands/slug/{slug}`.
3. Optionally read `https://www.energy-horizon.net/brands.md` or `/brands/{slug}.md`.
4. Summarize brand name, short description, and related services when present.
5. For purchasable SKUs, point to the store catalog via `GET https://api.energy-horizon.net/api/products` or `https://store.energy-horizon.net/`.

## Field language

Prefer English fields; use Arabic `*Ar` fields when answering in Arabic.

## Do not

- Claim exclusive distribution unless the CMS text says so.
- Fabricate brand catalogs or invent OAuth for public brand lists.
