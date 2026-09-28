import slugifyLib from 'slugify';

export function slugify(value: string): string {
  return slugifyLib(value, {
    lower: true,
    strict: true,
    trim: true,
  });
}

export function uniqueSlug(base: string, suffix?: string | number): string {
  const slug = slugify(base);
  if (suffix === undefined || suffix === null || suffix === '') {
    return slug;
  }
  return `${slug}-${suffix}`;
}
