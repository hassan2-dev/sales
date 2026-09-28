import fs from 'node:fs';

const path = new URL('../src/pages/corporate/HomePage.tsx', import.meta.url);
let c = fs.readFileSync(path, 'utf8');

const pairs = [
  ["locale === 'ar' ? 'Energy Horizon' : '", "locale === 'ar' ? 'Energy Horizon' : 'افاق الطاقة'"],
];

// Replace any mojibake ternary Arabic sides by known English anchors
c = c.replace(
  /title=\{locale === 'ar' \? '[^']+' : 'Energy Horizon'\}/,
  "title={locale === 'ar' ? 'افاق الطاقة' : 'Energy Horizon'}",
);
c = c.replace(
  /\{locale === 'ar' \? 'Energy Horizon' : '[^']+'\}/,
  "{locale === 'ar' ? 'Energy Horizon' : 'افاق الطاقة'}",
);
c = c.replace(
  /title=\{locale === 'ar' \? '[^']+' : 'No published services'\}/,
  "title={locale === 'ar' ? 'لا توجد خدمات منشورة' : 'No published services'}",
);
c = c.replace(
  /\? '[^']+'\s*:\s*'Publish services from the admin dashboard'/,
  "? 'أضف الخدمات من لوحة التحكم' : 'Publish services from the admin dashboard'",
);
c = c.replace(
  /title=\{locale === 'ar' \? '[^']+' : 'No featured products'\}/,
  "title={locale === 'ar' ? 'لا توجد منتجات مميزة' : 'No featured products'}",
);
c = c.replace(
  /\? '[^']+'\s*:\s*'Mark products as featured in admin'/,
  "? 'فعّل Featured على المنتجات من الأدمن' : 'Mark products as featured in admin'",
);
c = c.replace(
  /title=\{locale === 'ar' \? '[^']+' : 'No partners yet'\}/,
  "title={locale === 'ar' ? 'لا يوجد شركاء بعد' : 'No partners yet'}",
);
c = c.replace(
  /\? '[^']+'\s*:\s*'Add brands and project clients in admin'/,
  "? 'أضف العلامات والمشاريع من لوحة التحكم' : 'Add brands and project clients in admin'",
);
c = c.replace(
  /title=\{locale === 'ar' \? '[^']+' : 'No news yet'\}/,
  "title={locale === 'ar' ? 'لا توجد أخبار بعد' : 'No news yet'}",
);
c = c.replace(
  /locale === 'ar' \? '[^']+' : 'Publish articles from admin'/,
  "locale === 'ar' ? 'انشر المقالات من لوحة التحكم' : 'Publish articles from admin'",
);
c = c.replace(
  /title=\{locale === 'ar' \? '[^']+' : 'No offices listed'\}/,
  "title={locale === 'ar' ? 'لا توجد مكاتب' : 'No offices listed'}",
);
c = c.replace(/\s*locale=\{locale\}\s*\n(\s*labels=\{)/, '\n$1');

fs.writeFileSync(path, c, 'utf8');
console.log('ok', c.includes('افاق الطاقة'));
