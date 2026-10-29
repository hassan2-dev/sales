import fs from 'node:fs';

const p = new URL('../src/pages/admin/AdminPages.tsx', import.meta.url);
let s = fs.readFileSync(p, 'utf8');

const pairs = [
  ['to={`/admin/orders/${o.id}`}', 'to={adminPath(`orders/${o.id}`}'],
  ['to="/admin/products/new"', 'to={adminPath("products/new")}'],
  ['to={`/admin/products/${p.id}`}', 'to={adminPath(`products/${p.id}`}'],
  ['to={`/admin/customers/${row.id}`}', 'to={adminPath(`customers/${row.id}`}'],
  ['to={`/admin/quotes/${row.id}`}', 'to={adminPath(`quotes/${row.id}`}'],
  ['to={`/admin/support/${row.id}`}', 'to={adminPath(`support/${row.id}`}'],
];

// fix typos in replacements - need closing paren for JSX
const fixed = [
  ['to={`/admin/orders/${o.id}`}', 'to={adminPath(`orders/${o.id}`)}'],
  ['to="/admin/products/new"', 'to={adminPath("products/new")}'],
  ['to={`/admin/products/${p.id}`}', 'to={adminPath(`products/${p.id}`)}'],
  ['to={`/admin/customers/${row.id}`}', 'to={adminPath(`customers/${row.id}`)}'],
  ['to={`/admin/quotes/${row.id}`}', 'to={adminPath(`quotes/${row.id}`)}'],
  ['to={`/admin/support/${row.id}`}', 'to={adminPath(`support/${row.id}`)}'],
  ["to={`/admin/orders/${o.id}`}", "to={adminPath(`orders/${o.id}`)}"],
];

for (const [a, b] of fixed) s = s.split(a).join(b);

fs.writeFileSync(p, s);
console.log('remaining /admin links', (s.match(/to=\{?[`'"]\/admin/g) || []).length);
