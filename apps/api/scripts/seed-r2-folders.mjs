/**
 * Creates empty folder markers in R2 so the Cloudflare browser shows a clean tree.
 * Run: node apps/api/scripts/seed-r2-folders.mjs
 */
import { readFileSync } from 'node:fs';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const envText = readFileSync(path.join(root, '.env'), 'utf8');

function env(key) {
  const m = envText.match(new RegExp(`^${key}=(.*)$`, 'm'));
  return m ? m[1].trim() : '';
}

const FOLDERS = [
  'products/images',
  'products/documents',
  'brands/logos',
  'services/images',
  'projects/images',
  'news/images',
  'company/branding',
  'company/documents',
  'cms/media',
  'users/avatars',
  'misc',
];

const accountId = env('R2_ACCOUNT_ID');
const bucket = env('R2_BUCKET');
const accessKeyId = env('R2_ACCESS_KEY_ID');
const secretAccessKey = env('R2_SECRET_ACCESS_KEY');

if (!accountId || !bucket || !accessKeyId || !secretAccessKey) {
  console.error('Missing R2_* env in apps/api/.env');
  process.exit(1);
}

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  forcePathStyle: true,
  credentials: { accessKeyId, secretAccessKey },
});

const note = Buffer.from(
  'Energy Horizon storage folder marker — safe to ignore.\n',
  'utf8',
);

for (const folder of FOLDERS) {
  const key = `${folder}/.keep`;
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: note,
      ContentType: 'text/plain; charset=utf-8',
      CacheControl: 'no-cache',
      Metadata: { purpose: 'folder-marker' },
    }),
  );
  console.log(`OK  ${key}`);
}

console.log(`\nSeeded ${FOLDERS.length} folders in bucket "${bucket}".`);
console.log('Open Cloudflare R2 → energy-horizon to browse the tree.');
