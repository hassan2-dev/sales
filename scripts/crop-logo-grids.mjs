import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const publicDir = path.join(root, 'apps', 'web', 'public');

async function cropGrid({
  pageFile,
  outDir,
  names,
  cols,
  rows,
  grid,
  pad = 18,
}) {
  fs.mkdirSync(outDir, { recursive: true });
  const meta = await sharp(pageFile).metadata();
  const cellW = grid.w / cols;
  const cellH = grid.h / rows;
  const saved = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const name = names[i];
      if (!name) continue;
      const left = Math.round(grid.x + c * cellW + pad);
      const top = Math.round(grid.y + r * cellH + pad);
      const width = Math.round(cellW - pad * 2);
      const height = Math.round(cellH - pad * 2);
      const file = `${name}.png`;
      const out = path.join(outDir, file);
      await sharp(pageFile)
        .extract({
          left: Math.max(0, left),
          top: Math.max(0, top),
          width: Math.min(width, meta.width - left),
          height: Math.min(height, meta.height - top),
        })
        .trim({ threshold: 12 })
        .resize({ width: 480, height: 240, fit: 'inside', withoutEnlargement: false })
        .png()
        .toFile(out);
      saved.push(file);
      console.log('ok', file);
    }
  }
  return saved;
}

const brands = [
  'alfagomma',
  'euromotori',
  'nuova-fima',
  'bridon-bekaert',
  'oilgear',
  'unika-group',
  'imperial-safety',
  'lapp',
  'antenucci',
  'epoll',
  'pepperl-fuchs',
  'den-con',
  'emmegi',
  'hohner',
  'elit-ups',
];

const clients = [
  'exxonmobil',
  'lukoil',
  'kent',
  'petronas',
  'petrochina',
  'wood',
  'kuwait-energy',
  'anton',
  'idc',
  'src',
  'mrc',
  'moe',
];

await cropGrid({
  pageFile: path.join(publicDir, 'brands', '_page.jpg'),
  outDir: path.join(publicDir, 'brands'),
  names: brands,
  cols: 3,
  rows: 5,
  // calibrated for 1309x1852 render
  grid: { x: 70, y: 560, w: 1170, h: 1200 },
  pad: 22,
});

await cropGrid({
  pageFile: path.join(publicDir, 'clients', '_page.jpg'),
  outDir: path.join(publicDir, 'clients'),
  names: clients,
  cols: 3,
  rows: 4,
  grid: { x: 70, y: 520, w: 1170, h: 1220 },
  pad: 28,
});

console.log('done');
