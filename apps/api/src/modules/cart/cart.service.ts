import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AddCartItemDto, UpdateCartItemDto } from './dto/cart.dto.js';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(sessionId: string) {
    const cart = await this.getOrCreateCart(sessionId);
    return this.formatCart(cart.id);
  }

  async addItem(sessionId: string, dto: AddCartItemDto) {
    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, status: ProductStatus.ACTIVE },
    });
    if (!product) throw new NotFoundException('Product not found or inactive');

    const cart = await this.getOrCreateCart(sessionId);

    await this.prisma.cartItem.upsert({
      where: {
        cartId_productId: { cartId: cart.id, productId: dto.productId },
      },
      create: {
        cartId: cart.id,
        productId: dto.productId,
        quantity: dto.quantity,
      },
      update: {
        quantity: { increment: dto.quantity },
      },
    });

    return this.formatCart(cart.id);
  }

  async updateItem(sessionId: string, itemId: string, dto: UpdateCartItemDto) {
    const cart = await this.getOrCreateCart(sessionId);
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });
    if (!item) throw new NotFoundException('Cart item not found');

    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
    });

    return this.formatCart(cart.id);
  }

  async removeItem(sessionId: string, itemId: string) {
    const cart = await this.getOrCreateCart(sessionId);
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });
    if (!item) throw new NotFoundException('Cart item not found');

    await this.prisma.cartItem.delete({ where: { id: itemId } });
    return this.formatCart(cart.id);
  }

  async clearCart(sessionId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { sessionId } });
    if (!cart) return { items: [], subtotal: 0, currency: 'USD' };
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return this.formatCart(cart.id);
  }

  private async getOrCreateCart(sessionId: string) {
    if (!sessionId?.trim()) {
      throw new BadRequestException('X-Session-Id header is required');
    }
    return this.prisma.cart.upsert({
      where: { sessionId },
      create: { sessionId },
      update: {},
    });
  }

  private async formatCart(cartId: string) {
    const cart = await this.prisma.cart.findUniqueOrThrow({
      where: { id: cartId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  where: { isPrimary: true },
                  take: 1,
                },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    const items = cart.items.map((item) => {
      const unitPrice = Number(item.product.price);
      const lineTotal = unitPrice * item.quantity;
      return {
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        lineTotal,
        currency: item.product.currency,
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          sku: item.product.sku,
          price: unitPrice,
          currency: item.product.currency,
          stock: item.product.stock,
          availability: item.product.availability,
          images: item.product.images,
        },
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const currency = items[0]?.currency ?? 'USD';

    return {
      id: cart.id,
      sessionId: cart.sessionId,
      items,
      subtotal,
      currency,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      updatedAt: cart.updatedAt,
    };
  }
}
