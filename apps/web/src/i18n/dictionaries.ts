export type Locale = 'en' | 'ar';

const dict = {
  en: {
    brand: 'Energy Horizon',
    brandAr: 'افاق الطاقة',
    legal: 'AT For General Trading and Engineering Services Ltd.',
    tagline: 'Advanced solutions for the Oil & Gas industry',
    nav: {
      about: 'About',
      services: 'Services',
      brands: 'Brands',
      projects: 'Projects',
      news: 'News',
      contact: 'Contact',
      store: 'Store',
      openStore: 'Open store',
    },
    hero: {
      title: 'Energy Horizon',
      subtitle:
        'Industrial equipment and engineering support for Oil & Gas operations across Iraq.',
      ctaStore: 'Browse store',
      ctaContact: 'Contact sales',
    },
    home: {
      capabilities: 'Built for operations',
      capabilitiesSub:
        'From drilling and hydraulics to electrical systems and field teams — one partner for supply and execution.',
      services: 'Services',
      servicesSub: 'Engineering capabilities you can deploy on site',
      allServices: 'View all',
      featured: 'Equipment catalog',
      featuredSub: 'Request a quote or order industrial products online',
      viewCatalog: 'Open catalog',
      news: 'Latest updates',
      offices: 'Offices in Iraq',
      learnMore: 'Details',
    },
    footer: {
      explore: 'Explore',
      company: 'Company',
      access: 'Access',
      rights: 'All rights reserved.',
      staff: 'Staff login',
    },
    theme: { light: 'Light', dark: 'Dark' },
    lang: { en: 'EN', ar: 'ع' },
  },
  ar: {
    brand: 'افاق الطاقة',
    brandAr: 'Energy Horizon',
    legal: 'AT للتجارة العامة والخدمات الهندسية المحدودة',
    tagline: 'حلول متقدمة لصناعة النفط والغاز',
    nav: {
      about: 'من نحن',
      services: 'الخدمات',
      brands: 'العلامات',
      projects: 'المشاريع',
      news: 'الأخبار',
      contact: 'تواصل معنا',
      store: 'المتجر',
      openStore: 'افتح المتجر',
    },
    hero: {
      title: 'افاق الطاقة',
      subtitle: 'معدات صناعية ودعم هندسي لعمليات النفط والغاز في العراق.',
      ctaStore: 'تصفح المتجر',
      ctaContact: 'تواصل مع المبيعات',
    },
    home: {
      capabilities: 'مصممون للعمليات',
      capabilitiesSub:
        'من الحفر والهيدروليك إلى الأنظمة الكهربائية والفرق الميدانية — شريك واحد للتوريد والتنفيذ.',
      services: 'الخدمات',
      servicesSub: 'قدرات هندسية جاهزة للعمل في الموقع',
      allServices: 'عرض الكل',
      featured: 'كتالوج المعدات',
      featuredSub: 'اطلب عرض سعر أو اشترِ المنتجات الصناعية عبر الإنترنت',
      viewCatalog: 'فتح الكتالوج',
      news: 'آخر التحديثات',
      offices: 'مكاتبنا في العراق',
      learnMore: 'التفاصيل',
    },
    footer: {
      explore: 'استكشف',
      company: 'الشركة',
      access: 'الوصول',
      rights: 'جميع الحقوق محفوظة.',
      staff: 'دخول الموظفين',
    },
    theme: { light: 'فاتح', dark: 'داكن' },
    lang: { en: 'EN', ar: 'ع' },
  },
} as const;

export type Dictionary = (typeof dict)['en'];

export function getDictionary(locale: Locale): Dictionary {
  return dict[locale] as Dictionary;
}
