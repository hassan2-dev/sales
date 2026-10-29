import type { CmsService } from '@/types';
import type { Locale } from '@/i18n/dictionaries';

function pick(primary: string | null | undefined, fallback: string | null | undefined) {
  const v = primary?.trim();
  if (v) return v;
  return fallback?.trim() || '';
}

export function localizeService(service: CmsService, locale: Locale) {
  if (locale === 'ar') {
    return {
      name: pick(service.nameAr, service.name),
      shortDescription: pick(service.shortDescriptionAr, service.shortDescription),
      description: pick(service.descriptionAr, service.description),
      content: pick(service.contentAr, service.content),
    };
  }
  return {
    name: service.name,
    shortDescription: service.shortDescription ?? '',
    description: service.description ?? '',
    content: service.content ?? '',
  };
}
