import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const publicDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public');
const src = path.join(publicDir, 'favicon.png');

const sizes = [
  { file: 'favicon-16x16.png', size: 16 },
  { file: 'favicon-32x32.png', size: 32 },
  { file: 'favicon-48x48.png', size: 48 },
  { file: 'apple-touch-icon.png', size: 180 },
];

for (const { file, size } of sizes) {
  await sharp(src)
    .resize(size, size, { fit: 'cover' })
    .png()
    .toFile(path.join(publicDir, file));
  console.log('wrote', file);
}

// Multi-size ICO-compatible PNG fallback used as /favicon.ico replacement:
// browsers accept PNG when linked as icon; also overwrite .ico bytes with 32 PNG
// for clients that hard-request /favicon.ico
await sharp(src).resize(32, 32, { fit: 'cover' }).png().toFile(path.join(publicDir, 'favicon.ico'));
console.log('wrote favicon.ico (png)');

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="AT">
  <image href="/favicon.png" width="64" height="64" preserveAspectRatio="xMidYMid meet"/>
</svg>
`;
// Prefer inline raster for <img>/icon reliability — copy resized into data URI
const b64 = (await sharp(src).resize(64, 64, { fit: 'cover' }).png().toBuffer()).toString('base64');
const svgEmbedded = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="AT">
  <image href="data:image/png;base64,${b64}" width="64" height="64"/>
</svg>
`;
await import('node:fs').then((fs) =>
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgEmbedded),
);
console.log('wrote favicon.svg');
void svg;
