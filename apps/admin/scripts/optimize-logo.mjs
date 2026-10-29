import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import os from 'node:os';

const publicDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public');
const source = path.join(publicDir, 'energy-horizon-logo.png');
const tmp = path.join(os.tmpdir(), `eh-opt-${Date.now()}.png`);

const trimmed = sharp(source).trim({ threshold: 0 });

await trimmed
  .clone()
  .resize({ width: 640, withoutEnlargement: true })
  .png({ compressionLevel: 9 })
  .toFile(tmp);

fs.copyFileSync(tmp, source);
fs.unlinkSync(tmp);

const meta = await sharp(source).metadata();
const b64 = fs.readFileSync(source).toString('base64');
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${meta.width} ${meta.height}" width="${meta.width}" height="${meta.height}" role="img" aria-label="Energy Horizon">
  <image href="data:image/png;base64,${b64}" width="${meta.width}" height="${meta.height}" preserveAspectRatio="xMidYMid meet"/>
</svg>
`;
fs.writeFileSync(path.join(publicDir, 'energy-horizon-logo.svg'), svg);

console.log('energy-horizon-logo.png/svg', meta.width, 'x', meta.height);
