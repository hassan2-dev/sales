import { next, rewrite } from '@vercel/edge';

/**
 * Prefer markdown only when text/markdown is explicitly accepted
 * and ranks ahead of text/html (or html is absent).
 * Browsers keep receiving HTML.
 */
export function prefersMarkdown(acceptHeader) {
  const accept = String(acceptHeader || '').toLowerCase();
  if (!accept || accept === '*/*') return false;

  const md = accept.indexOf('text/markdown');
  if (md === -1) return false;

  const html = accept.indexOf('text/html');
  if (html === -1) return true;
  return md < html;
}

/** Map HTML routes to build-generated Markdown mirrors in /public. */
export function mapPathToMarkdown(pathname) {
  const raw = pathname.split('?')[0].replace(/\/+$/, '') || '/';

  if (
    raw.endsWith('.md') ||
    raw.endsWith('.txt') ||
    raw.endsWith('.xml') ||
    raw.endsWith('.json') ||
    raw.endsWith('.pdf') ||
    raw.startsWith('/.well-known') ||
    raw.startsWith('/assets') ||
    raw.startsWith('/company') ||
    raw.startsWith('/clients') ||
    raw.startsWith('/partners') ||
    raw.startsWith('/maps') ||
    raw.startsWith('/icons') ||
    raw.startsWith('/favicon') ||
    raw.startsWith('/apple-touch') ||
    raw.startsWith('/energy-horizon-logo')
  ) {
    return null;
  }

  // Brand/service logo assets live under /brands/*.png — only rewrite clean slug pages.
  if (/\.(png|jpe?g|webp|svg|ico|css|js|map|woff2?)$/i.test(raw)) {
    return null;
  }

  const staticMap = {
    '/': '/index.md',
    '/about': '/about.md',
    '/contact': '/contact.md',
    '/services': '/services.md',
    '/brands': '/brands.md',
    '/projects': '/projects.md',
    '/auth': '/auth.md',
  };

  if (staticMap[raw]) return staticMap[raw];

  const dynamic = raw.match(/^\/(services|brands|projects)\/([^/]+)$/);
  if (dynamic) {
    return `/${dynamic[1]}/${dynamic[2]}.md`;
  }

  return null;
}

export const config = {
  matcher: [
    '/',
    '/about',
    '/contact',
    '/auth',
    '/services',
    '/services/:slug',
    '/brands',
    '/brands/:slug',
    '/projects',
    '/projects/:slug',
  ],
};

export default function middleware(request) {
  if (!prefersMarkdown(request.headers.get('accept'))) {
    return next();
  }

  const url = new URL(request.url);
  const mdPath = mapPathToMarkdown(url.pathname);
  if (!mdPath) {
    return next();
  }

  url.pathname = mdPath;
  const response = rewrite(url);
  response.headers.set('Vary', 'Accept');
  response.headers.set('Content-Signal', 'ai-train=yes, search=yes, ai-input=yes');
  return response;
}
