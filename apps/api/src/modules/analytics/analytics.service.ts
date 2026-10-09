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

  async getVisitorStats(range?: { from?: Date; to?: Date }) {
    const day = this.utcDay();
    const from = range?.from ? this.utcDay(range.from) : undefined;
    const to = range?.to ? this.utcDay(range.to) : undefined;
    const inRange =
      from || to
        ? {
            day: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {};

    const [storeToday, corporateToday, storePeriod, corporatePeriod] =
      await Promise.all([
        this.prisma.dailyVisitor.count({ where: { surface: 'store', day } }),
        this.prisma.dailyVisitor.count({ where: { surface: 'corporate', day } }),
        this.prisma.dailyVisitor.count({
          where: { surface: 'store', ...inRange },
        }),
        this.prisma.dailyVisitor.count({
          where: { surface: 'corporate', ...inRange },
        }),
      ]);

    return {
      store: { today: storeToday, total: storePeriod, period: storePeriod },
      corporate: {
        today: corporateToday,
        total: corporatePeriod,
        period: corporatePeriod,
      },
    };
  }
}
