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

@Injectable()
export class QuotesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateQuoteDto) {
    if (!dto.items?.length) {
      throw new BadRequestException('At least one product is required');
    }

    let customerId = dto.customerId;
    if (!customerId) {
      if (!dto.email || !dto.firstName || !dto.lastName) {
        throw new BadRequestException(
          'Customer details are required when customerId is not provided',
        );
      }
      const customer = await this.prisma.customer.create({
        data: {
          email: dto.email,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          company: dto.company,
        },
      });
      customerId = customer.id;
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
