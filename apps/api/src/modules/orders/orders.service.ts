import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Availability,
  OrderStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { generateOrderNumber } from '../../common/utils/order-number.util.js';

export interface CreateOrderInput {
  customerId?: string;
  sessionId?: string;
  shippingAddress?: string;
  billingAddress?: string;
  notes?: string;
  shipping?: number;
  discount?: number;
  createdById?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
}

const orderInclude = {
  customer: true,
  createdBy: {
    select: { id: true, firstName: true, lastName: true, email: true },
  },
  items: {
    include: {
      product: {
        select: { id: true, slug: true, name: true, sku: true },
      },
    },
  },
  history: { orderBy: { createdAt: 'asc' as const } },
  orderNotes: {
    orderBy: { createdAt: 'desc' as const },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
  },
} satisfies Prisma.OrderInclude;

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async createFromCart(dto: CreateOrderInput) {
    if (!dto.sessionId?.trim()) {
      throw new BadRequestException(
        'sessionId is required to create order from cart',
      );
    }

    let customerId = dto.customerId;
    if (!customerId) {
      if (!dto.email || !dto.firstName || !dto.lastName) {
        throw new BadRequestException(
          'customerId or guest customer details are required',
        );
      }
      const customer = await this.prisma.customer.create({
        data: {
          email: dto.email,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          company: dto.company,
          address: dto.shippingAddress,
        },
      });
      customerId = customer.id;
    } else {
      const customer = await this.prisma.customer.findUnique({
        where: { id: customerId },
      });
      if (!customer) throw new NotFoundException('Customer not found');
    }

    const cart = await this.prisma.cart.findUnique({
      where: { sessionId: dto.sessionId },
      include: {
        items: { include: { product: true } },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    return this.prisma.$transaction(async (tx) => {
      const lineItems: {
        productId: string;
        productName: string;
        sku: string;
        unitPrice: number;
        quantity: number;
        lineTotal: number;
      }[] = [];

      for (const item of cart.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });
        if (!product) {
          throw new BadRequestException(
            `Product ${item.productId} no longer exists`,
          );
        }

        const unitPrice = Number(product.price);
        lineItems.push({
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          unitPrice,
          quantity: item.quantity,
          lineTotal: unitPrice * item.quantity,
        });

        const inventory = await tx.inventory.findUnique({
          where: { productId: product.id },
        });
        const available = inventory
          ? inventory.quantity - inventory.reserved
          : product.stock;

        if (available < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for ${product.sku}`,
          );
        }

        if (inventory) {
          await tx.inventory.update({
            where: { productId: product.id },
            data: { quantity: { decrement: item.quantity } },
          });
        }

        const newStock = product.stock - item.quantity;
        await tx.product.update({
          where: { id: product.id },
          data: {
            stock: { decrement: item.quantity },
            availability:
              newStock <= 0
                ? Availability.OUT_OF_STOCK
                : product.availability,
          },
        });
      }

      const subtotal = lineItems.reduce((sum, i) => sum + i.lineTotal, 0);
      const discount = dto.discount ?? 0;
      const shipping = dto.shipping ?? 0;
      const total = Math.max(0, subtotal - discount + shipping);
      const currency = cart.items[0]?.product.currency ?? 'USD';

      const order = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          customerId,
          createdById: dto.createdById,
          subtotal,
          discount,
          shipping,
          total,
          currency,
          status: OrderStatus.PENDING,
          shippingAddress: dto.shippingAddress,
          billingAddress: dto.billingAddress,
          notes: dto.notes,
          items: {
            create: lineItems.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              sku: item.sku,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              lineTotal: item.lineTotal,
            })),
          },
          history: {
            create: {
              fromStatus: null,
              toStatus: OrderStatus.PENDING,
              note: 'Order created',
              changedBy: dto.createdById,
            },
          },
        },
        include: orderInclude,
      });

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return order;
    });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    status?: OrderStatus;
    customerId?: string;
    search?: string;
  }) {
    const page = Number(query.page) || 1;
    const limit = Math.min(Number(query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.customerId) where.customerId = query.customerId;
    if (query.search) {
      where.OR = [
        { orderNumber: { contains: query.search, mode: 'insensitive' } },
        {
          customer: {
            email: { contains: query.search, mode: 'insensitive' },
          },
        },
        {
          customer: {
            firstName: { contains: query.search, mode: 'insensitive' },
          },
        },
        {
          customer: {
            lastName: { contains: query.search, mode: 'insensitive' },
          },
        },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          items: true,
          _count: { select: { items: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: orderInclude,
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(
    id: string,
    status: OrderStatus,
    userId?: string,
    note?: string,
  ) {
    const order = await this.findOne(id);
    if (order.status === status) return order;

    return this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id },
        data: { status },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          fromStatus: order.status,
          toStatus: status,
          note,
          changedBy: userId,
        },
      });

      return tx.order.findUniqueOrThrow({
        where: { id },
        include: orderInclude,
      });
    });
  }

  async addNote(
    id: string,
    userId: string,
    note: string,
    isInternal = true,
  ) {
    await this.findOne(id);
    if (!userId) throw new BadRequestException('Authenticated user required');

    await this.prisma.orderNote.create({
      data: {
        orderId: id,
        userId,
        note,
        isInternal,
      },
    });

    return this.findOne(id);
  }
}
