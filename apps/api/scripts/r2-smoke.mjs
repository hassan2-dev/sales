import { readFileSync } from 'node:fs';
import { PutObjectCommand, HeadBucketCommand, S3Client } from '@aws-sdk/client-s3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const envText = readFileSync(path.join(root, '.env'), 'utf8');

function env(key) {
  const m = envText.match(new RegExp(`^${key}=(.*)$`, 'm'));
  return m ? m[1].trim() : '';
}

const accountId = env('R2_ACCOUNT_ID');
const bucket = env('R2_BUCKET');
const accessKeyId = env('R2_ACCESS_KEY_ID');
const secretAccessKey = env('R2_SECRET_ACCESS_KEY');
const publicUrl = env('R2_PUBLIC_URL').replace(/\/$/, '');

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  forcePathStyle: true,
  credentials: { accessKeyId, secretAccessKey },
});

const key = `cms/r2-smoke-${Date.now()}.txt`;
const body = Buffer.from(`Energy Horizon R2 smoke test ${new Date().toISOString()}`, 'utf8');

try {
  await client.send(new HeadBucketCommand({ Bucket: bucket }));
  console.log('HeadBucket: OK');
} catch (e) {
  console.log('HeadBucket: FAIL', e.name || '', e.message || e);
}

try {
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: 'text/plain; charset=utf-8',
    }),
  );
  const url = `${publicUrl}/${key}`;
  console.log('PutObject: OK');
  console.log(`key=${key}`);
  console.log(`url=${url}`);
  const res = await fetch(url);
  console.log(`Public GET: ${res.status} ${res.headers.get('content-type')}`);
  console.log(`body=${await res.text()}`);
} catch (e) {
  console.log('PutObject: FAIL', e.name || '', e.message || e);
  console.log(
    JSON.stringify(
      {
        code: e.Code || e.code,
        status: e.$metadata?.httpStatusCode,
      },
      null,
      2,
    ),
  );
}
