/**
 * Professional object-storage prefixes for Cloudflare R2 / S3.
 * Keys look like: products/images/2026/10/<uuid>-name.jpg
 */
export const STORAGE_FOLDERS = [
  'products/images',
  'products/documents',
  'brands/logos',
  'cms/media',
  'users/avatars',
  'misc',
] as const;

export type StorageFolder = (typeof STORAGE_FOLDERS)[number];

export function isStorageFolder(value: unknown): value is StorageFolder {
  return (
    typeof value === 'string' &&
    (STORAGE_FOLDERS as readonly string[]).includes(value)
  );
}

export function resolveStorageFolder(
  value?: string | null,
  mimeType?: string,
): StorageFolder {
  if (value && isStorageFolder(value)) return value;
  if (mimeType?.startsWith('image/')) return 'products/images';
  if (
    mimeType === 'application/pdf' ||
    mimeType?.includes('document') ||
    mimeType?.includes('msword') ||
    mimeType?.includes('officedocument')
  ) {
    return 'products/documents';
  }
  return 'misc';
}
