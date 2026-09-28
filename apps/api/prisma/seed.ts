import { PrismaClient, RoleCode, ContentStatus } from '@prisma/client';
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

  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: { name: perm.name, module: perm.module },
      create: perm,
    });
  }

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

  // Admin: all permissions
  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id },
      },
      update: {},
      create: { roleId: adminRole.id, permissionId: perm.id },
    });
  }

  // Employee: operational subset
  const employeePerms = allPermissions.filter((p) =>
    EMPLOYEE_PERMISSIONS.includes(p.code),
  );
  for (const perm of employeePerms) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: employeeRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: { roleId: employeeRole.id, permissionId: perm.id },
    });
  }

  const adminHash = await bcrypt.hash('Admin@12345', 12);
  const employeeHash = await bcrypt.hash('Employee@12345', 12);

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
        'Comprehensive drilling equipment and technical support for upstream operations across Iraq.',
      sortOrder: 1,
    },
    {
      name: 'Hydraulic',
      slug: 'hydraulic',
      shortDescription: 'Hydraulic systems and industrial fluid power',
      description:
        'Hydraulic components, systems, and maintenance for industrial and oilfield applications.',
      sortOrder: 2,
    },
    {
      name: 'Electrical',
      slug: 'electrical',
      shortDescription: 'Electrical engineering and power solutions',
      description:
        'Electrical equipment, instrumentation, and power solutions for industrial facilities.',
      sortOrder: 3,
    },
    {
      name: 'Technical Team',
      slug: 'technical-team',
      shortDescription: 'Experienced technical personnel to support you',
      description:
        'Field engineers and specialists providing on-site support, commissioning, and training.',
      sortOrder: 4,
    },
  ];

  for (const svc of services) {
    await prisma.service.upsert({
      where: { slug: svc.slug },
      update: {},
      create: { ...svc, status: ContentStatus.PUBLISHED },
    });
  }

  const offices = [
    {
      name: 'Baghdad Office',
      city: 'Baghdad',
      country: 'Iraq',
      phone: '+964 7713938595',
      contactPerson: 'Eng. Ali Altaai',
      sortOrder: 1,
    },
    {
      name: 'Basra Office',
      city: 'Basra',
      country: 'Iraq',
      phone: '+964 7810565100',
      contactPerson: 'Tabarak',
      sortOrder: 2,
    },
  ];

  for (const office of offices) {
    const existing = await prisma.office.findFirst({
      where: { name: office.name },
    });
    if (!existing) {
      await prisma.office.create({
        data: { ...office, status: ContentStatus.PUBLISHED },
      });
    }
  }

  await prisma.page.upsert({
    where: { slug: 'about' },
    update: {},
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

  const categories = [
    { name: 'Drilling Equipment', slug: 'drilling-equipment' },
    { name: 'Hydraulic Systems', slug: 'hydraulic-systems' },
    { name: 'Electrical & Instrumentation', slug: 'electrical-instrumentation' },
    { name: 'Safety & PPE', slug: 'safety-ppe' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { ...cat, status: ContentStatus.PUBLISHED },
    });
  }

  const brands = [
    {
      name: 'Energy Horizon',
      slug: 'energy-horizon',
      description: 'Private-label industrial solutions',
      website: 'https://energy-horizon.net',
      sortOrder: 1,
    },
    {
      name: 'Schlumberger',
      slug: 'schlumberger',
      description: 'Oilfield services and equipment',
      sortOrder: 2,
    },
    {
      name: 'Baker Hughes',
      slug: 'baker-hughes',
      description: 'Energy technology company',
      sortOrder: 3,
    },
    {
      name: 'Halliburton',
      slug: 'halliburton',
      description: 'Products and services for energy industry',
      sortOrder: 4,
    },
  ];

  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {},
      create: { ...brand, status: ContentStatus.PUBLISHED },
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
