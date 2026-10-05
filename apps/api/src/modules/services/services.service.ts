import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ContentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { slugify } from '../../common/utils/slugify.js';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto.js';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateServiceDto) {
    const slug = await this.ensureUniqueSlug(dto.slug || slugify(dto.name));
    return this.prisma.service.create({
      data: {
        name: dto.name,
        nameAr: dto.nameAr,
        slug,
        description: dto.description,
        descriptionAr: dto.descriptionAr,
        shortDescription: dto.shortDescription,
        shortDescriptionAr: dto.shortDescriptionAr,
        image: dto.image,
        content: dto.content,
        contentAr: dto.contentAr,
        status: dto.status ?? ContentStatus.DRAFT,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async findAllPublic() {
    return this.prisma.service.findMany({
      where: { status: ContentStatus.PUBLISHED },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        brands: {
          orderBy: { sortOrder: 'asc' },
          include: {
            brand: {
              select: {
                id: true,
                name: true,
                slug: true,
                logo: true,
                description: true,
                website: true,
              },
            },
          },
        },
      },
    }).then((rows) =>
      rows.map((s) => ({
        ...s,
        brands: s.brands.map((sb) => sb.brand),
      })),
    );
  }

  async findBySlug(slug: string) {
    const service = await this.prisma.service.findFirst({
      where: { slug, status: ContentStatus.PUBLISHED },
      include: {
        brands: {
          orderBy: { sortOrder: 'asc' },
          include: {
            brand: {
              select: {
                id: true,
                name: true,
                slug: true,
                logo: true,
                description: true,
                website: true,
              },
            },
          },
        },
      },
    });
    if (!service) throw new NotFoundException('Service not found');
    return {
      ...service,
      brands: service.brands.map((sb) => sb.brand),
    };
  }

  async findAllAdmin() {
    return this.prisma.service.findMany({
      orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
    });
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  async update(id: string, dto: UpdateServiceDto) {
    await this.findOne(id);
    const data: Prisma.ServiceUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.nameAr !== undefined) data.nameAr = dto.nameAr;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.descriptionAr !== undefined) data.descriptionAr = dto.descriptionAr;
    if (dto.shortDescription !== undefined) {
      data.shortDescription = dto.shortDescription;
    }
    if (dto.shortDescriptionAr !== undefined) {
      data.shortDescriptionAr = dto.shortDescriptionAr;
    }
    if (dto.image !== undefined) data.image = dto.image;
    if (dto.content !== undefined) data.content = dto.content;
    if (dto.contentAr !== undefined) data.contentAr = dto.contentAr;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;
    if (dto.slug !== undefined) {
      data.slug = await this.ensureUniqueSlug(dto.slug, id);
    } else if (dto.name !== undefined) {
      data.slug = await this.ensureUniqueSlug(slugify(dto.name), id);
    }
    return this.prisma.service.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.service.delete({ where: { id } });
    return { deleted: true };
  }

  private async ensureUniqueSlug(base: string, excludeId?: string) {
    let slug = base;
    let i = 0;
    while (true) {
      const existing = await this.prisma.service.findUnique({ where: { slug } });
      if (!existing || existing.id === excludeId) return slug;
      i += 1;
      slug = `${base}-${i}`;
      if (i > 100) throw new ConflictException('Unable to generate unique slug');
    }
  }
}
