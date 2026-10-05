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

  async getPublic() {
    const row = await this.ensure();
    return {
      usdToIqdRate: Number(row.usdToIqdRate),
      enableIqdDisplay: row.enableIqdDisplay,
    };
  }

  async getAdmin() {
    return this.ensure();
  }

  async update(dto: UpdateSiteSettingsDto) {
    await this.ensure();
    return this.prisma.siteSettings.update({
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
  }
}
