import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RoleCode } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';

const SALES = [
  'dashboard:read',
  'orders:read',
  'orders:update',
  'quotes:read',
  'quotes:update',
  'customers:read',
  'customers:update',
  'support:read',
  'support:update',
  'support:reply',
  'notifications:read',
];

const DATA_ENTRY = [
  'products:read',
  'products:create',
  'products:update',
  'products:delete',
  'categories:read',
  'categories:create',
  'categories:update',
  'categories:delete',
  'media:read',
  'media:create',
  'media:delete',
];

@Injectable()
export class StaffRolesService implements OnModuleInit {
  private readonly logger = new Logger(StaffRolesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      await this.sync(
        RoleCode.SALES,
        'Sales',
        'Orders, quotes, customers, and support.',
        SALES,
      );
      await this.sync(
        RoleCode.DATA_ENTRY,
        'Data entry',
        'Products and categories only.',
        DATA_ENTRY,
      );
    } catch (error) {
      this.logger.warn(
        `Staff roles were not synced. Apply the staff roles migration, then restart. ${error instanceof Error ? error.message : ''}`,
      );
    }
  }

  private async sync(code: RoleCode, name: string, description: string, permissionCodes: string[]) {
    const role = await this.prisma.role.upsert({
      where: { code },
      update: { name, description },
      create: { code, name, description },
    });
    const permissions = await this.prisma.permission.findMany({
      where: { code: { in: permissionCodes } },
    });
    await this.prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    if (!permissions.length) return;
    await this.prisma.rolePermission.createMany({
      data: permissions.map((permission) => ({
        roleId: role.id,
        permissionId: permission.id,
      })),
      skipDuplicates: true,
    });
  }
}
