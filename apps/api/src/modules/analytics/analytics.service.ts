import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  private utcDay(date = new Date()) {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  }

  async trackVisit(input: {
    surface: 'store' | 'corporate';
    visitorId: string;
  }) {
    const day = this.utcDay();
    const visitorId = input.visitorId.trim().slice(0, 80);

    await this.prisma.dailyVisitor.upsert({
      where: {
        surface_visitorId_day: {
          surface: input.surface,
          visitorId,
          day,
        },
      },
      create: {
        surface: input.surface,
        visitorId,
        day,
        hits: 1,
      },
      update: {
        hits: { increment: 1 },
      },
    });

    return { ok: true };
  }

  async getVisitorStats() {
    const day = this.utcDay();

    const [storeToday, corporateToday, storeTotal, corporateTotal] = await Promise.all([
      this.prisma.dailyVisitor.count({ where: { surface: 'store', day } }),
      this.prisma.dailyVisitor.count({ where: { surface: 'corporate', day } }),
      this.prisma.dailyVisitor.count({ where: { surface: 'store' } }),
      this.prisma.dailyVisitor.count({ where: { surface: 'corporate' } }),
    ]);

    return {
      store: { today: storeToday, total: storeTotal },
      corporate: { today: corporateToday, total: corporateTotal },
    };
  }
}
