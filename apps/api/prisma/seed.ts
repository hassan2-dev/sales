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
      nameAr: 'الحفر',
      slug: 'drilling',
      shortDescription: 'Materials and equipment for drilling and workover rigs',
      shortDescriptionAr: 'مواد ومعدات لمنصات الحفر وصيانة الآبار',
      description:
        'From reliable international manufacturers we support drilling and workover rigs with power systems, pneumatic systems, mud pumps and tanks, rig-floor equipment, and mechanical and hydraulic systems — focused on efficiency, safety, and quality.',
      descriptionAr:
        'من مصنعين دوليين موثوقين ندعم منصات الحفر وصيانة الآبار بأنظمة الطاقة والأنظمة الهوائية ومضخات الطين والخزانات ومعدات رأس البئر والأنظمة الميكانيكية والهيدروليكية — مع التركيز على الكفاءة والسلامة والجودة.',
      image: '/company/p05-1.jpg',
      sortOrder: 1,
    },
    {
      name: 'Hydraulic',
      nameAr: 'الهيدروليك',
      slug: 'hydraulic',
      shortDescription: 'Fluid power equipment and integrated hydraulic systems',
      shortDescriptionAr: 'معدات القوة الهيدروليكية والأنظمة المتكاملة',
      description:
        'Fluid power and hydraulic equipment including pumps, valves, motors, meters, hoses, quick-release couplings, fittings and adapters — plus integrated systems for oilfield and industrial operations.',
      descriptionAr:
        'معدات القوة الهيدروليكية تشمل المضخات والصمامات والمحركات والعدادات والخراطيم والوصلات السريعة والتجهيزات — إضافة إلى أنظمة متكاملة لعمليات النفط والصناعة.',
      image: '/company/p06-1.jpg',
      sortOrder: 2,
    },
    {
      name: 'Electrical',
      nameAr: 'الكهرباء',
      slug: 'electrical',
      shortDescription: 'Electrical supply including explosion-proof solutions',
      shortDescriptionAr: 'تجهيزات كهربائية بما فيها حلول مقاومة للانفجار',
      description:
        'Cables, connectors, transformers, power systems, and a wide range of electrical components for drilling rigs and plants — plus Ex equipment, intrinsic safety barriers, HMI systems, and control solutions for harsh and hazardous areas.',
      descriptionAr:
        'كابلات وموصلات ومحولات وأنظمة طاقة ومكونات كهربائية لمنصات الحفر والمصانع — إضافة إلى معدات Ex وحواجز السلامة ذاتية الحماية وأنظمة HMI والتحكم للبيئات القاسية والخطرة.',
      image: '/company/p07-1.jpg',
      sortOrder: 3,
    },
    {
      name: 'Safety & PPE',
      nameAr: 'السلامة ومعدات الوقاية',
      slug: 'safety-ppe',
      shortDescription: 'EN-certified PPE from ISO 9001 accredited suppliers',
      shortDescriptionAr: 'معدات وقاية معتمدة EN من موردين ISO 9001',
      description:
        'Personal protective equipment sourced from leading international partners — hard hats, hearing and eye protection, gloves, FR clothing, and specialty ranges for oil, gas, and chemical handling, selected for EN certification and ISO 9001 supply chains.',
      descriptionAr:
        'معدات وقاية شخصية من شركاء دوليين — خوذ وسماعات ونظارات وحماية وقفازات وملابس مقاومة للحريق وخطوط متخصصة للنفط والغاز والكيميائيات، معتمدة EN وسلاسل توريد ISO 9001.',
      image: '/company/p10-1.jpg',
      sortOrder: 4,
    },
    {
      name: 'IT & Power',
      nameAr: 'تقنية المعلومات والطاقة',
      slug: 'it-power',
      shortDescription: 'UPS, power continuity, and industrial IT support',
      shortDescriptionAr: 'UPS واستمرارية الطاقة ودعم IT صناعي',
      description:
        'Uninterruptible power systems, industrial computing support, and power continuity packages for control rooms, offices, and critical field installations — keeping operations online through outages and unstable supply.',
      descriptionAr:
        'أنظمة طاقة غير منقطعة ودعم حوسبة صناعية وحزم استمرارية للطاقة لغرف التحكم والمكاتب والمواقع الحرجة — لإبقاء العمليات متصلة أثناء انقطاع التيار.',
      image: '/company/p14-1.jpg',
      sortOrder: 5,
    },
    {
      name: 'Isolation Stations & Refineries',
      nameAr: 'محطات العزل والمصافي',
      slug: 'isolation-refineries',
      shortDescription: 'Supply for degassing stations, isolation plants, and refineries',
      shortDescriptionAr: 'توريد لمحطات التفريغ والعزل والمصافي',
      description:
        'Materials and equipment for degassing and isolation stations, midstream facilities, and refinery turnarounds — staged from Baghdad and Basra with documentation and field support for plant and process environments.',
      descriptionAr:
        'مواد ومعدات لمحطات التفريغ والعزل ومنشآت منتصف الخط وصيانة المصافي — من بغداد والبصرة مع توثيق ودعم ميداني لبيئات المصانع والعمليات.',
      image: '/company/p12-1.jpg',
      sortOrder: 6,
    },
    {
      name: 'Technical Team',
      nameAr: 'الفريق الفني',
      slug: 'technical-team',
      shortDescription: 'Manpower and technical personnel for Iraqi projects',
      shortDescriptionAr: 'كوادر فنية وموارد بشرية لمشاريع العراق',
      description:
        'Professional employer and manpower services for local and international organizations in Iraq — control-room operators and supervisors, area operators, commissioning, ICSS, instrumentation, and machinery engineers and technicians.',
      descriptionAr:
        'خدمات توظيف وكوادر للمنظمات المحلية والدولية في العراق — مشغلو غرف التحكم والمشرفون ومشغلو المناطق والتشغيل وICSS والأجهزة والمهندسون والفنيون.',
      image: '/company/p08-1.jpg',
      sortOrder: 7,
    },
    {
      name: 'Procurement & Supply',
      nameAr: 'المشتريات والتوريد',
      slug: 'procurement-supply',
      shortDescription: 'Single-point procurement for oilfield and plant materials',
      shortDescriptionAr: 'مشتريات موحّدة لمواد النفط والمصانع',
      description:
        'Strategic supply relationships with accredited manufacturers worldwide — instrumentation and sensors, pipe fittings, flanges, valves, pumps, hydraulics, electrical packages, and custom-made sensors and systems.',
      descriptionAr:
        'علاقات توريد استراتيجية مع مصنعين معتمدين عالمياً — أجهزة واستشعار ووصلات وأنابيب ومحابر وصمامات ومضخات وهيدروليك وحزم كهربائية وأنظمة مخصصة.',
      image: '/company/p04-1.jpg',
      sortOrder: 8,
    },
  ];

  for (const svc of services) {
    await prisma.service.upsert({
      where: { slug: svc.slug },
      update: {
        name: svc.name,
        nameAr: svc.nameAr,
        shortDescription: svc.shortDescription,
        shortDescriptionAr: svc.shortDescriptionAr,
        description: svc.description,
        descriptionAr: svc.descriptionAr,
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
      address: 'Baghdad, Iraq',
      phone: '+964 7713938595',
      email: 'sales@energy-horizon.net',
      contactPerson: 'Eng. Ali Altaai',
      sortOrder: 1,
    },
    {
      name: 'Basra Office',
      city: 'Basra',
      country: 'Iraq',
      address: 'Basra, Iraq',
      phone: '+964 7810565100',
      email: 'tabarak@energy-horizon.net',
      contactPerson: 'Eng. Tabarak Mohammed',
      sortOrder: 2,
    },
    {
      name: 'America Office',
      city: 'America',
      country: 'USA',
      address: 'USA',
      phone: '+1 314 201 3439',
      email: 'mustafa.alsaffar@energy-horizon.net',
      contactPerson: 'Mustafa Al Saffar',
      sortOrder: 3,
    },
  ];

  for (const office of offices) {
    const existing = await prisma.office.findFirst({
      where: {
        OR: [
          { name: office.name },
          // Migrate legacy USA Office name
          ...(office.name === 'America Office' ? [{ name: 'USA Office' }] : []),
        ],
      },
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

  // Keep only Baghdad, Basra, America — archive Canada and any other offices
  await prisma.office.updateMany({
    where: {
      name: { notIn: offices.map((o) => o.name) },
    },
    data: { status: ContentStatus.ARCHIVED },
  });

  await prisma.page.upsert({
    where: { slug: 'about' },
    update: {
      title: 'About Energy Horizon',
      excerpt: 'Advanced Oil & Gas solutions for the industry',
      content: [
        'Headquartered in Baghdad, Afaq Al-Taqa International Co. Ltd. (Energy Horizon) is an Iraqi-owned and registered company.',
        '',
        'We are a leading supplier of materials and equipment to the Oil and Gas industry — drilling and workover rigs, degassing stations, refineries, and power plants.',
        '',
        'Our staff has more than 10 years of experience on drilling-rig operations, equipment supply, and maintenance. Authorization by leading manufacturers helps keep our processes aligned with high international standards.',
        '',
        'We provide electrical, mechanical, hydraulics, and drilling equipment from reputable international manufacturers, plus EN-certified PPE, explosion-proof electrical solutions, and single-point procurement through strategic supply relationships worldwide.',
        '',
        'Operational offices in Baghdad and Basra — with an international branch contact in America — support field delivery across Iraq.',
      ].join('\n'),
      status: ContentStatus.PUBLISHED,
    },
    create: {
      title: 'About Energy Horizon',
      slug: 'about',
      excerpt: 'Advanced Oil & Gas solutions for the industry',
      content: [
        'Headquartered in Baghdad, Afaq Al-Taqa International Co. Ltd. (Energy Horizon) is an Iraqi-owned and registered company.',
        '',
        'We are a leading supplier of materials and equipment to the Oil and Gas industry — drilling and workover rigs, degassing stations, refineries, and power plants.',
      ].join('\n'),
      status: ContentStatus.PUBLISHED,
    },
  });

  await prisma.companySetting.upsert({
    where: { key: 'company' },
    update: {
      value: {
        name: 'Energy Horizon',
        nameAr: 'افاق الطاقة',
        legalName: 'Afaq Al-Taqa for General Trading and Engineering Services Ltd.',
        tagline: 'Advanced Oil & Gas solutions for the industry',
        website: 'https://energy-horizon.net',
        email: 'sales@energy-horizon.net',
        currency: 'USD',
      },
    },
    create: {
      key: 'company',
      value: {
        name: 'Energy Horizon',
        nameAr: 'افاق الطاقة',
        legalName: 'Afaq Al-Taqa for General Trading and Engineering Services Ltd.',
        tagline: 'Advanced Oil & Gas solutions for the industry',
        website: 'https://energy-horizon.net',
        email: 'sales@energy-horizon.net',
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
      description:
        'Our private-label PPE, tools, and industrial kits — staged in Baghdad and Basra for oilfield and plant crews.',
      website: 'https://energy-horizon.net',
      logo: '/logo.png',
      sortOrder: 0,
    },
    {
      name: 'ALFAGOMMA',
      slug: 'alfagomma',
      description:
        'For over 60 years, Alfagomma has been producing and distributing high quality hydraulic and industrial hose systems worldwide — rubber and thermoplastic hose, fittings, adapters, quick-release couplings, assemblies, and stainless corrugated hose.',
      website: 'https://www.alfagomma.com',
      logo: '/brands/alfagomma.png',
      sortOrder: 1,
    },
    {
      name: 'DEN-CON TOOL CO.',
      slug: 'den-con',
      description:
        'Founded in 1975, Den-Con Tool Company provides a complete line of pipe handling tools for drilling and workover rigs — elevators, spiders, slips, bushings, and safety clamps. API 7K and API 8C certified with a quality system aligned to API Q1 / ISO.',
      website: 'https://www.den-con.com',
      logo: '/brands/den-con.png',
      sortOrder: 2,
    },
    {
      name: 'BRIDON · BEKAERT',
      slug: 'bridon-bekaert',
      description:
        'Bridon·Bekaert The Ropes Group supplies high-performance steel wire ropes and lifting solutions for drilling, cranes, and heavy industrial applications across oil and gas.',
      website: 'https://www.bridon-bekaert.com',
      logo: '/brands/bridon-bekaert.png',
      sortOrder: 3,
    },
    {
      name: 'OILGEAR',
      slug: 'oilgear',
      description:
        'Oilgear designs and manufactures high-pressure hydraulic pumps, valves, and fluid power systems for demanding industrial and energy applications.',
      website: 'https://www.oilgear.com',
      logo: '/brands/oilgear.png',
      sortOrder: 4,
    },
    {
      name: 'EMMEGI',
      slug: 'emmegi',
      description:
        'Emmegi heat exchangers and cooling systems for hydraulic power units, industrial processes, and oilfield equipment packages.',
      website: 'https://www.emmegi.com',
      logo: '/brands/emmegi.png',
      sortOrder: 5,
    },
    {
      name: 'LAPP',
      slug: 'lapp',
      description:
        'LAPP cable and connectivity systems for industrial automation, power distribution, and harsh-environment electrical installations on rigs and plants.',
      website: 'https://www.lapp.com',
      logo: '/brands/lapp.png',
      sortOrder: 6,
    },
    {
      name: 'PEPPERL+FUCHS',
      slug: 'pepperl-fuchs',
      description:
        'Pepperl+Fuchs explosion protection, intrinsic safety barriers, sensors, and interface technology for hazardous areas in oil, gas, and process industries.',
      website: 'https://www.pepperl-fuchs.com',
      logo: '/brands/pepperl-fuchs.png',
      sortOrder: 7,
    },
    {
      name: 'hohner',
      slug: 'hohner',
      description:
        'Hohner industrial encoders and motion feedback devices for automation, drilling machinery, and process control systems.',
      website: 'https://www.hohner.es',
      logo: '/brands/hohner.png',
      sortOrder: 8,
    },
    {
      name: 'NUOVA FIMA',
      slug: 'nuova-fima',
      description:
        'Nuova Fima pressure and temperature instrumentation — gauges, transmitters, and process instruments for industrial and oilfield duty.',
      website: 'https://www.nuovafima.com',
      logo: '/brands/nuova-fima.png',
      sortOrder: 9,
    },
    {
      name: 'euromotori',
      slug: 'euromotori',
      description:
        'Euromotori electric motors and drive solutions for industrial pumps, compressors, and oilfield auxiliary equipment.',
      website: 'https://www.euromotori.it',
      logo: '/brands/euromotori.png',
      sortOrder: 10,
    },
    {
      name: 'ANTENUCCI',
      slug: 'antenucci',
      description:
        'Antenucci equipment and tooling supporting drilling and workover operations with field-proven mechanical solutions.',
      logo: '/brands/antenucci.png',
      sortOrder: 11,
    },
    {
      name: 'IMPERIAL Safety',
      slug: 'imperial-safety',
      description:
        'Imperial Safety PPE ranges for oil, gas, and industrial sites — head, eye, hand, and body protection selected for EN certification and field durability.',
      logo: '/brands/imperial-safety.png',
      sortOrder: 12,
    },
    {
      name: 'ELIT UPS',
      slug: 'elit-ups',
      description:
        'ELIT UPS systems for uninterrupted power in control rooms, offices, and critical IT / industrial loads across energy facilities.',
      logo: '/brands/elit-ups.png',
      sortOrder: 13,
    },
    {
      name: 'UNIKA GROUP',
      slug: 'unika-group',
      description:
        'Unika Group industrial solutions supporting plant, refinery, and process facility supply programs.',
      logo: '/brands/unika-group.png',
      sortOrder: 14,
    },
    {
      name: 'epoll',
      slug: 'epoll',
      description:
        'epoll products and systems for industrial and energy-sector applications across isolation plants and process sites.',
      logo: '/brands/epoll.png',
      sortOrder: 15,
    },
  ];

  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {
        name: brand.name,
        description: brand.description,
        website: brand.website ?? null,
        logo: brand.logo,
        sortOrder: brand.sortOrder,
        status: ContentStatus.PUBLISHED,
      },
      create: {
        name: brand.name,
        slug: brand.slug,
        description: brand.description,
        website: brand.website ?? null,
        logo: brand.logo,
        sortOrder: brand.sortOrder,
        status: ContentStatus.PUBLISHED,
      },
    });
  }

  // Soft-archive legacy catalog brands no longer featured on corporate pages
  await prisma.brand.updateMany({
    where: {
      slug: {
        in: ['schlumberger', 'baker-hughes', 'halliburton', 'weatherford', 'nov'],
      },
    },
    data: { status: ContentStatus.DRAFT },
  });

  const brandMap = Object.fromEntries(
    (await prisma.brand.findMany()).map((b) => [b.slug, b.id]),
  );
  const serviceMap = Object.fromEntries(
    (await prisma.service.findMany()).map((s) => [s.slug, s.id]),
  );
  const categoryMap = Object.fromEntries(
    (await prisma.category.findMany()).map((c) => [c.slug, c.id]),
  );

  const serviceBrandLinks: { serviceSlug: string; brandSlug: string; sortOrder: number }[] = [
    { serviceSlug: 'drilling', brandSlug: 'den-con', sortOrder: 1 },
    { serviceSlug: 'drilling', brandSlug: 'bridon-bekaert', sortOrder: 2 },
    { serviceSlug: 'drilling', brandSlug: 'antenucci', sortOrder: 3 },
    { serviceSlug: 'hydraulic', brandSlug: 'alfagomma', sortOrder: 1 },
    { serviceSlug: 'hydraulic', brandSlug: 'oilgear', sortOrder: 2 },
    { serviceSlug: 'hydraulic', brandSlug: 'emmegi', sortOrder: 3 },
    { serviceSlug: 'electrical', brandSlug: 'lapp', sortOrder: 1 },
    { serviceSlug: 'electrical', brandSlug: 'pepperl-fuchs', sortOrder: 2 },
    { serviceSlug: 'electrical', brandSlug: 'hohner', sortOrder: 3 },
    { serviceSlug: 'electrical', brandSlug: 'nuova-fima', sortOrder: 4 },
    { serviceSlug: 'electrical', brandSlug: 'euromotori', sortOrder: 5 },
    { serviceSlug: 'safety-ppe', brandSlug: 'imperial-safety', sortOrder: 1 },
    { serviceSlug: 'it-power', brandSlug: 'elit-ups', sortOrder: 1 },
    { serviceSlug: 'isolation-refineries', brandSlug: 'unika-group', sortOrder: 1 },
    { serviceSlug: 'isolation-refineries', brandSlug: 'epoll', sortOrder: 2 },
  ];

  for (const link of serviceBrandLinks) {
    const serviceId = serviceMap[link.serviceSlug];
    const brandId = brandMap[link.brandSlug];
    if (!serviceId || !brandId) continue;
    await prisma.serviceBrand.upsert({
      where: {
        serviceId_brandId: { serviceId, brandId },
      },
      update: { sortOrder: link.sortOrder },
      create: {
        serviceId,
        brandId,
        sortOrder: link.sortOrder,
      },
    });
  }

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
      brandSlug: 'den-con',
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
      brandSlug: 'oilgear',
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
      brandSlug: 'pepperl-fuchs',
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
      brandSlug: 'nuova-fima',
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
      brandSlug: 'den-con',
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
      brandSlug: 'alfagomma',
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
      brandSlug: 'pepperl-fuchs',
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
      brandSlug: 'den-con',
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
      brandSlug: 'alfagomma',
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
      title: 'SC-PMC2 Manpower — West Qurna 1',
      slug: 'sc-pmc2-wq1-manpower',
      shortDescription:
        'Control-room and commissioning manpower for the SC-PMC2 project on WQ1',
      description:
        'Manpower supply for the SC-PMC2 project located on West Qurna 1 (WQ1) oil field — control-room operators and supervisors, area operators, commissioning engineers, ICSS engineers, instruments engineers and technicians, and machinery engineers. Client: Kentech Gulf Holding Ltd.',
      client: 'Kentech Gulf Holding Ltd.',
      location: 'West Qurna 1, Iraq',
      featured: true,
      sortOrder: 1,
      coverImage: '/company/p08-1.jpg',
    },
    {
      title: 'Drilling & Workover Rig Supply',
      slug: 'drilling-workover-rig-supply',
      shortDescription: 'Materials and equipment packages for active drilling campaigns',
      description:
        'Supply support for drilling and workover rigs including power and pneumatic systems, mud pumps and tanks, and rig-floor mechanical and hydraulic equipment.',
      client: 'Oil & Gas operators — Iraq',
      location: 'Iraq',
      featured: true,
      sortOrder: 2,
      coverImage: '/company/p05-1.jpg',
    },
    {
      title: 'Plant Electrical & Ex Packages',
      slug: 'plant-electrical-ex-packages',
      shortDescription: 'Electrical and explosion-proof equipment for harsh environments',
      description:
        'Cables, transformers, power systems, and explosion-proof control and distribution solutions for installation in harsh and hazardous industrial areas.',
      client: 'Refineries & power plants — Iraq',
      location: 'Iraq',
      featured: true,
      sortOrder: 3,
      coverImage: '/company/p11-1.jpg',
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

  await prisma.project.updateMany({
    where: {
      slug: {
        in: [
          'basra-rig-safety-upgrade',
          'baghdad-plant-instrumentation',
          'kirkuk-hydraulic-overhaul',
        ],
      },
    },
    data: { status: ContentStatus.ARCHIVED },
  });

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
      title: 'Baghdad & Basra desks ready for field quotes',
      slug: 'baghdad-basra-field-quotes',
      excerpt:
        'Quote support and PPE staging through our Baghdad and Basra offices.',
      content:
        'Energy Horizon serves customers from two offices only — Baghdad and Basra — with faster quote turnaround and local staging for Oil & Gas sites across Iraq.',
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

  // Remove outdated Erbil-office news from earlier seeds
  await prisma.newsArticle.updateMany({
    where: { slug: 'erbil-office-open' },
    data: { status: ContentStatus.ARCHIVED },
  });

  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: { id: 'default', usdToIqdRate: 1310, enableIqdDisplay: true },
  });

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
