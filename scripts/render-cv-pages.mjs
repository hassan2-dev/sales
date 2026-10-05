import fs from 'fs';
import path from 'path';
import { createCanvas } from '@napi-rs/canvas';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const pdfPath = path.join(root, 'docs', 'cv of company.pdf');
const outDir = path.join(root, 'apps', 'web', 'public');

const data = new Uint8Array(fs.readFileSync(pdfPath));
const doc = await pdfjs.getDocument({ data, disableFontFace: true, useSystemFonts: true }).promise;

async function renderPage(pageNum, scale = 2) {
  const page = await doc.getPage(pageNum);
  const viewport = page.getViewport({ scale });
  const canvas = createCanvas(viewport.width, viewport.height);
  const ctx = canvas.getContext('2d');
  await page.render({ canvasContext: ctx, viewport }).promise;
  return { canvas, width: viewport.width, height: viewport.height };
}

async function saveJpeg(canvas, file) {
  const buf = canvas.toBuffer('image/png');
  await sharp(buf).jpeg({ quality: 90 }).toFile(file);
  console.log('saved', file);
}

// Page 12 = Brands, Page 26 = Clients & Projects
for (const p of [12, 26]) {
  const { canvas } = await renderPage(p, 2.2);
  const dir = path.join(outDir, p === 12 ? 'brands' : 'clients');
  fs.mkdirSync(dir, { recursive: true });
  await saveJpeg(canvas, path.join(dir, `_page.jpg`));
}

console.log('done pages');
