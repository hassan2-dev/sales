import type { Brand, CmsService } from '@/types';
import type { Locale } from '@/i18n/dictionaries';

function pick(primary: string | null | undefined, fallback: string | null | undefined) {
  const v = primary?.trim();
  if (v) return v;
  return fallback?.trim() || '';
}

type ServiceCopy = Pick<
  CmsService,
  | 'name'
  | 'nameAr'
  | 'shortDescription'
  | 'shortDescriptionAr'
  | 'description'
  | 'descriptionAr'
  | 'content'
  | 'contentAr'
>;

export function localizeService(service: ServiceCopy, locale: Locale) {
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

export function localizeBrand(brand: Brand, locale: Locale) {
  if (locale === 'ar') {
    return {
      name: pick(brand.nameAr, brand.name),
      description: pick(brand.descriptionAr, brand.description),
    };
  }
  return {
    name: brand.name,
    description: brand.description ?? '',
  };
}
