import {
  PrismaClient,
  RoleCode,
  ContentStatus,
  ProductStatus,
  Availability,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const PERMISSIONS: { code: string; name: string; module: string }[] = [
  // products
  { code: 'products:read', name: 'View products', module: 'products' },
  { code: 'products:create', name: 'Create products', module: 'products' },
  { code: 'products:update', name: 'Update products', module: 'products' },
  { code: 'products:delete', name: 'Delete products', module: 'products' },
  // categories
  { code: 'categories:read', name: 'View categories', module: 'categories' },
  { code: 'categories:create', name: 'Create categories', module: 'categories' },
  { code: 'categories:update', name: 'Update categories', module: 'categories' },
  { code: 'categories:delete', name: 'Delete categories', module: 'categories' },
  // brands
  { code: 'brands:read', name: 'View brands', module: 'brands' },
  { code: 'brands:create', name: 'Create brands', module: 'brands' },
  { code: 'brands:update', name: 'Update brands', module: 'brands' },
  { code: 'brands:delete', name: 'Delete brands', module: 'brands' },
  // inventory
  { code: 'inventory:read', name: 'View inventory', module: 'inventory' },
  { code: 'inventory:update', name: 'Update inventory', module: 'inventory' },
  // orders
  { code: 'orders:read', name: 'View orders', module: 'orders' },
  { code: 'orders:create', name: 'Create orders', module: 'orders' },
  { code: 'orders:update', name: 'Update orders', module: 'orders' },
  // quotes
  { code: 'quotes:read', name: 'View quotes', module: 'quotes' },
  { code: 'quotes:create', name: 'Create quotes', module: 'quotes' },
  { code: 'quotes:update', name: 'Update quotes', module: 'quotes' },
  // customers
  { code: 'customers:read', name: 'View customers', module: 'customers' },
  { code: 'customers:update', name: 'Update customers', module: 'customers' },
  // media
  { code: 'media:read', name: 'View media', module: 'media' },
  { code: 'media:create', name: 'Upload media', module: 'media' },
  { code: 'media:delete', name: 'Delete media', module: 'media' },
  // cms
  { code: 'pages:read', name: 'View pages', module: 'pages' },
  { code: 'pages:create', name: 'Create pages', module: 'pages' },
  { code: 'pages:update', name: 'Update pages', module: 'pages' },
  { code: 'pages:delete', name: 'Delete pages', module: 'pages' },
  { code: 'services:read', name: 'View services', module: 'services' },
  { code: 'services:create', name: 'Create services', module: 'services' },
  { code: 'services:update', name: 'Update services', module: 'services' },
  { code: 'services:delete', name: 'Delete services', module: 'services' },
  { code: 'projects:read', name: 'View projects', module: 'projects' },
  { code: 'projects:create', name: 'Create projects', module: 'projects' },
  { code: 'projects:update', name: 'Update projects', module: 'projects' },
  { code: 'projects:delete', name: 'Delete projects', module: 'projects' },
  { code: 'news:read', name: 'View news', module: 'news' },
  { code: 'news:create', name: 'Create news', module: 'news' },
  { code: 'news:update', name: 'Update news', module: 'news' },
  { code: 'news:delete', name: 'Delete news', module: 'news' },
  { code: 'offices:read', name: 'View offices', module: 'offices' },
  { code: 'offices:create', name: 'Create offices', module: 'offices' },
  { code: 'offices:update', name: 'Update offices', module: 'offices' },
  { code: 'offices:delete', name: 'Delete offices', module: 'offices' },
  // support
  { code: 'support:read', name: 'View tickets', module: 'support' },
  { code: 'support:create', name: 'Create tickets', module: 'support' },
  { code: 'support:update', name: 'Update tickets', module: 'support' },
  { code: 'support:delete', name: 'Delete tickets', module: 'support' },
  { code: 'support:reply', name: 'Reply to tickets', module: 'support' },
  // users & roles
  { code: 'users:read', name: 'View users', module: 'users' },
  { code: 'users:create', name: 'Create users', module: 'users' },
  { code: 'users:update', name: 'Update users', module: 'users' },
  { code: 'users:delete', name: 'Delete users', module: 'users' },
  { code: 'roles:read', name: 'View roles', module: 'roles' },
  { code: 'roles:update', name: 'Update roles', module: 'roles' },
  // system
  { code: 'audit:read', name: 'View audit logs', module: 'audit' },
  { code: 'dashboard:read', name: 'View dashboard', module: 'dashboard' },
  { code: 'notifications:read', name: 'View notifications', module: 'notifications' },
  { code: 'settings:update', name: 'Update settings', module: 'settings' },
];

const EMPLOYEE_PERMISSIONS = PERMISSIONS.filter(
  (p) =>
    !p.code.startsWith('users:') &&
    !p.code.startsWith('roles:') &&
    p.code !== 'settings:update' &&
    p.code !== 'audit:read',
).map((p) => p.code);

async function main() {
  console.log('Seeding Energy Horizon database…');

  await prisma.permission.createMany({
    data: PERMISSIONS,
    skipDuplicates: true,
  });

  const allPermissions = await prisma.permission.findMany();

  const adminRole = await prisma.role.upsert({
    where: { code: RoleCode.ADMIN },
    update: {},
    create: {
      code: RoleCode.ADMIN,
      name: 'Administrator',
      description: 'Full system access',
    },
  });

  const employeeRole = await prisma.role.upsert({
    where: { code: RoleCode.EMPLOYEE },
    update: {},
    create: {
      code: RoleCode.EMPLOYEE,
      name: 'Employee',
      description: 'Operational staff access',
    },
  });

  await prisma.role.upsert({
    where: { code: RoleCode.CUSTOMER },
    update: {},
    create: {
      code: RoleCode.CUSTOMER,
      name: 'Customer',
      description: 'Reserved for customer portal',
    },
  });

  await prisma.rolePermission.createMany({
    data: allPermissions.map((perm) => ({
      roleId: adminRole.id,
      permissionId: perm.id,
    })),
    skipDuplicates: true,
  });

  const employeePerms = allPermissions.filter((p) =>
    EMPLOYEE_PERMISSIONS.includes(p.code),
  );
  await prisma.rolePermission.createMany({
    data: employeePerms.map((perm) => ({
      roleId: employeeRole.id,
      permissionId: perm.id,
    })),
    skipDuplicates: true,
  });

  const adminHash = await bcrypt.hash('Admin@12345', 10);
  const employeeHash = await bcrypt.hash('Employee@12345', 10);

  await prisma.user.upsert({
    where: { email: 'admin@energy-horizon.net' },
    update: {},
    create: {
      email: 'admin@energy-horizon.net',
      passwordHash: adminHash,
      firstName: 'System',
      lastName: 'Admin',
      roleId: adminRole.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'employee@energy-horizon.net' },
    update: {},
    create: {
      email: 'employee@energy-horizon.net',
      passwordHash: employeeHash,
      firstName: 'Operations',
      lastName: 'Staff',
      roleId: employeeRole.id,
    },
  });

  const services = [
    {
      name: 'Drilling',
      slug: 'drilling',
      shortDescription: 'Advanced drilling solutions for Oil & Gas operations',
      description:
        'Comprehensive drilling equipment and technical support for upstream operations across Iraq — BOP kits, mud pump spares, and field tooling.',
      image:
        'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80',
      sortOrder: 1,
    },
    {
      name: 'Hydraulic',
      slug: 'hydraulic',
      shortDescription: 'Hydraulic systems and industrial fluid power',
      description:
        'Hydraulic components, HPUs, hose assemblies, and maintenance for industrial and oilfield applications.',
      image:
        'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1200&q=80',
      sortOrder: 2,
    },
    {
      name: 'Electrical',
      slug: 'electrical',
      shortDescription: 'Electrical engineering and power solutions',
      description:
        'Ex lighting, instrumentation, transmitters, and power solutions for industrial facilities and hazardous areas.',
      image:
        'https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=1200&q=80',
      sortOrder: 3,
    },
    {
      name: 'Technical Team',
      slug: 'technical-team',
      shortDescription: 'Experienced technical personnel to support you',
      description:
        'Field engineers and specialists providing on-site support, commissioning, training, and HSE guidance.',
      image:
        'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80',
      sortOrder: 4,
    },
  ];

  for (const svc of services) {
    await prisma.service.upsert({
      where: { slug: svc.slug },
      update: {
        name: svc.name,
        shortDescription: svc.shortDescription,
        description: svc.description,
        image: svc.image,
        sortOrder: svc.sortOrder,
        status: ContentStatus.PUBLISHED,
      },
      create: { ...svc, status: ContentStatus.PUBLISHED },
    });
  }

  const offices = [
    {
      name: 'Baghdad Office',
      city: 'Baghdad',
      country: 'Iraq',
      address: 'Al-Karrada, Baghdad',
      phone: '+964 7713938595',
      email: 'baghdad@energy-horizon.net',
      contactPerson: 'Eng. Ali Altaai',
      sortOrder: 1,
    },
    {
      name: 'Basra Office',
      city: 'Basra',
      country: 'Iraq',
      address: 'Al-Ashar, Basra',
      phone: '+964 7810565100',
      email: 'basra@energy-horizon.net',
      contactPerson: 'Tabarak',
      sortOrder: 2,
    },
    {
      name: 'Erbil Office',
      city: 'Erbil',
      country: 'Iraq',
      address: '100 Meter Road, Erbil',
      phone: '+964 7501234567',
      email: 'erbil@energy-horizon.net',
      contactPerson: 'Karzan',
      sortOrder: 3,
    },
    {
      name: 'Kirkuk Desk',
      city: 'Kirkuk',
      country: 'Iraq',
      address: 'Kirkuk Industrial Zone',
      phone: '+964 7709876543',
      email: 'kirkuk@energy-horizon.net',
      contactPerson: 'Operations Desk',
      sortOrder: 4,
    },
  ];

  for (const office of offices) {
    const existing = await prisma.office.findFirst({
      where: { name: office.name },
    });
    if (existing) {
      await prisma.office.update({
        where: { id: existing.id },
        data: { ...office, status: ContentStatus.PUBLISHED },
      });
    } else {
      await prisma.office.create({
        data: { ...office, status: ContentStatus.PUBLISHED },
      });
    }
  }

  await prisma.page.upsert({
    where: { slug: 'about' },
    update: {
      title: 'About Energy Horizon',
      excerpt: 'Advanced solutions for the Oil & Gas industry',
      content:
        'Energy Horizon (Afaq Al-Taqa) delivers comprehensive and sustainable engineering solutions for the Oil & Gas and industrial sectors in Iraq. From drilling support and hydraulics to electrical packages and HSE supply, our teams in Baghdad, Basra, Erbil and Kirkuk keep projects moving safely.',
      status: ContentStatus.PUBLISHED,
    },
    create: {
      title: 'About Energy Horizon',
      slug: 'about',
      excerpt: 'Advanced solutions for the Oil & Gas industry',
      content:
        'Energy Horizon (Afaq Al-Taqa) delivers comprehensive and sustainable engineering solutions for the Oil & Gas and industrial sectors in Iraq.',
      status: ContentStatus.PUBLISHED,
    },
  });

  await prisma.companySetting.upsert({
    where: { key: 'company' },
    update: {},
    create: {
      key: 'company',
      value: {
        name: 'Energy Horizon',
        nameAr: 'افاق الطاقة',
        tagline: 'Advanced solutions for the Oil & Gas industry',
        website: 'https://energy-horizon.net',
        email: 'info@energy-horizon.net',
        currency: 'USD',
      },
    },
  });

  // Parent groups (كروبات) + leaf categories
  const categoryGroups = [
    {
      name: 'Upstream & Drilling',
      slug: 'upstream-drilling',
      description: 'Drilling tools, BOP, mud systems and wellsite equipment',
      imageUrl:
        'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80',
      sortOrder: 1,
      children: [
        {
          name: 'Drilling Equipment',
          slug: 'drilling-equipment',
          description: 'Upstream drilling tools, BOP kits, and mud pump spares',
          imageUrl:
            'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80',
          sortOrder: 1,
        },
      ],
    },
    {
      name: 'Industrial Systems',
      slug: 'industrial-systems',
      description: 'Hydraulic power, fluid systems, and process control',
      imageUrl:
        'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1200&q=80',
      sortOrder: 2,
      children: [
        {
          name: 'Hydraulic Systems',
          slug: 'hydraulic-systems',
          description: 'HPUs, hose assemblies, and industrial fluid power',
          imageUrl:
            'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1200&q=80',
          sortOrder: 1,
        },
        {
          name: 'Electrical & Instrumentation',
          slug: 'electrical-instrumentation',
          description: 'Ex lighting, transmitters, and process instrumentation',
          imageUrl:
            'https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=1200&q=80',
          sortOrder: 2,
        },
      ],
    },
    {
      name: 'Safety & Site',
      slug: 'safety-site',
      description: 'PPE and field safety for oil & gas crews',
      imageUrl:
        'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80',
      sortOrder: 3,
      children: [
        {
          name: 'Safety & PPE',
          slug: 'safety-ppe',
          description: 'Helmets, FR coveralls, gloves, and site PPE',
          imageUrl:
            'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80',
          sortOrder: 1,
        },
      ],
    },
  ];

  for (const group of categoryGroups) {
    const parent = await prisma.category.upsert({
      where: { slug: group.slug },
      update: {
        name: group.name,
        description: group.description,
        imageUrl: group.imageUrl,
        sortOrder: group.sortOrder,
        parentId: null,
        status: ContentStatus.PUBLISHED,
      },
      create: {
        name: group.name,
        slug: group.slug,
        description: group.description,
        imageUrl: group.imageUrl,
        sortOrder: group.sortOrder,
        status: ContentStatus.PUBLISHED,
      },
    });

    for (const child of group.children) {
      await prisma.category.upsert({
        where: { slug: child.slug },
        update: {
          name: child.name,
          description: child.description,
          imageUrl: child.imageUrl,
          sortOrder: child.sortOrder,
          parentId: parent.id,
          status: ContentStatus.PUBLISHED,
        },
        create: {
          name: child.name,
          slug: child.slug,
          description: child.description,
          imageUrl: child.imageUrl,
          sortOrder: child.sortOrder,
          parentId: parent.id,
          status: ContentStatus.PUBLISHED,
        },
      });
    }
  }

  const brands = [
    {
      name: 'Energy Horizon',
      slug: 'energy-horizon',
      description: 'Private-label industrial solutions',
      website: 'https://energy-horizon.net',
      logo: 'https://images.unsplash.com/photo-1560179707-f14eea744dc0?auto=format&fit=crop&w=200&q=80',
      sortOrder: 1,
    },
    {
      name: 'Schlumberger',
      slug: 'schlumberger',
      description: 'Oilfield services and equipment',
      logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=200&q=80',
      sortOrder: 2,
    },
    {
      name: 'Baker Hughes',
      slug: 'baker-hughes',
      description: 'Energy technology company',
      logo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=200&q=80',
      sortOrder: 3,
    },
    {
      name: 'Halliburton',
      slug: 'halliburton',
      description: 'Products and services for energy industry',
      logo: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=200&q=80',
      sortOrder: 4,
    },
    {
      name: 'Weatherford',
      slug: 'weatherford',
      description: 'Oilfield equipment and services',
      logo: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=200&q=80',
      sortOrder: 5,
    },
    {
      name: 'NOV',
      slug: 'nov',
      description: 'National Oilwell Varco equipment lines',
      logo: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=200&q=80',
      sortOrder: 6,
    },
  ];

  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {
        name: brand.name,
        description: brand.description,
        website: brand.website,
        logo: brand.logo,
        sortOrder: brand.sortOrder,
        status: ContentStatus.PUBLISHED,
      },
      create: { ...brand, status: ContentStatus.PUBLISHED },
    });
  }

  const brandMap = Object.fromEntries(
    (await prisma.brand.findMany()).map((b) => [b.slug, b.id]),
  );
  const categoryMap = Object.fromEntries(
    (await prisma.category.findMany()).map((c) => [c.slug, c.id]),
  );

  const products = [
    {
      name: 'Industrial Safety Helmet',
      slug: 'industrial-safety-helmet',
      sku: 'AT-PPE-H001',
      shortDescription: 'Hard hat with ratchet suspension for oilfield crews',
      description:
        'ANSI/EN compliant safety helmet for drilling and construction sites. Adjustable fit, side accessory slots for ear muffs and lights.',
      price: 48.0,
      stock: 240,
      featured: true,
      brandSlug: 'energy-horizon',
      categorySlug: 'safety-ppe',
      image:
        'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
      specs: { Standard: 'ANSI / EN', Suspension: 'Ratchet', Color: 'White' },
      variantLabel: 'White / Standard',
    },
    {
      name: 'High-Vis Flame Resistant Coverall',
      slug: 'fr-coverall-hivis',
      sku: 'AT-PPE-C014',
      shortDescription: 'FR coverall with reflective tape for night operations',
      description:
        'Flame-resistant coverall designed for hydrocarbon environments. High-visibility strips and reinforced knees for field durability.',
      price: 185.0,
      stock: 96,
      featured: true,
      brandSlug: 'energy-horizon',
      categorySlug: 'safety-ppe',
      image:
        'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
      specs: { Protection: 'Flame resistant', Visibility: 'High-vis', Fit: 'Coverall' },
      variantLabel: 'Hi-Vis / FR',
    },
    {
      name: 'Mud Pump Spare Kit',
      slug: 'mud-pump-spare-kit',
      sku: 'AT-DRL-M220',
      shortDescription: 'Critical spares pack for common mud pump models',
      description:
        'Field-ready spare kit including liners, pistons, valves and seals for upstream drilling maintenance windows.',
      price: 4200.0,
      stock: 18,
      featured: true,
      brandSlug: 'schlumberger',
      categorySlug: 'drilling-equipment',
      image:
        'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
      specs: { Includes: 'Liners, pistons, valves, seals', Use: 'Mud pump', Pack: 'Field kit' },
      variantLabel: 'Standard kit',
    },
    {
      name: 'Hydraulic Power Unit 15kW',
      slug: 'hydraulic-power-unit-15kw',
      sku: 'AT-HYD-P015',
      shortDescription: 'Compact HPU for workshop and site tooling',
      description:
        '15kW hydraulic power unit with pressure relief, return filter and quick-connect manifold for industrial tooling.',
      price: 6750.0,
      stock: 7,
      featured: true,
      brandSlug: 'baker-hughes',
      categorySlug: 'hydraulic-systems',
      image:
        'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80',
      specs: { Power: '15 kW', Filter: 'Return', Manifold: 'Quick-connect' },
      variantLabel: '15 kW',
    },
    {
      name: 'Zone 1 LED Floodlight',
      slug: 'zone1-led-floodlight',
      sku: 'AT-ELC-L091',
      shortDescription: 'Ex-rated LED floodlight for hazardous areas',
      description:
        'ATEX/IECEx Zone 1 LED floodlight with wide optics for tank farms, manifolds and night maintenance.',
      price: 890.0,
      stock: 42,
      featured: true,
      brandSlug: 'halliburton',
      categorySlug: 'electrical-instrumentation',
      image:
        'https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=800&q=80',
      specs: { Zone: 'Zone 1', Type: 'LED floodlight', Cert: 'ATEX / IECEx' },
      variantLabel: 'Zone 1 LED',
    },
    {
      name: 'Chemical Resistant Gloves',
      slug: 'chemical-resistant-gloves',
      sku: 'AT-PPE-G033',
      shortDescription: 'Nitrile/neoprene gloves for chemical handling',
      description:
        'Heavy-duty chemical gloves for mixing, sampling and spill response on industrial sites.',
      price: 22.5,
      stock: 500,
      featured: true,
      brandSlug: 'energy-horizon',
      categorySlug: 'safety-ppe',
      image:
        'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=800&q=80',
      specs: { Material: 'Nitrile / Neoprene', Use: 'Chemical handling', Pack: 'Pair' },
      variantLabel: 'Nitrile / L',
    },
    {
      name: 'Pressure Transmitter 0–600 bar',
      slug: 'pressure-transmitter-600bar',
      sku: 'AT-ELC-PT60',
      shortDescription: 'Industrial pressure transmitter for process lines',
      description:
        '0–600 bar pressure transmitter with HART option for oil & gas process monitoring.',
      price: 640.0,
      stock: 55,
      featured: false,
      brandSlug: 'schlumberger',
      categorySlug: 'electrical-instrumentation',
      image:
        'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80',
      specs: { Range: '0–600 bar', Protocol: 'HART', Use: 'Process lines' },
      variantLabel: '0–600 bar',
    },
    {
      name: 'Blowout Preventer Seal Kit',
      slug: 'bop-seal-kit',
      sku: 'AT-DRL-BOP8',
      shortDescription: 'Seal kit for annular and ram BOP maintenance',
      description:
        'OEM-compatible elastomer kit for routine BOP overhaul during planned shutdowns.',
      price: 3100.0,
      stock: 12,
      featured: true,
      brandSlug: 'halliburton',
      categorySlug: 'drilling-equipment',
      image:
        'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80',
      specs: { Type: 'Seal kit', Use: 'BOP maintenance', Origin: 'OEM-compatible' },
      variantLabel: 'Annular / Ram',
    },
    {
      name: 'Hydraulic Hose Assembly 1"',
      slug: 'hydraulic-hose-1inch',
      sku: 'AT-HYD-H100',
      shortDescription: 'High-pressure hose assembly for site tooling',
      description:
        '1" hydraulic hose with crimped fittings, rated for industrial HPU circuits and field tooling.',
      price: 185.0,
      stock: 120,
      featured: true,
      brandSlug: 'baker-hughes',
      categorySlug: 'hydraulic-systems',
      image:
        'https://images.unsplash.com/photo-1581092918056-0c4c3faad126?auto=format&fit=crop&w=800&q=80',
      specs: { Diameter: '1 inch', Pressure: 'High', Fittings: 'Crimped' },
      variantLabel: '1 inch',
    },
    {
      name: 'Ex Junction Box',
      slug: 'ex-junction-box',
      sku: 'AT-ELC-JB12',
      shortDescription: 'Hazardous-area junction box for field cabling',
      description:
        'Ex-rated junction box for Zone 1/2 installations on manifolds and skids.',
      price: 310.0,
      stock: 64,
      featured: false,
      brandSlug: 'halliburton',
      categorySlug: 'electrical-instrumentation',
      image:
        'https://images.unsplash.com/photo-1558449028-b53a1268ec39?auto=format&fit=crop&w=800&q=80',
      specs: { Rating: 'Ex / Zone 1-2', Material: 'Aluminum', Entries: 'Multiple' },
      variantLabel: 'Aluminum Ex',
    },
    {
      name: 'Safety Goggles Anti-Fog',
      slug: 'safety-goggles-antifog',
      sku: 'AT-PPE-G070',
      shortDescription: 'Anti-fog goggles for dust and splash protection',
      description:
        'Industrial safety goggles with anti-fog coating for drilling and plant environments.',
      price: 18.0,
      stock: 800,
      featured: true,
      brandSlug: 'energy-horizon',
      categorySlug: 'safety-ppe',
      image:
        'https://images.unsplash.com/photo-1581093458791-9d42e3c7e584?auto=format&fit=crop&w=800&q=80',
      specs: { Lens: 'Anti-fog', Standard: 'EN166', Fit: 'Adjustable' },
      variantLabel: 'Anti-fog',
    },
    {
      name: 'Drill Pipe Elevator',
      slug: 'drill-pipe-elevator',
      sku: 'AT-DRL-E450',
      shortDescription: 'Center-latch elevator for drill pipe handling',
      description:
        'Heavy-duty elevator for tubular handling on drilling and workover rigs.',
      price: 8900.0,
      stock: 4,
      featured: true,
      brandSlug: 'nov',
      categorySlug: 'drilling-equipment',
      image:
        'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
      specs: { Type: 'Center-latch', Capacity: 'Heavy duty', Use: 'Tubular handling' },
      variantLabel: 'Center-latch',
    },
    {
      name: 'Hydraulic Quick Coupler Set',
      slug: 'hydraulic-quick-coupler-set',
      sku: 'AT-HYD-QC20',
      shortDescription: 'Quick-connect coupler kit for HPU manifolds',
      description:
        'Matched male/female quick couplers for fast connect/disconnect on hydraulic circuits.',
      price: 95.0,
      stock: 200,
      featured: false,
      brandSlug: 'weatherford',
      categorySlug: 'hydraulic-systems',
      image:
        'https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=800&q=80',
      specs: { Set: 'Male + Female', Style: 'Quick connect', Material: 'Steel' },
      variantLabel: 'Quick connect',
    },
  ];

  const datasheetUrl =
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

  for (const p of products) {
    const specs = {
      ...(p.specs ?? {}),
      ...(p.variantLabel ? { Variant: p.variantLabel } : {}),
    };
    const product = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {
        name: p.name,
        slug: p.slug,
        shortDescription: p.shortDescription,
        description: p.description,
        featured: p.featured,
        price: p.price,
        stock: p.stock,
        specifications: specs,
        status: ProductStatus.ACTIVE,
        availability: Availability.IN_STOCK,
        brandId: brandMap[p.brandSlug] ?? null,
        categoryId: categoryMap[p.categorySlug] ?? null,
      },
      create: {
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        shortDescription: p.shortDescription,
        description: p.description,
        price: p.price,
        stock: p.stock,
        featured: p.featured,
        specifications: specs,
        status: ProductStatus.ACTIVE,
        availability: Availability.IN_STOCK,
        brandId: brandMap[p.brandSlug] ?? null,
        categoryId: categoryMap[p.categorySlug] ?? null,
      },
    });

    const hasImage = await prisma.productImage.findFirst({
      where: { productId: product.id },
    });
    if (!hasImage) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: p.image,
          alt: p.name,
          isPrimary: true,
          sortOrder: 0,
        },
      });
    } else if (hasImage.url !== p.image) {
      await prisma.productImage.update({
        where: { id: hasImage.id },
        data: { url: p.image, alt: p.name },
      });
    }

    const sheetName = `${p.name} — Datasheet`;
    const existingDoc = await prisma.productDocument.findFirst({
      where: { productId: product.id, name: sheetName },
    });
    if (!existingDoc) {
      await prisma.productDocument.create({
        data: {
          productId: product.id,
          name: sheetName,
          url: datasheetUrl,
          mimeType: 'application/pdf',
          size: 13264,
        },
      });
    } else {
      await prisma.productDocument.update({
        where: { id: existingDoc.id },
        data: { url: datasheetUrl, mimeType: 'application/pdf' },
      });
    }

    await prisma.inventory.upsert({
      where: { productId: product.id },
      update: { quantity: p.stock },
      create: {
        productId: product.id,
        quantity: p.stock,
        lowStockAt: 5,
      },
    });
  }

  const projects = [
    {
      title: 'Basra Rig Safety Upgrade',
      slug: 'basra-rig-safety-upgrade',
      shortDescription: 'PPE and lighting package for an active drilling pad',
      description:
        'Supplied FR coveralls, helmets, Zone 1 lighting and HSE consumables for a multi-well campaign near Basra.',
      client: 'Basra Oil Company',
      location: 'Basra, Iraq',
      featured: true,
      sortOrder: 1,
      coverImage:
        'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80',
    },
    {
      title: 'Baghdad Plant Instrumentation',
      slug: 'baghdad-plant-instrumentation',
      shortDescription: 'Transmitters and electrical spares for a process plant',
      description:
        'Delivered pressure transmitters, junction boxes and Ex lighting for a midstream facility turnaround.',
      client: 'Ministry of Oil',
      location: 'Baghdad, Iraq',
      featured: true,
      sortOrder: 2,
      coverImage:
        'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1200&q=80',
    },
    {
      title: 'Kirkuk Hydraulic Overhaul',
      slug: 'kirkuk-hydraulic-overhaul',
      shortDescription: 'HPU and hose assemblies for maintenance crews',
      description:
        'Hydraulic power units, hoses and fittings staged for a planned mechanical overhaul window.',
      client: 'North Oil Company',
      location: 'Kirkuk, Iraq',
      featured: true,
      sortOrder: 3,
      coverImage:
        'https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=1200&q=80',
    },
  ];

  for (const proj of projects) {
    await prisma.project.upsert({
      where: { slug: proj.slug },
      update: {
        title: proj.title,
        shortDescription: proj.shortDescription,
        description: proj.description,
        client: proj.client,
        location: proj.location,
        featured: proj.featured,
        sortOrder: proj.sortOrder,
        coverImage: proj.coverImage,
        status: ContentStatus.PUBLISHED,
      },
      create: {
        ...proj,
        status: ContentStatus.PUBLISHED,
        completedAt: new Date('2025-11-15'),
      },
    });
  }

  const news = [
    {
      title: 'AT expands Safety & PPE stock for field crews',
      slug: 'at-expands-safety-ppe-stock',
      excerpt:
        'New helmet, FR coverall and glove lines are now available for quote across Iraq.',
      content:
        'Energy Horizon has expanded its Safety & PPE inventory to support drilling and plant crews. Hard hats, FR coveralls and chemical gloves ship from Baghdad and Basra staging points.',
      author: 'Energy Horizon',
      category: 'Safety',
      featured: true,
      coverImage:
        'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80',
    },
    {
      title: 'Hydraulic packages ready for shutdown windows',
      slug: 'hydraulic-packages-shutdown',
      excerpt:
        'HPUs and spare kits staged for planned maintenance across southern sites.',
      content:
        'Our technical team prepared hydraulic power units and spare kits to shorten downtime during scheduled plant and rig maintenance.',
      author: 'Operations',
      category: 'Operations',
      featured: false,
      coverImage:
        'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1200&q=80',
    },
    {
      title: 'Partner network update: Schlumberger & Baker Hughes lines',
      slug: 'partner-network-update',
      excerpt:
        'Additional drilling and energy technology SKUs now listed in the online catalog.',
      content:
        'Customers can request quotes on selected Schlumberger and Baker Hughes related equipment through the Energy Horizon store.',
      author: 'Commercial',
      category: 'Partners',
      featured: true,
      coverImage:
        'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=80',
    },
    {
      title: 'Erbil office now open for northern projects',
      slug: 'erbil-office-open',
      excerpt:
        'Local desk in Erbil supports quotes, PPE supply and technical coordination for KRG sites.',
      content:
        'Energy Horizon opened an Erbil coordination desk to serve northern oil and industrial customers with faster response times and local staging.',
      author: 'Energy Horizon',
      category: 'Company',
      featured: true,
      coverImage:
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    },
    {
      title: 'Ex lighting packages for night maintenance',
      slug: 'ex-lighting-night-maintenance',
      excerpt:
        'Zone 1 LED floodlights and junction boxes available for turnaround campaigns.',
      content:
        'Hazardous-area lighting kits are stocked for tank farms and night operations, with quote support from Basra and Baghdad.',
      author: 'Electrical Team',
      category: 'Electrical',
      featured: false,
      coverImage:
        'https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=1200&q=80',
    },
  ];

  for (const article of news) {
    await prisma.newsArticle.upsert({
      where: { slug: article.slug },
      update: {
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        author: article.author,
        category: article.category,
        featured: article.featured,
        coverImage: article.coverImage,
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
      },
      create: {
        ...article,
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });
  }

  console.log('Seed completed successfully.');
  console.log('Admin: admin@energy-horizon.net / Admin@12345');
  console.log('Employee: employee@energy-horizon.net / Employee@12345');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
