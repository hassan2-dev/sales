import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Availability,
  Prisma,
  ProductStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { slugify } from '../../common/utils/slugify.js';
import {
  CreateProductDto,
  ProductQueryDto,
  UpdateProductDto,
} from './dto/product.dto.js';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  private productInclude = {
    brand: true,
    category: true,
    images: { orderBy: [{ isPrimary: 'desc' as const }, { sortOrder: 'asc' as const }] },
    documents: true,
    inventory: true,
    relatedFrom: {
      include: {
        relatedProduct: {
          include: {
            brand: true,
            category: true,
            images: {
              orderBy: [{ isPrimary: 'desc' as const }, { sortOrder: 'asc' as const }],
              take: 1,
            },
          },
        },
      },
    },
  };

  async create(dto: CreateProductDto) {
    const slug = await this.ensureUniqueSlug(dto.slug || slugify(dto.name));
    const existingSku = await this.prisma.product.findUnique({
      where: { sku: dto.sku },
    });
    if (existingSku) throw new BadRequestException('SKU already exists');

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: dto.name,
          slug,
          sku: dto.sku,
          description: dto.description,
          shortDescription: dto.shortDescription,
          brandId: dto.brandId,
          categoryId: dto.categoryId,
          price: dto.price,
          currency: dto.currency ?? 'USD',
          stock: dto.stock ?? 0,
          availability: dto.availability ?? Availability.IN_STOCK,
          featured: dto.featured ?? false,
          status: dto.status ?? ProductStatus.DRAFT,
          specifications:
            (dto.specifications as Prisma.InputJsonValue | undefined) ??
            undefined,
          metaTitle: dto.metaTitle,
          metaDescription: dto.metaDescription,
        },
      });

      await tx.inventory.create({
        data: {
          productId: product.id,
          quantity: dto.stock ?? 0,
        },
      });

      if (dto.relatedProductIds?.length) {
        await tx.productRelation.createMany({
          data: dto.relatedProductIds.map((relatedProductId) => ({
            productId: product.id,
            relatedProductId,
          })),
        });
      }

      return tx.product.findUnique({
        where: { id: product.id },
        include: this.productInclude,
      });
    });
  }

  async findCatalog(query: ProductQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Math.min(Number(query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      status: ProductStatus.ACTIVE,
    };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { sku: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.brandId) where.brandId = query.brandId;
    if (query.excludeId) where.id = { not: query.excludeId };
    if (query.availability) where.availability = query.availability;
    if (query.featured !== undefined)
      where.featured =
        query.featured === true ||
        query.featured === ('true' as unknown as boolean);
    if (query.categorySlug) where.category = { slug: query.categorySlug };
    if (query.brandSlug) where.brand = { slug: query.brandSlug };

    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';
    const catalogInclude = {
      brand: true,
      category: true,
      images: {
        orderBy: [{ isPrimary: 'desc' as const }, { sortOrder: 'asc' as const }],
        take: 1,
      },
    };

    if (sortBy === 'bestsellers' || sortBy === 'sales') {
      return this.findBestsellers(where, page, limit, skip, catalogInclude);
    }

    const allowedSort = ['createdAt', 'updatedAt', 'name', 'price', 'stock'];
    const orderBy = {
      [allowedSort.includes(sortBy) ? sortBy : 'createdAt']: sortOrder,
    } as Prisma.ProductOrderByWithRelationInput;

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: catalogInclude,
      }),
      this.prisma.product.count({ where }),
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

  private async findBestsellers(
    where: Prisma.ProductWhereInput,
    page: number,
    limit: number,
    skip: number,
    include: Prisma.ProductInclude,
  ) {
    const matching = await this.prisma.product.findMany({
      where,
      select: { id: true },
    });
    const matchingIds = matching.map((p) => p.id);
    if (!matchingIds.length) {
      return {
        data: [],
        meta: { total: 0, page, limit, totalPages: 1 },
      };
    }

    const sales = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      where: { productId: { in: matchingIds } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
    });

    const soldIds = sales.map((s) => s.productId);
    const unsoldIds = matchingIds.filter((id) => !soldIds.includes(id));
    const rankedIds = [...soldIds, ...unsoldIds];
    const total = rankedIds.length;
    const pageIds = rankedIds.slice(skip, skip + limit);

    const rows = await this.prisma.product.findMany({
      where: { id: { in: pageIds } },
      include,
    });
    const byId = new Map(rows.map((r) => [r.id, r]));
    const data = pageIds.map((id) => byId.get(id)).filter(Boolean);

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

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, status: ProductStatus.ACTIVE },
      include: this.productInclude,
    });
    if (!product) throw new NotFoundException('Product not found');

    const related = (product.relatedFrom ?? [])
      .map((r) => r.relatedProduct)
      .filter((p) => p && (p as { status?: ProductStatus }).status === ProductStatus.ACTIVE);

    const categoryProductInclude = {
      brand: true,
      category: true,
      images: {
        orderBy: [{ isPrimary: 'desc' as const }, { sortOrder: 'asc' as const }],
        take: 1,
      },
    };

    const categoryVariants = product.categoryId
      ? await this.prisma.product.findMany({
          where: {
            status: ProductStatus.ACTIVE,
            categoryId: product.categoryId,
          },
          orderBy: [{ featured: 'desc' }, { name: 'asc' }],
          include: categoryProductInclude,
        })
      : [];

    const excludeIds = [product.id, ...related.map((p) => p.id)];
    const similarFromCategory = categoryVariants
      .filter((p) => !excludeIds.includes(p.id))
      .slice(0, Math.max(0, 8 - related.length));

    const similar = [...related, ...similarFromCategory].slice(0, 8);

    return { ...product, similar, variants: categoryVariants };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: this.productInclude,
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);
    const data: Prisma.ProductUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.slug !== undefined) data.slug = await this.ensureUniqueSlug(dto.slug, id);
    if (dto.sku !== undefined) data.sku = dto.sku;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.shortDescription !== undefined) data.shortDescription = dto.shortDescription;
    if (dto.price !== undefined) data.price = dto.price;
    if (dto.currency !== undefined) data.currency = dto.currency;
    if (dto.stock !== undefined) data.stock = dto.stock;
    if (dto.availability !== undefined) data.availability = dto.availability;
    if (dto.featured !== undefined) data.featured = dto.featured;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.specifications !== undefined) {
      data.specifications = dto.specifications as Prisma.InputJsonValue;
    }
    if (dto.metaTitle !== undefined) data.metaTitle = dto.metaTitle;
    if (dto.metaDescription !== undefined) data.metaDescription = dto.metaDescription;
    if (dto.brandId !== undefined) {
      data.brand = dto.brandId
        ? { connect: { id: dto.brandId } }
        : { disconnect: true };
    }
    if (dto.categoryId !== undefined) {
      data.category = dto.categoryId
        ? { connect: { id: dto.categoryId } }
        : { disconnect: true };
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.product.update({ where: { id }, data });

      if (dto.stock !== undefined) {
        await tx.inventory.upsert({
          where: { productId: id },
          update: { quantity: dto.stock },
          create: { productId: id, quantity: dto.stock },
        });
      }

      if (dto.relatedProductIds) {
        await tx.productRelation.deleteMany({ where: { productId: id } });
        if (dto.relatedProductIds.length) {
          await tx.productRelation.createMany({
            data: dto.relatedProductIds.map((relatedProductId) => ({
              productId: id,
              relatedProductId,
            })),
          });
        }
      }

      return tx.product.findUnique({
        where: { id },
        include: this.productInclude,
      });
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.product.delete({ where: { id } });
    return { success: true };
  }

  async addImage(
    productId: string,
    data: { url: string; alt?: string; sortOrder?: number; isPrimary?: boolean },
  ) {
    await this.findOne(productId);
    if (data.isPrimary) {
      await this.prisma.productImage.updateMany({
        where: { productId },
        data: { isPrimary: false },
      });
    }
    return this.prisma.productImage.create({
      data: {
        productId,
        url: data.url,
        alt: data.alt,
        sortOrder: data.sortOrder ?? 0,
        isPrimary: data.isPrimary ?? false,
      },
    });
  }

  async removeImage(productId: string, imageId: string) {
    const image = await this.prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });
    if (!image) throw new NotFoundException('Image not found');
    await this.prisma.productImage.delete({ where: { id: imageId } });
    return { success: true };
  }

  async addDocument(
    productId: string,
    data: { name: string; url: string; mimeType?: string; size?: number },
  ) {
    await this.findOne(productId);
    return this.prisma.productDocument.create({
      data: { productId, ...data },
    });
  }

  async removeDocument(productId: string, documentId: string) {
    const doc = await this.prisma.productDocument.findFirst({
      where: { id: documentId, productId },
    });
    if (!doc) throw new NotFoundException('Document not found');
    await this.prisma.productDocument.delete({ where: { id: documentId } });
    return { success: true };
  }

  private async ensureUniqueSlug(base: string, excludeId?: string) {
    let slug = slugify(base);
    let i = 0;
    while (true) {
      const candidate = i === 0 ? slug : `${slug}-${i}`;
      const existing = await this.prisma.product.findUnique({
        where: { slug: candidate },
      });
      if (!existing || existing.id === excludeId) return candidate;
      i += 1;
    }
  }
}
