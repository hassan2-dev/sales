import { Injectable } from '@nestjs/common';
import {
  OrderStatus,
  PaymentStatus,
  ProductStatus,
  QuoteStatus,
  TicketStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AnalyticsService } from '../analytics/analytics.service.js';
import type { DashboardRangeDto } from './dto/dashboard.dto.js';

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function resolveRange(query: DashboardRangeDto = {}) {
  const now = new Date();
  let end = query.to ? endOfDay(new Date(query.to)) : endOfDay(now);
  let start: Date;

  if (query.from) {
    start = startOfDay(new Date(query.from));
  } else if (query.days) {
    const safeDays = Math.min(Math.max(Number(query.days) || 30, 1), 365);
    start = startOfDay(new Date(end));
    start.setDate(start.getDate() - (safeDays - 1));
  } else {
    // Default: current calendar month
    start = new Date(end.getFullYear(), end.getMonth(), 1);
    start.setHours(0, 0, 0, 0);
  }

  if (start > end) {
    const tmp = start;
    start = startOfDay(end);
    end = endOfDay(tmp);
  }

  return {
    start,
    end,
    from: start.toISOString().slice(0, 10),
    to: end.toISOString().slice(0, 10),
  };
}

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly analytics: AnalyticsService,
  ) {}

  async getOverview(query: DashboardRangeDto = {}) {
    const range = resolveRange(query);
    const { start, end } = range;
    const createdInRange = { createdAt: { gte: start, lte: end } };

    const startOfToday = startOfDay(new Date());

    const [
      ordersTotal,
      ordersPending,
      ordersInPeriod,
      ordersToday,
      productsTotal,
      productsActive,
      inventoryRows,
      quotesTotal,
      quotesPending,
      ticketsOpen,
      periodRevenue,
      recentOrders,
      visitors,
    ] = await Promise.all([
      this.prisma.order.count({ where: createdInRange }),
      this.prisma.order.count({
        where: {
          ...createdInRange,
          status: {
            in: [
              OrderStatus.PENDING,
              OrderStatus.CONFIRMED,
              OrderStatus.PROCESSING,
            ],
          },
        },
      }),
      this.prisma.order.count({ where: createdInRange }),
      this.prisma.order.count({
        where: { createdAt: { gte: startOfToday } },
      }),
      this.prisma.product.count(),
      this.prisma.product.count({
        where: { status: ProductStatus.ACTIVE },
      }),
      this.prisma.inventory.findMany({
        select: { quantity: true, lowStockAt: true },
      }),
      this.prisma.quoteRequest.count({ where: createdInRange }),
      this.prisma.quoteRequest.count({
        where: {
          ...createdInRange,
          status: { in: [QuoteStatus.PENDING, QuoteStatus.REVIEWING] },
        },
      }),
      this.prisma.supportTicket.count({
        where: {
          status: {
            in: [
              TicketStatus.OPEN,
              TicketStatus.IN_PROGRESS,
              TicketStatus.WAITING_FOR_CUSTOMER,
            ],
          },
        },
      }),
      this.prisma.order.aggregate({
        where: {
          ...createdInRange,
          OR: [
            { status: OrderStatus.COMPLETED },
            { paymentStatus: PaymentStatus.PAID },
          ],
        },
        _sum: { total: true },
      }),
      this.prisma.order.findMany({
        where: createdInRange,
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      this.analytics.getVisitorStats({ from: start, to: end }),
    ]);

    const lowStock = inventoryRows.filter(
      (row) => row.quantity <= row.lowStockAt,
    ).length;

    const periodTotal = Number(periodRevenue._sum.total ?? 0);

    return {
      range: { from: range.from, to: range.to },
      orders: {
        total: ordersTotal,
        pending: ordersPending,
        today: ordersToday,
        period: ordersInPeriod,
      },
      products: {
        total: productsTotal,
        active: productsActive,
        lowStock,
      },
      quotes: {
        total: quotesTotal,
        pending: quotesPending,
      },
      tickets: {
        open: ticketsOpen,
      },
      visitors,
      revenue: {
        monthTotal: periodTotal,
        periodTotal,
        currency: 'USD',
      },
      recentOrders,
    };
  }

  async getSales(query: DashboardRangeDto = {}) {
    const range = resolveRange(query);
    const createdInRange = { createdAt: { gte: range.start, lte: range.end } };

    const [period, completed] = await Promise.all([
      this.prisma.order.aggregate({
        where: createdInRange,
        _sum: { total: true },
        _count: true,
      }),
      this.prisma.order.aggregate({
        where: {
          ...createdInRange,
          status: OrderStatus.COMPLETED,
        },
        _sum: { total: true },
        _count: true,
      }),
    ]);

    return {
      range: { from: range.from, to: range.to },
      monthOrders: period._count,
      monthRevenue: Number(period._sum.total ?? 0),
      completedOrders: completed._count,
      completedRevenue: Number(completed._sum.total ?? 0),
      currency: 'USD',
    };
  }

  async getOrderStats(query: DashboardRangeDto = {}) {
    const range = resolveRange(query);
    const grouped = await this.prisma.order.groupBy({
      by: ['status'],
      where: { createdAt: { gte: range.start, lte: range.end } },
      _count: { _all: true },
    });

    return {
      range: { from: range.from, to: range.to },
      byStatus: grouped.map((row) => ({
        status: row.status,
        count: row._count._all,
      })),
    };
  }

  async getSalesTrend(query: DashboardRangeDto = {}) {
    const range = resolveRange(
      query.from || query.to
        ? query
        : { days: query.days ?? 30, from: query.from, to: query.to },
    );

    const start = range.start;
    const end = range.end;
    const dayMs = 24 * 60 * 60 * 1000;
    const safeDays = Math.min(
      Math.max(Math.floor((end.getTime() - start.getTime()) / dayMs) + 1, 1),
      365,
    );

    const orders = await this.prisma.order.findMany({
      where: { createdAt: { gte: start, lte: end } },
      select: { createdAt: true, total: true, status: true },
    });

    const buckets = new Map<string, { date: string; revenue: number; orders: number }>();
    for (let i = 0; i < safeDays; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      buckets.set(key, { date: key, revenue: 0, orders: 0 });
    }

    for (const order of orders) {
      const key = order.createdAt.toISOString().slice(0, 10);
      const bucket = buckets.get(key);
      if (!bucket) continue;
      bucket.orders += 1;
      bucket.revenue += Number(order.total ?? 0);
    }

    return {
      range: { from: range.from, to: range.to },
      days: safeDays,
      currency: 'USD',
      series: Array.from(buckets.values()),
    };
  }
}
