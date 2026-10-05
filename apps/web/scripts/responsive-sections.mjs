import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'http://127.0.0.1:5173';
const OUT = path.resolve('responsive-audit/sections');
fs.mkdirSync(OUT, { recursive: true });

const PAGES = [
  { route: '/', name: 'home' },
  { route: '/about', name: 'about' },
  { route: '/services', name: 'services' },
  { route: '/services/drilling', name: 'service-detail' },
  { route: '/brands', name: 'brands' },
  { route: '/projects', name: 'projects' },
  { route: '/news', name: 'news' },
  { route: '/contact', name: 'contact' },
];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  locale: 'ar',
});
const page = await context.newPage();
const findings = [];

for (const p of PAGES) {
  await page.goto(`${BASE}${p.route}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(1200);

  // dismiss transition overlay wait
  await page.waitForTimeout(700);

  const sections = await page.evaluate(() => {
    const nodes = [...document.querySelectorAll('main section, main > div > section, footer')];
    return nodes.map((el, i) => {
      const r = el.getBoundingClientRect();
      const top = r.top + window.scrollY;
      const h = Math.min(Math.max(r.height, 120), 1200);
      const title =
        el.querySelector('h1,h2')?.textContent?.trim()?.slice(0, 60) ||
        el.getAttribute('aria-label') ||
        `section-${i}`;
      return { i, top, h, title, tag: el.tagName.toLowerCase() };
    });
  });

  // viewport shot
  await page.screenshot({
    path: path.join(OUT, `${p.name}_viewport.png`),
    fullPage: false,
  });

  for (const s of sections.slice(0, 10)) {
    await page.evaluate((y) => window.scrollTo(0, Math.max(0, y - 56)), s.top);
    await page.waitForTimeout(200);
    const file = `${p.name}_s${String(s.i).padStart(2, '0')}.png`;
    await page.screenshot({
      path: path.join(OUT, file),
      fullPage: false,
      clip: {
        x: 0,
        y: 0,
        width: 390,
        height: Math.min(844, Math.max(280, Math.round(s.h) + 80)),
      },
    });
    findings.push({ page: p.name, route: p.route, ...s, file });
  }

  // measure common issues
  const issues = await page.evaluate(() => {
    const out = [];
    const vw = window.innerWidth;
    // tiny tap targets
    for (const el of document.querySelectorAll('a,button')) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && (r.height < 32 || r.width < 32) && r.top < 2000) {
        const t = (el.textContent || '').trim().slice(0, 40);
        if (t || el.getAttribute('aria-label')) {
          out.push({
            type: 'small-tap',
            text: t || el.getAttribute('aria-label'),
            h: Math.round(r.height),
            w: Math.round(r.width),
          });
        }
      }
      if (out.filter((x) => x.type === 'small-tap').length > 8) break;
    }
    // text overflow / wrapping extreme
    for (const el of document.querySelectorAll('h1,h2,.btn-cta')) {
      const r = el.getBoundingClientRect();
      if (r.right > vw + 4) {
        out.push({
          type: 'wide-el',
          text: (el.textContent || '').trim().slice(0, 40),
          right: Math.round(r.right),
        });
      }
    }
    return out;
  });
  findings.push({ page: p.name, route: p.route, issues });
  console.log(p.name, 'sections', sections.length, 'issues', issues.length);
}

fs.writeFileSync(path.join(OUT, 'findings.json'), JSON.stringify(findings, null, 2));
await browser.close();
console.log('done', OUT);
