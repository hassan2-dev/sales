/**
 * Object-storage prefixes for Cloudflare R2 / S3.
 * Keys look like: products/images/2026/11/<uuid>-name.jpg
 *
 * Browse the bucket by top-level area first, then type.
 */
export const STORAGE_FOLDERS = [
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
] as const;

export type StorageFolder = (typeof STORAGE_FOLDERS)[number];

/** Human labels for admin / docs (Arabic + English). */
export const STORAGE_FOLDER_META: Record<
  StorageFolder,
  { en: string; ar: string }
> = {
  'products/images': {
    en: 'Product photos',
    ar: 'صور المنتجات',
  },
  'products/documents': {
    en: 'Product datasheets / PDFs',
    ar: 'كتالوجات وملفات المنتجات',
  },
  'brands/logos': {
    en: 'Brand logos',
    ar: 'شعارات العلامات',
  },
  'services/images': {
    en: 'Service covers',
    ar: 'صور الخدمات',
  },
  'projects/images': {
    en: 'Project covers',
    ar: 'صور المشاريع',
  },
  'news/images': {
    en: 'News / article images',
    ar: 'صور الأخبار',
  },
  'company/branding': {
    en: 'Company logo & brand kit',
    ar: 'هوية الشركة والشعار',
  },
  'company/documents': {
    en: 'Company profiles / PDFs',
    ar: 'ملفات الشركة',
  },
  'cms/media': {
    en: 'General CMS / marketing',
    ar: 'وسائط عامة للموقع',
  },
  'users/avatars': {
    en: 'User avatars',
    ar: 'صور المستخدمين',
  },
  misc: {
    en: 'Uncategorized',
    ar: 'غير مصنّف',
  },
};

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

  if (
    mimeType === 'application/pdf' ||
    mimeType?.includes('document') ||
    mimeType?.includes('msword') ||
    mimeType?.includes('officedocument') ||
    mimeType?.includes('spreadsheet') ||
    mimeType === 'text/csv'
  ) {
    return 'products/documents';
  }

  if (mimeType?.startsWith('image/')) return 'cms/media';
  return 'misc';
}
