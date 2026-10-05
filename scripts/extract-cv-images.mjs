import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

const root = path.resolve(import.meta.dirname, '..');
const pdfPath = path.join(root, 'docs', 'cv of company.pdf');
const outDir = path.join(root, 'apps', 'web', 'public', 'company');
fs.mkdirSync(outDir, { recursive: true });

const data = new Uint8Array(fs.readFileSync(pdfPath));
const doc = await pdfjs.getDocument({ data, disableFontFace: true, useSystemFonts: true }).promise;

const saved = [];

for (let p = 1; p <= doc.numPages; p++) {
  const page = await doc.getPage(p);
  const ops = await page.getOperatorList();
  const { OPS } = pdfjs;
  let idx = 0;

  for (let i = 0; i < ops.fnArray.length; i++) {
    const fn = ops.fnArray[i];
    if (fn !== OPS.paintImageXObject && fn !== OPS.paintJpegXObject) continue;

    const name = ops.argsArray[i][0];
    let img;
    try {
      img = await page.objs.get(name);
    } catch {
      continue;
    }
    if (!img?.width || !img?.data) continue;

    const { width, height, data: raw } = img;
    if (width < 240 || height < 240) continue;

    const pixels = width * height;
    const channels = Math.round(raw.length / pixels);
    if (![3, 4].includes(channels)) continue;

    idx += 1;
    const filename = `p${String(p).padStart(2, '0')}-${idx}.jpg`;
    const file = path.join(outDir, filename);

    await sharp(Buffer.from(raw), { raw: { width, height, channels } })
      .jpeg({ quality: 84 })
      .toFile(file);

    saved.push({
      file: `/company/${filename}`,
      width,
      height,
      page: p,
      bytes: fs.statSync(file).size,
    });
  }
}

fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(saved, null, 2));
console.log(`Saved ${saved.length} images to ${outDir}`);
for (const s of saved) {
  console.log(`${s.file}  ${s.width}x${s.height}  page ${s.page}`);
}
