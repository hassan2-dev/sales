import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEBSITE_DIR = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(WEBSITE_DIR, "public");

const SITE_URL = "https://www.energy-horizon.net";
const API_BASE = "https://api.energy-horizon.net/api";

const STATIC_ROUTES = [
  "/",
  "/about",
  "/services",
  "/brands",
  "/projects",
  "/contact",
];

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

async function fetchCollection(endpoint) {
  const response = await fetch(`${API_BASE}/${endpoint}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    throw new Error(
      `API ${endpoint} failed: HTTP ${response.status}`
    );
  }

  const json = await response.json();

  const items = Array.isArray(json)
    ? json
    : Array.isArray(json.data)
      ? json.data
      : Array.isArray(json.items)
        ? json.items
        : Array.isArray(json.results)
          ? json.results
          : Array.isArray(json.data?.items)
            ? json.data.items
            : null;

  if (!items) {
    throw new Error(
      `Unexpected response format from /${endpoint}`
    );
  }

  return items.filter((item) => {
    if (!item || typeof item.slug !== "string" || !item.slug.trim()) {
      return false;
    }

    // Public endpoints should return published content only.
    if (
      item.status &&
      String(item.status).toUpperCase() !== "PUBLISHED"
    ) {
      return false;
    }

    return true;
  });
}

function makeUrl(route, updatedAt) {
  const lastmod = updatedAt
    ? new Date(updatedAt)
    : null;

  const validDate =
    lastmod && !Number.isNaN(lastmod.getTime());

  return `
  <url>
    <loc>${escapeXml(`${SITE_URL}${route}`)}</loc>
    ${validDate ? `<lastmod>${lastmod.toISOString()}</lastmod>` : ""}
  </url>`;
}

async function main() {
  console.log("Generating Energy Horizon sitemap...");

  const [services, brands, projects] = await Promise.all([
    fetchCollection("services"),
    fetchCollection("brands"),
    fetchCollection("projects"),
  ]);

  const routes = [
    ...STATIC_ROUTES.map((route) => ({
      route,
      updatedAt: null,
    })),

    ...services.map((item) => ({
      route: `/services/${encodeURIComponent(item.slug)}`,
      updatedAt: item.updatedAt ?? item.updated_at,
    })),

    ...brands.map((item) => ({
      route: `/brands/${encodeURIComponent(item.slug)}`,
      updatedAt: item.updatedAt ?? item.updated_at,
    })),

    ...projects.map((item) => ({
      route: `/projects/${encodeURIComponent(item.slug)}`,
      updatedAt: item.updatedAt ?? item.updated_at,
    })),
  ];

  const uniqueRoutes = [
    ...new Map(routes.map((item) => [item.route, item])).values(),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueRoutes
  .map((item) => makeUrl(item.route, item.updatedAt))
  .join("\n")}
</urlset>`;

  await mkdir(PUBLIC_DIR, { recursive: true });

  await writeFile(
    path.join(PUBLIC_DIR, "sitemap.xml"),
    xml,
    "utf8"
  );

  console.log("Sitemap generated successfully.");
  console.log(`Static routes: ${STATIC_ROUTES.length}`);
  console.log(`Services: ${services.length}`);
  console.log(`Brands: ${brands.length}`);
  console.log(`Projects: ${projects.length}`);
  console.log(`Total URLs: ${uniqueRoutes.length}`);
}

main().catch((error) => {
  console.error("Sitemap generation failed:", error);
  process.exit(1);
});
