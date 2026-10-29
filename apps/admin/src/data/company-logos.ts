const v = 'v3'; // bust cache after transparent knockout

/** Manufacturer brands from company CV (Brands page) */
export const MANUFACTURER_BRANDS = [
  { name: 'ALFAGOMMA', slug: 'alfagomma', logo: `/brands/alfagomma.png?${v}` },
  { name: 'euromotori', slug: 'euromotori', logo: `/brands/euromotori.png?${v}` },
  { name: 'NUOVA FIMA', slug: 'nuova-fima', logo: `/brands/nuova-fima.png?${v}` },
  { name: 'BRIDON · BEKAERT', slug: 'bridon-bekaert', logo: `/brands/bridon-bekaert.png?${v}` },
  { name: 'OILGEAR', slug: 'oilgear', logo: `/brands/oilgear.png?${v}` },
  { name: 'UNIKA GROUP', slug: 'unika-group', logo: `/brands/unika-group.png?${v}` },
  { name: 'IMPERIAL Safety', slug: 'imperial-safety', logo: `/brands/imperial-safety.png?${v}` },
  { name: 'LAPP', slug: 'lapp', logo: `/brands/lapp.png?${v}` },
  { name: 'ANTENUCCI', slug: 'antenucci', logo: `/brands/antenucci.png?${v}` },
  { name: 'epoll', slug: 'epoll', logo: `/brands/epoll.png?${v}` },
  { name: 'PEPPERL+FUCHS', slug: 'pepperl-fuchs', logo: `/brands/pepperl-fuchs.png?${v}` },
  { name: 'DEN-CON TOOL CO.', slug: 'den-con', logo: `/brands/den-con.png?${v}` },
  { name: 'EMMEGI', slug: 'emmegi', logo: `/brands/emmegi.png?${v}` },
  { name: 'hohner', slug: 'hohner', logo: `/brands/hohner.png?${v}` },
  { name: 'ELIT UPS', slug: 'elit-ups', logo: `/brands/elit-ups.png?${v}` },
] as const;

/** Clients from company CV (Clients & Projects page) */
export const CLIENT_LOGOS = [
  { name: 'ExxonMobil', slug: 'exxonmobil', logo: `/clients/exxonmobil.png?${v}` },
  { name: 'LUKOIL', slug: 'lukoil', logo: `/clients/lukoil.png?${v}` },
  { name: 'Kent', slug: 'kent', logo: `/clients/kent.png?${v}` },
  { name: 'PETRONAS', slug: 'petronas', logo: `/clients/petronas.png?${v}` },
  { name: 'PetroChina', slug: 'petrochina', logo: `/clients/petrochina.png?${v}` },
  { name: 'Wood', slug: 'wood', logo: `/clients/wood.png?${v}` },
  { name: 'Kuwait Energy', slug: 'kuwait-energy', logo: `/clients/kuwait-energy.png?${v}` },
  { name: 'ANTON', slug: 'anton', logo: `/clients/anton.png?${v}` },
  { name: 'Iraqi Drilling Company', slug: 'idc', logo: `/clients/idc.png?${v}` },
  { name: 'South Refineries Company', slug: 'src', logo: `/clients/src.png?${v}` },
  { name: 'Midland Refineries Company', slug: 'mrc', logo: `/clients/mrc.png?${v}` },
  { name: 'Ministry of Electricity', slug: 'moe', logo: `/clients/moe.png?${v}` },
] as const;
