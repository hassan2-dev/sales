import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, QuoteStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { generateQuoteNumber } from '../../common/utils/order-number.util.js';
import {
  CreateQuoteDto,
  UpdateQuoteStatusDto,
  QuoteQueryDto,
} from './dto/quote.dto.js';
import { phoneToSyntheticEmail } from '../../common/utils/phone.util.js';

@Injectable()
export class QuotesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateQuoteDto, userId?: string) {
    if (!dto.items?.length) {
      throw new BadRequestException('At least one product is required');
    }

    if (!dto.company?.trim()) {
      throw new BadRequestException('Company name is required for B2B quotes');
    }

    let customerId = dto.customerId;

    if (userId) {
      const linked = await this.prisma.customer.findUnique({
        where: { userId },
      });
      if (linked) {
        const email =
          dto.email?.trim() && !dto.email.trim().endsWith('@customers.local')
            ? dto.email.trim().toLowerCase()
            : linked.email;
        await this.prisma.customer.update({
          where: { id: linked.id },
          data: {
            firstName: dto.firstName?.trim() || linked.firstName,
            lastName: dto.lastName?.trim() || linked.lastName,
            phone: dto.phone?.trim() || linked.phone,
            company: dto.company.trim(),
            email,
            address: dto.address?.trim() || linked.address,
            city: dto.city?.trim() || linked.city,
          },
        });
        if (dto.firstName || dto.lastName) {
          await this.prisma.user.update({
            where: { id: userId },
            data: {
              ...(dto.firstName?.trim() ? { firstName: dto.firstName.trim() } : {}),
              ...(dto.lastName?.trim() ? { lastName: dto.lastName.trim() } : {}),
            },
          });
        }
        customerId = linked.id;
      }
    }

    if (!customerId) {
      const firstName = dto.firstName?.trim();
      const lastName = dto.lastName?.trim();
      const phone = dto.phone?.trim();
      if (!firstName || !lastName || !phone) {
        throw new BadRequestException(
          'Name and phone are required when not linked to an account',
        );
      }
      const email =
        dto.email?.trim() && !dto.email.trim().endsWith('@customers.local')
          ? dto.email.trim().toLowerCase()
          : phoneToSyntheticEmail(phone);

      const existing = await this.prisma.customer.findFirst({
        where: {
          OR: [
            { phone },
            { email: { equals: email, mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'asc' },
      });

      if (existing) {
        const customer = await this.prisma.customer.update({
          where: { id: existing.id },
          data: {
            firstName,
            lastName,
            phone,
            company: dto.company.trim(),
            email,
            address: dto.address?.trim() || existing.address,
            city: dto.city?.trim() || existing.city,
            userId: userId ?? existing.userId,
          },
        });
        customerId = customer.id;
      } else {
        const customer = await this.prisma.customer.create({
          data: {
            email,
            firstName,
            lastName,
            phone,
            company: dto.company.trim(),
            address: dto.address?.trim(),
            city: dto.city?.trim(),
            userId,
          },
        });
        customerId = customer.id;
      }
    }

    const products = await this.prisma.product.findMany({
      where: { id: { in: dto.items.map((i) => i.productId) } },
    });
    const map = new Map(products.map((p) => [p.id, p]));

    return this.prisma.quoteRequest.create({
      data: {
        quoteNumber: generateQuoteNumber(),
        customerId,
        message: dto.message,
        status: QuoteStatus.PENDING,
        items: {
          create: dto.items.map((item) => {
            const product = map.get(item.productId);
            if (!product) {
              throw new BadRequestException(`Product ${item.productId} not found`);
            }
            return {
              productId: product.id,
              productName: product.name,
              sku: product.sku,
              quantity: item.quantity,
              unitPriceHint: product.price,
            };
          }),
        },
        attachments: dto.attachmentUrls?.length
          ? {
              create: dto.attachmentUrls.map((url) => ({
                url,
                fileName: url.split('/').pop() || 'attachment',
              })),
            }
          : undefined,
      },
      include: {
        customer: true,
        items: true,
        attachments: true,
      },
    });
  }

  async listForUser(userId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { userId },
    });
    if (!customer) return { data: [] };

    const data = await this.prisma.quoteRequest.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        _count: { select: { items: true } },
      },
    });
    return { data };
  }

  async findAll(query: QuoteQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Math.min(Number(query.limit) || 20, 100);
    const skip = (page - 1) * limit;
    const where: Prisma.QuoteRequestWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.assignedToId) where.assignedToId = query.assignedToId;
    if (query.search) {
      where.OR = [
        { quoteNumber: { contains: query.search, mode: 'insensitive' } },
        { customer: { email: { contains: query.search, mode: 'insensitive' } } },
        { customer: { company: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.quoteRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          assignedTo: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          items: true,
          _count: { select: { items: true } },
        },
      }),
      this.prisma.quoteRequest.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  async findOne(id: string) {
    const quote = await this.prisma.quoteRequest.findUnique({
      where: { id },
      include: {
        customer: true,
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        items: { include: { product: { include: { images: true } } } },
        attachments: true,
      },
    });
    if (!quote) throw new NotFoundException('Quote not found');
    return quote;
  }

  async assign(id: string, assignedToId: string) {
    await this.findOne(id);
    return this.prisma.quoteRequest.update({
      where: { id },
      data: { assignedToId, status: QuoteStatus.REVIEWING },
      include: { customer: true, assignedTo: true, items: true },
    });
  }

  async updateStatus(id: string, dto: UpdateQuoteStatusDto) {
    await this.findOne(id);
    return this.prisma.quoteRequest.update({
      where: { id },
      data: {
        status: dto.status,
        quotedAmount: dto.quotedAmount,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
      },
      include: { customer: true, assignedTo: true, items: true },
    });
  }
}
