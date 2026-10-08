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

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly analytics: AnalyticsService,
  ) {}

  async getOverview() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
      ordersTotal,
      ordersPending,
      ordersToday,
      productsTotal,
      productsActive,
      inventoryRows,
      quotesTotal,
      quotesPending,
      ticketsOpen,
      monthRevenue,
      recentOrders,
      visitors,
    ] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.count({
        where: {
          status: {
            in: [
              OrderStatus.PENDING,
              OrderStatus.CONFIRMED,
              OrderStatus.PROCESSING,
            ],
          },
        },
      }),
      this.prisma.order.count({
        where: { createdAt: { gte: startOfDay } },
      }),
      this.prisma.product.count(),
      this.prisma.product.count({
        where: { status: ProductStatus.ACTIVE },
      }),
      this.prisma.inventory.findMany({
        select: { quantity: true, lowStockAt: true },
      }),
      this.prisma.quoteRequest.count(),
      this.prisma.quoteRequest.count({
        where: {
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
          createdAt: { gte: startOfMonth },
          OR: [
            { status: OrderStatus.COMPLETED },
            { paymentStatus: PaymentStatus.PAID },
          ],
        },
        _sum: { total: true },
      }),
      this.prisma.order.findMany({
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
      this.analytics.getVisitorStats(),
    ]);

    const lowStock = inventoryRows.filter(
      (row) => row.quantity <= row.lowStockAt,
    ).length;

    return {
      orders: {
        total: ordersTotal,
        pending: ordersPending,
        today: ordersToday,
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
        monthTotal: Number(monthRevenue._sum.total ?? 0),
        currency: 'USD',
      },
      recentOrders,
    };
  }

  async getSales() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [month, completed] = await Promise.all([
      this.prisma.order.aggregate({
        where: { createdAt: { gte: startOfMonth } },
        _sum: { total: true },
        _count: true,
      }),
      this.prisma.order.aggregate({
        where: {
          createdAt: { gte: startOfMonth },
          status: OrderStatus.COMPLETED,
        },
        _sum: { total: true },
        _count: true,
      }),
    ]);

    return {
      monthOrders: month._count,
      monthRevenue: Number(month._sum.total ?? 0),
      completedOrders: completed._count,
      completedRevenue: Number(completed._sum.total ?? 0),
      currency: 'USD',
    };
  }

  async getOrderStats() {
    const grouped = await this.prisma.order.groupBy({
      by: ['status'],
      _count: { _all: true },
    });

    return {
      byStatus: grouped.map((row) => ({
        status: row.status,
        count: row._count._all,
      })),
    };
  }

  async getSalesTrend(days = 30) {
    const safeDays = Math.min(Math.max(Number(days) || 30, 7), 90);
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (safeDays - 1));

    const orders = await this.prisma.order.findMany({
      where: { createdAt: { gte: start } },
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
      days: safeDays,
      currency: 'USD',
      series: Array.from(buckets.values()),
    };
  }
}
