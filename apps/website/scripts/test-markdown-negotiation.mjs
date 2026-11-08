import { prefersMarkdown, mapPathToMarkdown } from '../middleware.js';

const cases = [
  ['text/html,application/xhtml+xml', false],
  ['text/markdown', true],
  ['text/markdown, text/html', true],
  ['text/html, text/markdown', false],
  ['*/*', false],
  ['', false],
];

let failed = 0;
for (const [accept, expected] of cases) {
  const got = prefersMarkdown(accept);
  if (got !== expected) {
    console.error(`prefersMarkdown(${JSON.stringify(accept)}) => ${got}, expected ${expected}`);
    failed += 1;
  }
}

const paths = [
  ['/', '/index.md'],
  ['/about', '/about.md'],
  ['/services', '/services.md'],
  ['/services/drilling', '/services/drilling.md'],
  ['/brands/alfagomma', '/brands/alfagomma.md'],
  ['/projects/sc-pmc2-wq1-manpower', '/projects/sc-pmc2-wq1-manpower.md'],
  ['/services.md', null],
  ['/brands/alfagomma.png', null],
  ['/.well-known/api-catalog', null],
];

for (const [path, expected] of paths) {
  const got = mapPathToMarkdown(path);
  if (got !== expected) {
    console.error(`mapPathToMarkdown(${path}) => ${got}, expected ${expected}`);
    failed += 1;
  }
}

if (failed) {
  console.error(`Markdown negotiation tests failed: ${failed}`);
  process.exit(1);
}

console.log('Markdown negotiation unit tests passed.');
