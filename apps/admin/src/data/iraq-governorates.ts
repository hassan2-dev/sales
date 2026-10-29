export type IraqGovId =
  | 'dohuk'
  | 'erbil'
  | 'sulaymaniyah'
  | 'nineveh'
  | 'kirkuk'
  | 'salahuddin'
  | 'diyala'
  | 'anbar'
  | 'baghdad'
  | 'babel'
  | 'karbala'
  | 'najaf'
  | 'wasit'
  | 'qadisiyyah'
  | 'muthanna'
  | 'dhiqar'
  | 'maysan'
  | 'basra';

export type IraqGovernorate = {
  id: IraqGovId;
  /** ISO 3166-2 style id used in /maps/iraq-simplemaps.svg */
  iso: string;
  nameEn: string;
  nameAr: string;
  /** Label point from the ready SVG (viewBox 0 0 1000 1000) */
  cx: number;
  cy: number;
};

export const IRAQ_GOVERNORATES: IraqGovernorate[] = [
  { id: 'dohuk', iso: 'IQDA', nameEn: 'Dohuk', nameAr: 'دهوك', cx: 439.7, cy: 82.9 },
  { id: 'erbil', iso: 'IQAR', nameEn: 'Erbil', nameAr: 'أربيل', cx: 547.6, cy: 175 },
  { id: 'sulaymaniyah', iso: 'IQSU', nameEn: 'Sulaymaniyah', nameAr: 'السليمانية', cx: 650.7, cy: 262.6 },
  { id: 'nineveh', iso: 'IQNI', nameEn: 'Nineveh', nameAr: 'نينوى', cx: 381.4, cy: 193.3 },
  { id: 'kirkuk', iso: 'IQKI', nameEn: 'Kirkuk', nameAr: 'كركوك', cx: 541.9, cy: 279.7 },
  { id: 'salahuddin', iso: 'IQSD', nameEn: 'Salah ad-Din', nameAr: 'صلاح الدين', cx: 496, cy: 382.8 },
  { id: 'diyala', iso: 'IQDI', nameEn: 'Diyala', nameAr: 'ديالى', cx: 615.2, cy: 450.8 },
  { id: 'anbar', iso: 'IQAN', nameEn: 'Anbar', nameAr: 'الأنبار', cx: 317, cy: 528.7 },
  { id: 'baghdad', iso: 'IQBG', nameEn: 'Baghdad', nameAr: 'بغداد', cx: 567.3, cy: 502.4 },
  { id: 'babel', iso: 'IQBB', nameEn: 'Babil', nameAr: 'بابل', cx: 590, cy: 591 },
  { id: 'karbala', iso: 'IQKA', nameEn: 'Karbala', nameAr: 'كربلاء', cx: 514.3, cy: 587.7 },
  { id: 'najaf', iso: 'IQNA', nameEn: 'Najaf', nameAr: 'النجف', cx: 511.2, cy: 733.4 },
  { id: 'wasit', iso: 'IQWA', nameEn: 'Wasit', nameAr: 'واسط', cx: 688.9, cy: 574.6 },
  { id: 'qadisiyyah', iso: 'IQQA', nameEn: 'Al-Qadisiyyah', nameAr: 'القادسية', cx: 622.5, cy: 646.9 },
  { id: 'muthanna', iso: 'IQMU', nameEn: 'Muthanna', nameAr: 'المثنى', cx: 640, cy: 845.7 },
  { id: 'dhiqar', iso: 'IQDQ', nameEn: 'Dhi Qar', nameAr: 'ذي قار', cx: 736.5, cy: 730.7 },
  { id: 'maysan', iso: 'IQMA', nameEn: 'Maysan', nameAr: 'ميسان', cx: 814.2, cy: 664.7 },
  { id: 'basra', iso: 'IQBA', nameEn: 'Basra', nameAr: 'البصرة', cx: 849.8, cy: 803 },
];

export const IRAQ_ISO_TO_ID: Record<string, IraqGovId> = Object.fromEntries(
  IRAQ_GOVERNORATES.map((g) => [g.iso, g.id]),
) as Record<string, IraqGovId>;

export const IRAQ_ID_TO_ISO: Record<IraqGovId, string> = Object.fromEntries(
  IRAQ_GOVERNORATES.map((g) => [g.id, g.iso]),
) as Record<IraqGovId, string>;

export const IRAQ_CITY_ALIASES: Record<string, IraqGovId> = {
  baghdad: 'baghdad',
  بغداد: 'baghdad',
  basra: 'basra',
  basrah: 'basra',
  البصرة: 'basra',
  erbil: 'erbil',
  irbil: 'erbil',
  أربيل: 'erbil',
  اربيل: 'erbil',
  dohuk: 'dohuk',
  dahuk: 'dohuk',
  دهوك: 'dohuk',
  sulaymaniyah: 'sulaymaniyah',
  suleimaniya: 'sulaymaniyah',
  السليمانية: 'sulaymaniyah',
  mosul: 'nineveh',
  nineveh: 'nineveh',
  نينوى: 'nineveh',
  الموصل: 'nineveh',
  kirkuk: 'kirkuk',
  كركوك: 'kirkuk',
  anbar: 'anbar',
  الأنبار: 'anbar',
  الانبار: 'anbar',
  najaf: 'najaf',
  النجف: 'najaf',
  karbala: 'karbala',
  كربلاء: 'karbala',
  babel: 'babel',
  babylon: 'babel',
  بابل: 'babel',
  wasit: 'wasit',
  واسط: 'wasit',
  diwaniya: 'qadisiyyah',
  qadisiyyah: 'qadisiyyah',
  القادسية: 'qadisiyyah',
  nasiriyah: 'dhiqar',
  'dhi qar': 'dhiqar',
  'ذي قار': 'dhiqar',
  amara: 'maysan',
  maysan: 'maysan',
  ميسان: 'maysan',
  samawah: 'muthanna',
  muthanna: 'muthanna',
  المثنى: 'muthanna',
  diyala: 'diyala',
  ديالى: 'diyala',
  tikrit: 'salahuddin',
  'salah ad-din': 'salahuddin',
  صلاح: 'salahuddin',
};
