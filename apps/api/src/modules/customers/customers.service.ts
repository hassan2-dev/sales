import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CustomerQueryDto, UpdateCustomerDto } from './dto/customer.dto.js';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: CustomerQueryDto) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.CustomerWhereInput = {};
    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { company: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, status: true },
          },
          _count: { select: { orders: true, quotes: true, tickets: true } },
        },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            status: true,
          },
        },
        _count: { select: { orders: true, quotes: true, tickets: true } },
      },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async findMe(userId: string) {
    let customer = await this.prisma.customer.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            status: true,
          },
        },
        _count: { select: { orders: true, quotes: true, tickets: true } },
      },
    });

    if (!customer) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('Customer profile not found');

      const byPhone = user.phone
        ? await this.prisma.customer.findFirst({
            where: { phone: user.phone },
            orderBy: { createdAt: 'asc' },
          })
        : null;

      if (byPhone && !byPhone.userId) {
        customer = await this.prisma.customer.update({
          where: { id: byPhone.id },
          data: {
            userId: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                status: true,
              },
            },
            _count: { select: { orders: true, quotes: true, tickets: true } },
          },
        });
      } else if (!byPhone) {
        customer = await this.prisma.customer.create({
          data: {
            userId: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                status: true,
              },
            },
            _count: { select: { orders: true, quotes: true, tickets: true } },
          },
        });
      } else {
        // Phone already linked to another userId — still expose that row if same user
        throw new NotFoundException('Customer profile not found');
      }
    }

    return customer;
  }

  async updateMe(userId: string, dto: UpdateCustomerDto) {
    const customer = await this.findMe(userId);

    const email =
      dto.email?.trim() && !dto.email.trim().endsWith('@customers.local')
        ? dto.email.trim().toLowerCase()
        : undefined;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.firstName !== undefined ? { firstName: dto.firstName } : {}),
        ...(dto.lastName !== undefined ? { lastName: dto.lastName } : {}),
        ...(email ? { email } : {}),
      },
    });

    return this.prisma.customer.update({
      where: { id: customer.id },
      data: {
        ...(dto.firstName !== undefined ? { firstName: dto.firstName } : {}),
        ...(dto.lastName !== undefined ? { lastName: dto.lastName } : {}),
        ...(dto.company !== undefined ? { company: dto.company } : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
        ...(dto.address !== undefined ? { address: dto.address } : {}),
        ...(dto.city !== undefined ? { city: dto.city } : {}),
        ...(dto.country !== undefined ? { country: dto.country } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
        ...(email ? { email } : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            status: true,
          },
        },
        _count: { select: { orders: true, quotes: true, tickets: true } },
      },
    });
  }

  async update(id: string, dto: UpdateCustomerDto) {
    await this.findOne(id);
    return this.prisma.customer.update({
      where: { id },
      data: dto,
    });
  }

  async getHistory(id: string) {
    await this.findOne(id);

    const [orders, quotes, tickets] = await Promise.all([
      this.prisma.order.findMany({
        where: { customerId: id },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
          items: true,
          _count: { select: { items: true } },
        },
      }),
      this.prisma.quoteRequest.findMany({
        where: { customerId: id },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
          items: true,
          assignedTo: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      }),
      this.prisma.supportTicket.findMany({
        where: { customerId: id },
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true,
          ticketNumber: true,
          subject: true,
          status: true,
          priority: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    return { orders, quotes, tickets };
  }
}
