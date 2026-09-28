import { Injectable, NotFoundException } from '@nestjs/common';
import { Availability } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { UpdateInventoryDto } from './dto/inventory.dto.js';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findByProductId(productId: string) {
    const inventory = await this.prisma.inventory.findUnique({
      where: { productId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            stock: true,
            status: true,
          },
        },
      },
    });
    if (!inventory) throw new NotFoundException('Inventory not found');
    return inventory;
  }

  async update(productId: string, dto: UpdateInventoryDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.inventory.upsert({
        where: { productId },
        create: {
          productId,
          quantity: dto.quantity,
          reserved: dto.reserved ?? 0,
          lowStockAt: dto.lowStockAt ?? 5,
          warehouseNote: dto.warehouseNote,
        },
        update: {
          quantity: dto.quantity,
          ...(dto.reserved !== undefined ? { reserved: dto.reserved } : {}),
          ...(dto.lowStockAt !== undefined
            ? { lowStockAt: dto.lowStockAt }
            : {}),
          ...(dto.warehouseNote !== undefined
            ? { warehouseNote: dto.warehouseNote }
            : {}),
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              stock: true,
              status: true,
            },
          },
        },
      });

      const availability =
        dto.quantity > 0 ? Availability.IN_STOCK : Availability.OUT_OF_STOCK;

      await tx.product.update({
        where: { id: productId },
        data: { stock: dto.quantity, availability },
      });

      return updated;
    });
  }

  async findLowStock() {
    const rows = await this.prisma.inventory.findMany({
      include: {
        product: {
          select: { id: true, name: true, sku: true, status: true },
        },
      },
      orderBy: { quantity: 'asc' },
    });
    return rows.filter((row) => row.quantity <= row.lowStockAt);
  }
}
