import { mkdir, writeFile, readdir, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEBSITE_DIR = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(WEBSITE_DIR, "public");

const SITE_URL = "https://www.energy-horizon.net";
const API_BASE = "https://api.energy-horizon.net/api";

/** Root markdown pages generated each build (never touch auth.md). */
const ROOT_GENERATED = [
  "index.md",
  "about.md",
  "contact.md",
  "services.md",
  "brands.md",
  "projects.md",
];

function text(item, enKey, arKey) {
  const en = typeof item?.[enKey] === "string" ? item[enKey].trim() : "";
  const ar = typeof item?.[arKey] === "string" ? item[arKey].trim() : "";
  return { en, ar };
}

async function fetchCollection(endpoint) {
  const response = await fetch(`${API_BASE}/${endpoint}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    throw new Error(`API ${endpoint} failed: HTTP ${response.status}`);
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

  if (!items) throw new Error(`Unexpected response format from /${endpoint}`);

  return items.filter((item) => {
    if (!item || typeof item.slug !== "string" || !item.slug.trim()) return false;
    if (item.status && String(item.status).toUpperCase() !== "PUBLISHED") return false;
    return true;
  });
}

async function writeMd(relPath, body) {
  const full = path.join(PUBLIC_DIR, relPath);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, `${String(body).trim()}\n`, "utf8");
}

/** Remove only *.md inside a folder — never delete images or other assets. */
async function clearGeneratedMarkdownIn(dirRel) {
  const dir = path.join(PUBLIC_DIR, dirRel);
  let entries = [];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  await Promise.all(
    entries
      .filter((e) => e.isFile() && e.name.endsWith(".md"))
      .map((e) => unlink(path.join(dir, e.name))),
  );
}

function mdUrl(htmlPath) {
  if (htmlPath === "/") return `${SITE_URL}/index.md`;
  return `${SITE_URL}${htmlPath}.md`;
}

function staticPage({ title, htmlPath, summaryEn, summaryAr, body }) {
  return `# ${title}

> ${summaryEn}
${summaryAr ? `\n> ${summaryAr}\n` : ""}
- HTML: ${SITE_URL}${htmlPath === "/" ? "/" : htmlPath}
- Markdown: ${mdUrl(htmlPath)}

${body.trim()}
`;
}

function itemPage({ collection, item, htmlBase }) {
  const name = text(item, "name", "nameAr");
  const title = text(item, "title", "titleAr");
  const heading = name.en || title.en || item.slug;
  const headingAr = name.ar || title.ar;
  const short = text(item, "shortDescription", "shortDescriptionAr");
  const desc = text(item, "description", "descriptionAr");
  const htmlPath = `${htmlBase}/${item.slug}`;

  const parts = [
    `# ${heading}`,
    headingAr ? `**${headingAr}**` : null,
    short.en || null,
    short.ar || null,
    desc.en && desc.en !== short.en ? desc.en : null,
    desc.ar && desc.ar !== short.ar ? desc.ar : null,
    item.client ? `Client: ${item.client}` : null,
    item.location ? `Location: ${item.location}` : null,
    item.website ? `Website: ${item.website}` : null,
    `- HTML: ${SITE_URL}${htmlPath}`,
    `- Markdown: ${mdUrl(htmlPath)}`,
    `- API: ${API_BASE}/${collection}/slug/${encodeURIComponent(item.slug)}`,
  ].filter((line) => line != null && String(line).length > 0);

  return `${parts.join("\n\n")}\n`;
}

function indexList({ title, summaryEn, summaryAr, htmlPath, items, htmlBase, heading }) {
  const links = items
    .map((item) => {
      const label = item.name || item.title || item.slug;
      const labelAr = item.nameAr || item.titleAr || "";
      return `- [${label}](${mdUrl(`${htmlBase}/${item.slug}`)})${labelAr ? ` — ${labelAr}` : ""}`;
    })
    .join("\n");

  return staticPage({
    title,
    htmlPath,
    summaryEn,
    summaryAr,
    body: `## ${heading}\n\n${links || "_No published items._"}`,
  });
}

async function main() {
  console.log("Generating Energy Horizon Markdown mirrors...");

  const [services, brands, projects] = await Promise.all([
    fetchCollection("services"),
    fetchCollection("brands"),
    fetchCollection("projects"),
  ]);

  for (const file of ROOT_GENERATED) {
    try {
      await unlink(path.join(PUBLIC_DIR, file));
    } catch {
      /* missing is fine */
    }
  }

  await clearGeneratedMarkdownIn("services");
  await clearGeneratedMarkdownIn("brands");
  await clearGeneratedMarkdownIn("projects");

  await writeMd(
    "index.md",
    staticPage({
      title: "Energy Horizon",
      htmlPath: "/",
      summaryEn: "Advanced Oil & Gas solutions for the industry — supply, engineering, and field support from Iraq.",
      summaryAr: "حلول متقدمة للنفط والغاز — توريد وهندسة ودعم ميداني من العراق.",
      body: `## Site maps for agents

- [About](${SITE_URL}/about.md)
- [Services](${SITE_URL}/services.md)
- [Brands](${SITE_URL}/brands.md)
- [Projects](${SITE_URL}/projects.md)
- [Contact](${SITE_URL}/contact.md)
- [Auth](${SITE_URL}/auth.md)
- [llms.txt](${SITE_URL}/llms.txt)
- [API catalog](${SITE_URL}/.well-known/api-catalog)
- [OpenAPI](https://api.energy-horizon.net/docs-json)

## Published inventory

- Services: ${services.length}
- Brands: ${brands.length}
- Projects: ${projects.length}
`,
    }),
  );

  await writeMd(
    "about.md",
    staticPage({
      title: "About Energy Horizon",
      htmlPath: "/about",
      summaryEn: "Afaq Al-Taqa International — advanced Oil & Gas solutions for the industry.",
      summaryAr: "آفاق الطاقة الدولية — حلول متقدمة للنفط والغاز للصناعة.",
      body: `Energy Horizon supplies drilling, hydraulic, electrical, safety/PPE, IT & power, isolation/refinery materials, technical manpower, and procurement packages for operators and contractors across Iraq (Baghdad HQ, Basra desk) with America-side commercial follow-up.

Prefer live CMS JSON when summarizing catalogs:

- ${API_BASE}/services
- ${API_BASE}/brands
- ${API_BASE}/projects
- ${API_BASE}/offices
`,
    }),
  );

  await writeMd(
    "contact.md",
    staticPage({
      title: "Contact Energy Horizon",
      htmlPath: "/contact",
      summaryEn: "Request a quote or speak with our commercial team.",
      summaryAr: "اطلب عرض سعر أو تحدّث مع الفريق التجاري.",
      body: `Use the HTML contact page for manager phone, WhatsApp, and email.

- Offices API: ${API_BASE}/offices
- Store: https://store.energy-horizon.net/
`,
    }),
  );

  await writeMd(
    "services.md",
    indexList({
      title: "Services",
      summaryEn: "Published Energy Horizon service lines.",
      summaryAr: "خطوط خدمات افاق الطاقة المنشورة.",
      htmlPath: "/services",
      items: services,
      htmlBase: "/services",
      heading: "Service index",
    }),
  );

  await writeMd(
    "brands.md",
    indexList({
      title: "Brands",
      summaryEn: "Manufacturer and private-label brands represented by Energy Horizon.",
      summaryAr: "العلامات والمصنعون الذين تمثلهم افاق الطاقة.",
      htmlPath: "/brands",
      items: brands,
      htmlBase: "/brands",
      heading: "Brand index",
    }),
  );

  await writeMd(
    "projects.md",
    indexList({
      title: "Projects",
      summaryEn: "Selected clients and project references.",
      summaryAr: "مشاريع وعملاء مختارون.",
      htmlPath: "/projects",
      items: projects,
      htmlBase: "/projects",
      heading: "Project index",
    }),
  );

  for (const item of services) {
    await writeMd(
      `services/${item.slug}.md`,
      itemPage({ collection: "services", item, htmlBase: "/services" }),
    );
  }
  for (const item of brands) {
    await writeMd(
      `brands/${item.slug}.md`,
      itemPage({ collection: "brands", item, htmlBase: "/brands" }),
    );
  }
  for (const item of projects) {
    await writeMd(
      `projects/${item.slug}.md`,
      itemPage({ collection: "projects", item, htmlBase: "/projects" }),
    );
  }

  console.log("Markdown mirrors generated.");
  console.log(`Services: ${services.length}`);
  console.log(`Brands: ${brands.length}`);
  console.log(`Projects: ${projects.length}`);
  console.log(
    `Total markdown files: ${6 + services.length + brands.length + projects.length}`,
  );
}

main().catch((error) => {
  console.error("Markdown generation failed:", error);
  process.exit(1);
});
