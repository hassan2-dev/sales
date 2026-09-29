import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../public');

/**
 * Flood-fill near-black pixels connected to image edges → transparent.
 * Keeps interior black dots (halftone) intact.
 */
async function removeEdgeBlack(inputPath, outputPath, threshold = 28) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width: w, height: h, channels } = info;
  const idx = (x, y) => (y * w + x) * channels;
  const isBg = (i) =>
    data[i + 3] > 0 &&
    data[i] <= threshold &&
    data[i + 1] <= threshold &&
    data[i + 2] <= threshold;

  const visited = new Uint8Array(w * h);
  const qx = new Int32Array(w * h);
  const qy = new Int32Array(w * h);
  let qh = 0;
  let qt = 0;

  const enqueue = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const p = y * w + x;
    if (visited[p]) return;
    const i = p * channels;
    if (!isBg(i)) return;
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

async function extractSvgPng(svgPath, outPng) {
  const svg = fs.readFileSync(svgPath, 'utf8');
  const m = svg.match(/href="data:image\/png;base64,([^"]+)"/);
  if (!m) throw new Error('No embedded PNG in SVG');
  fs.writeFileSync(outPng, Buffer.from(m[1], 'base64'));
  console.log(`extracted ${outPng} (${fs.statSync(outPng).size} bytes)`);
}

const logo1 = path.join(publicDir, 'logo1.png');
const markOut = path.join(publicDir, 'logo-mark.png');
const svgPath = path.join(publicDir, 'energy-horizon-logo.svg');
const rawOut = path.join(publicDir, '_eh-raw.png');
const ehOut = path.join(publicDir, 'energy-horizon-logo.png');
const logoOut = path.join(publicDir, 'logo.png');

await removeEdgeBlack(logo1, markOut, 30);
await extractSvgPng(svgPath, rawOut);
await removeEdgeBlack(rawOut, ehOut, 30);

// Header/footer wordmark: prefer the mark with transparent bg
fs.copyFileSync(markOut, logoOut);
console.log('updated logo.png from logo-mark.png');

// Rebuild SVG wrapping the transparent PNG (smaller + usable)
const ehMeta = await sharp(ehOut).metadata();
const b64 = fs.readFileSync(ehOut).toString('base64');
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ehMeta.width} ${ehMeta.height}" width="${ehMeta.width}" height="${ehMeta.height}">
  <image href="data:image/png;base64,${b64}" width="${ehMeta.width}" height="${ehMeta.height}" />
</svg>
`;
fs.writeFileSync(svgPath, svg);
console.log(`rewrote SVG (${fs.statSync(svgPath).size} bytes)`);

fs.unlinkSync(rawOut);
console.log('cleaned temp files');
