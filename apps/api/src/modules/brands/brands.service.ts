import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ContentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { slugify } from '../../common/utils/slugify.js';
import { CreateBrandDto, UpdateBrandDto } from './dto/brand.dto.js';

@Injectable()
export class BrandsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBrandDto) {
    const slug = await this.ensureUniqueSlug(dto.slug || slugify(dto.name));
    return this.prisma.brand.create({
      data: {
        name: dto.name,
        slug,
        logo: dto.logo,
        description: dto.description,
        website: dto.website,
        status: dto.status ?? ContentStatus.PUBLISHED,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async findAllPublic() {
    return this.prisma.brand.findMany({
      where: { status: ContentStatus.PUBLISHED },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async findBySlug(slug: string) {
    const brand = await this.prisma.brand.findFirst({
      where: { slug, status: ContentStatus.PUBLISHED },
    });
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  async findAllAdmin() {
    return this.prisma.brand.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { products: true } } },
    });
  }

  async findOne(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  async update(id: string, dto: UpdateBrandDto) {
    await this.findOne(id);
    const data: Prisma.BrandUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.logo !== undefined) data.logo = dto.logo;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.website !== undefined) data.website = dto.website;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;
    if (dto.slug !== undefined) {
      data.slug = await this.ensureUniqueSlug(dto.slug, id);
    } else if (dto.name !== undefined) {
      data.slug = await this.ensureUniqueSlug(slugify(dto.name), id);
    }
    return this.prisma.brand.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.brand.delete({ where: { id } });
    return { deleted: true };
  }

  private async ensureUniqueSlug(base: string, excludeId?: string) {
    let slug = base;
    let i = 0;
    while (true) {
      const existing = await this.prisma.brand.findUnique({ where: { slug } });
      if (!existing || existing.id === excludeId) return slug;
      i += 1;
      slug = `${base}-${i}`;
      if (i > 100) throw new ConflictException('Unable to generate unique slug');
    }
  }
}
