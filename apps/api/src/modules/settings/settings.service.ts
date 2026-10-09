import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { UpdateSiteSettingsDto } from './dto/settings.dto.js';

const SETTINGS_ID = 'default';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensure() {
    const existing = await this.prisma.siteSettings.findUnique({
      where: { id: SETTINGS_ID },
    });
    if (existing) return existing;
    return this.prisma.siteSettings.create({
      data: { id: SETTINGS_ID },
    });
  }

  private toPublic(row: { usdToIqdRate: { toString(): string } | number; enableIqdDisplay: boolean }) {
    return {
      usdToIqdRate: Number(row.usdToIqdRate),
      enableIqdDisplay: row.enableIqdDisplay,
    };
  }

  async getPublic() {
    return this.toPublic(await this.ensure());
  }

  async getAdmin() {
    const row = await this.ensure();
    return {
      id: row.id,
      ...this.toPublic(row),
      updatedAt: row.updatedAt,
    };
  }

  async update(dto: UpdateSiteSettingsDto) {
    await this.ensure();
    const row = await this.prisma.siteSettings.update({
      where: { id: SETTINGS_ID },
      data: {
        ...(dto.usdToIqdRate !== undefined
          ? { usdToIqdRate: dto.usdToIqdRate }
          : {}),
        ...(dto.enableIqdDisplay !== undefined
          ? { enableIqdDisplay: dto.enableIqdDisplay }
          : {}),
      },
    });
    return {
      id: row.id,
      ...this.toPublic(row),
      updatedAt: row.updatedAt,
    };
  }
}
