import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../public');

/**
 * Flood-fill near-black / low-alpha edge pixels → transparent.
 * Keeps interior black dots (halftone on the globe) intact.
 */
async function removeEdgeBlack(inputPath, outputPath, threshold = 45) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width: w, height: h, channels } = info;
  const idx = (x, y) => (y * w + x) * channels;
  const isBg = (i) => {
    const a = data[i + 3];
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Traverse soft fringes so flood fill reaches the solid black field
    if (a < 40) return true;
    return r <= threshold && g <= threshold && b <= threshold;
  };

  const visited = new Uint8Array(w * h);
  const qx = new Int32Array(w * h);
  const qy = new Int32Array(w * h);
  let qh = 0;
  let qt = 0;

  const enqueue = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const p = y * w + x;
    if (visited[p]) return;
    if (!isBg(p * channels)) return;
    visited[p] = 1;
    qx[qt] = x;
    qy[qt] = y;
    qt++;
  };

  for (let x = 0; x < w; x++) {
    enqueue(x, 0);
    enqueue(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    enqueue(0, y);
    enqueue(w - 1, y);
  }

  let cleared = 0;
  while (qh < qt) {
    const x = qx[qh];
    const y = qy[qh];
    qh++;
    const i = idx(x, y);
    data[i] = 0;
    data[i + 1] = 0;
    data[i + 2] = 0;
    data[i + 3] = 0;
    cleared++;
    enqueue(x + 1, y);
    enqueue(x - 1, y);
    enqueue(x, y + 1);
    enqueue(x, y - 1);
  }

  await sharp(data, { raw: { width: w, height: h, channels } })
    .png()
    .toFile(outputPath);

  console.log(
    `OK ${path.basename(outputPath)} ${w}x${h} cleared=${cleared} bytes=${fs.statSync(outputPath).size}`,
  );
}

const ehOut = path.join(publicDir, 'energy-horizon-logo.png');
const svgPath = path.join(publicDir, 'energy-horizon-logo.svg');
const tmpIn = path.join(os.tmpdir(), `eh-in-${Date.now()}.png`);
const tmpOut = path.join(os.tmpdir(), `eh-out-${Date.now()}.png`);
const tmpTrim = path.join(os.tmpdir(), `eh-trim-${Date.now()}.png`);

fs.copyFileSync(ehOut, tmpIn);
await removeEdgeBlack(tmpIn, tmpOut, 45);

await sharp(tmpOut)
  .trim({ threshold: 0 })
  .resize({ width: 640, withoutEnlargement: true })
  .png({ compressionLevel: 9 })
  .toFile(tmpTrim);

fs.copyFileSync(tmpTrim, ehOut);

const ehMeta = await sharp(ehOut).metadata();
const b64 = fs.readFileSync(ehOut).toString('base64');
fs.writeFileSync(
  svgPath,
  `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ehMeta.width} ${ehMeta.height}" width="${ehMeta.width}" height="${ehMeta.height}" role="img" aria-label="Energy Horizon">
  <image href="data:image/png;base64,${b64}" width="${ehMeta.width}" height="${ehMeta.height}" preserveAspectRatio="xMidYMid meet"/>
</svg>
`,
);

for (const [file, size] of [
  ['favicon-16x16.png', 16],
  ['favicon-32x32.png', 32],
  ['favicon-48x48.png', 48],
  ['favicon.png', 48],
  ['apple-touch-icon.png', 180],
]) {
  const dest = path.join(publicDir, file);
  const t = path.join(os.tmpdir(), `eh-fav-${file}`);
  await sharp(ehOut)
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(t);
  fs.copyFileSync(t, dest);
  fs.unlinkSync(t);
}

const icoTmp = path.join(os.tmpdir(), 'eh-ico.png');
await sharp(ehOut)
  .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(icoTmp);
fs.copyFileSync(icoTmp, path.join(publicDir, 'favicon.ico'));

fs.writeFileSync(
  path.join(publicDir, 'favicon.svg'),
  `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Energy Horizon">
  <image href="data:image/png;base64,${fs.readFileSync(path.join(publicDir, 'favicon.png')).toString('base64')}" width="64" height="64"/>
</svg>
`,
);

for (const p of [tmpIn, tmpOut, tmpTrim, icoTmp]) {
  if (fs.existsSync(p)) fs.unlinkSync(p);
}

console.log(`transparent logo ${ehMeta.width}x${ehMeta.height} alpha=${ehMeta.hasAlpha}`);
