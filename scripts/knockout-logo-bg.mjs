import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const dirs = [
  path.join(root, 'apps', 'web', 'public', 'brands'),
  path.join(root, 'apps', 'web', 'public', 'clients'),
];

/** Make near-white pixels transparent so logos sit cleanly on dark cards. */
async function knockout(file) {
  const { data, info } = await sharp(file)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  for (let i = 0; i < width * height; i++) {
    const o = i * channels;
    const r = data[o];
    const g = data[o + 1];
    const b = data[o + 2];
    // Knock out paper/white crop leftovers
    if (r > 232 && g > 232 && b > 232) {
      data[o + 3] = 0;
    } else if (r > 210 && g > 210 && b > 210) {
      // Soft edge fade for anti-alias fringe
      const avg = (r + g + b) / 3;
      data[o + 3] = Math.max(0, Math.round((255 - avg) * 3.2));
    }
  }

  await sharp(data, { raw: { width, height, channels } }).png().toFile(file);
  console.log('ok', path.basename(file));
}

for (const dir of dirs) {
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith('.png')) continue;
    await knockout(path.join(dir, name));
  }
}

console.log('done');
