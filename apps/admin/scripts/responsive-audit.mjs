import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'http://127.0.0.1:5173';
const OUT = path.resolve('responsive-audit');
const ROUTES = [
  '/',
  '/about',
  '/services',
  '/services/drilling',
  '/brands',
  '/projects',
  '/news',
  '/contact',
];
const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const report = [];

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    locale: 'ar',
  });
  const page = await context.newPage();

  for (const route of ROUTES) {
    const url = `${BASE}${route}`;
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
      await page.waitForTimeout(800);

      const metrics = await page.evaluate(() => {
        const doc = document.documentElement;
        const body = document.body;
        const overflowX = Math.max(doc.scrollWidth, body.scrollWidth) - window.innerWidth;
        const offenders = [];
        for (const el of document.querySelectorAll('body *')) {
          const r = el.getBoundingClientRect();
          if (r.width < 1 || r.height < 1) continue;
          if (r.right > window.innerWidth + 2 || r.left < -2) {
            const tag = el.tagName.toLowerCase();
            const cls = (el.className && typeof el.className === 'string'
              ? el.className
              : ''
            ).slice(0, 80);
            offenders.push({
              tag,
              cls,
              left: Math.round(r.left),
              right: Math.round(r.right),
              w: Math.round(r.width),
            });
            if (offenders.length >= 12) break;
          }
        }
        return {
          scrollWidth: Math.max(doc.scrollWidth, body.scrollWidth),
          innerWidth: window.innerWidth,
          overflowX: Math.max(0, overflowX),
          offenders,
        };
      });

      const safe = route === '/' ? 'home' : route.replace(/\//g, '_').replace(/^_/, '');
      const shot = path.join(OUT, `${vp.name}_${safe}.png`);
      await page.screenshot({ path: shot, fullPage: true });

      report.push({
        viewport: vp.name,
        route,
        overflowX: metrics.overflowX,
        offenders: metrics.offenders,
        shot,
      });
      console.log(
        `[${vp.name}] ${route} overflowX=${metrics.overflowX} offenders=${metrics.offenders.length}`,
      );
    } catch (e) {
      report.push({ viewport: vp.name, route, error: String(e) });
      console.error(`[${vp.name}] ${route} ERROR`, e.message || e);
    }
  }
  await context.close();
}

await browser.close();
fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
console.log('Wrote', path.join(OUT, 'report.json'));
