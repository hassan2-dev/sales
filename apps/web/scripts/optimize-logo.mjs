import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const publicDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public');
const source = path.join(publicDir, 'logo-mark.png');

// Trim transparent edges, then export web-ready sizes
const trimmed = sharp(source).trim({ threshold: 0 });

await trimmed
  .clone()
  .resize({ width: 512, withoutEnlargement: true })
  .png({ compressionLevel: 9 })
  .toFile(path.join(publicDir, 'energy-horizon-logo.png'));

await trimmed
  .clone()
  .resize({ width: 512, withoutEnlargement: true })
  .png({ compressionLevel: 9 })
  .toFile(path.join(publicDir, 'logo.png'));

const meta = await sharp(path.join(publicDir, 'energy-horizon-logo.png')).metadata();
const b64 = fs.readFileSync(path.join(publicDir, 'energy-horizon-logo.png')).toString('base64');
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${meta.width} ${meta.height}" width="${meta.width}" height="${meta.height}">
  <image href="data:image/png;base64,${b64}" width="${meta.width}" height="${meta.height}"/>
</svg>
`;
fs.writeFileSync(path.join(publicDir, 'energy-horizon-logo.svg'), svg);

for (const f of ['energy-horizon-logo.png', 'logo.png', 'energy-horizon-logo.svg']) {
  console.log(f, fs.statSync(path.join(publicDir, f)).size, `${meta.width}x${meta.height}`);
}
