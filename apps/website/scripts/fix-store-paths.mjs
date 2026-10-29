import fs from 'node:fs';

const p = new URL('../src/pages/store/StorePages.tsx', import.meta.url);
let s = fs.readFileSync(p, 'utf8');

if (!s.includes("from '@/lib/urls'")) {
  s = s.replace(
    "import type { Product } from '@/types';",
    "import type { Product } from '@/types';\nimport { storePath } from '@/lib/urls';",
  );
}

const pairs = [
  ['to={`/store/products/${product.slug}`}', 'to={storePath(`products/${product.slug}`)}'],
  ['to={`/store/products/${slug}`}', 'to={storePath(`products/${slug}`)}'],
  ['to={`/store/categories/${c.slug}`}', 'to={storePath(`categories/${c.slug}`)}'],
  ["to={`/store/products/${item.product?.slug || ''}`}", "to={storePath(`products/${item.product?.slug || ''}`)}"],
  ['to="/store/products"', 'to={storePath("products")}'],
  ["to='/store/products'", "to={storePath('products')}"],
  ['to="/store/checkout"', 'to={storePath("checkout")}'],
  ["to='/store/checkout'", "to={storePath('checkout')}"],
  ['to="/store/cart"', 'to={storePath("cart")}'],
  ["navigate('/store')", "navigate(storePath())"],
  ["navigate('/store/cart')", "navigate(storePath('cart'))"],
  ["href = '/store/products'", "href = storePath('products')"],
  ['path="/store"', 'path={storePath()}'],
  ['path="/store/products"', 'path={storePath("products")}'],
  ['path="/store/cart"', 'path={storePath("cart")}'],
  ['path="/store/checkout"', 'path={storePath("checkout")}'],
  ['path={`/store/products/${slug}`}', 'path={storePath(`products/${slug}`)}'],
  ['path={`/store/categories/${slug}`}', 'path={storePath(`categories/${slug}`)}'],
  ['path={`/store/brands/${slug}`}', 'path={storePath(`brands/${slug}`)}'],
];

for (const [a, b] of pairs) s = s.split(a).join(b);

fs.writeFileSync(p, s);
console.log('storePath count', (s.match(/storePath/g) || []).length);
console.log('remaining /store', (s.match(/\/store/g) || []).length);
