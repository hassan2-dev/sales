import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TicketPriority, TicketStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { generateTicketNumber } from '../../common/utils/order-number.util.js';
import {
  CreateCustomerTicketDto,
  CreateMessageDto,
  CreateTicketDto,
  TicketQueryDto,
  UpdateTicketDto,
} from './dto/support.dto.js';

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTicketDto) {
    return this.prisma.supportTicket.create({
      data: {
        ticketNumber: generateTicketNumber(),
        customerId: dto.customerId,
        subject: dto.subject,
        description: dto.description,
        priority: dto.priority ?? TicketPriority.MEDIUM,
        status: TicketStatus.OPEN,
      },
      include: { customer: true },
    });
  }

  async createForUser(userId: string, dto: CreateCustomerTicketDto) {
    const customer = await this.prisma.customer.findUnique({ where: { userId } });
    if (!customer) throw new NotFoundException('Customer profile not found');
    return this.create({
      customerId: customer.id,
      subject: dto.subject.trim(),
      description: dto.description.trim(),
    });
  }

  async listForUser(userId: string) {
    const customer = await this.prisma.customer.findUnique({ where: { userId } });
    if (!customer) return { data: [] };
    const data = await this.prisma.supportTicket.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { _count: { select: { messages: true } } },
    });
    return { data };
  }

  async findAll(query: TicketQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Math.min(Number(query.limit) || 20, 100);
    const skip = (page - 1) * limit;
    const where: Prisma.SupportTicketWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    if (query.assignedToId) where.assignedToId = query.assignedToId;
    if (query.customerId) where.customerId = query.customerId;
    const term = query.search?.trim();
    if (term) {
      where.OR = [
        { ticketNumber: { contains: term, mode: 'insensitive' } },
        { subject: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        {
          customer: {
            OR: [
              { firstName: { contains: term, mode: 'insensitive' } },
              { lastName: { contains: term, mode: 'insensitive' } },
              { email: { contains: term, mode: 'insensitive' } },
              { phone: { contains: term, mode: 'insensitive' } },
              { company: { contains: term, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    const countWhere: Prisma.SupportTicketWhereInput = { ...where };
    delete countWhere.status;

    const [data, total, grouped] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          assignedTo: {
            select: { id: true, firstName: true, lastName: true },
          },
          _count: { select: { messages: true } },
        },
      }),
      this.prisma.supportTicket.count({ where }),
      this.prisma.supportTicket.groupBy({
        by: ['status'],
        where: countWhere,
        _count: { _all: true },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
        statusCounts: Object.fromEntries(grouped.map((row) => [row.status, row._count._all])),
      },
    };
  }

  async findOne(id: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id },
      include: {
        customer: true,
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
            attachments: true,
          },
        },
      },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async update(id: string, dto: UpdateTicketDto) {
    await this.findOne(id);
    return this.prisma.supportTicket.update({
      where: { id },
      data: {
        priority: dto.priority,
        status: dto.status,
        assignedToId: dto.assignedToId,
        subject: dto.subject,
        description: dto.description,
      },
      include: { customer: true, assignedTo: true },
    });
  }

  async assign(id: string, assignedToId: string) {
    return this.update(id, {
      assignedToId,
      status: TicketStatus.IN_PROGRESS,
    });
  }

  async changePriority(id: string, priority: TicketPriority) {
    return this.update(id, { priority });
  }

  async changeStatus(id: string, status: TicketStatus) {
    return this.update(id, { status });
  }

  async addMessage(ticketId: string, senderId: string, dto: CreateMessageDto) {
    await this.findOne(ticketId);
    const message = await this.prisma.supportMessage.create({
      data: {
        ticketId,
        senderId,
        message: dto.message,
        isInternal: dto.isInternal ?? false,
        attachments: dto.attachments?.length
          ? { create: dto.attachments }
          : undefined,
      },
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        attachments: true,
      },
    });

    if (!dto.isInternal) {
      await this.prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status: TicketStatus.WAITING_FOR_CUSTOMER },
      });
    }

    return message;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.supportTicket.delete({ where: { id } });
    return { deleted: true };
  }
}
