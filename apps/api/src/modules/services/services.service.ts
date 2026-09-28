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
        slug,
        description: dto.description,
        shortDescription: dto.shortDescription,
        image: dto.image,
        content: dto.content,
        status: dto.status ?? ContentStatus.DRAFT,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async findAllPublic() {
    return this.prisma.service.findMany({
      where: { status: ContentStatus.PUBLISHED },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async findBySlug(slug: string) {
    const service = await this.prisma.service.findFirst({
      where: { slug, status: ContentStatus.PUBLISHED },
    });
    if (!service) throw new NotFoundException('Service not found');
    return service;
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
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.shortDescription !== undefined) {
      data.shortDescription = dto.shortDescription;
    }
    if (dto.image !== undefined) data.image = dto.image;
    if (dto.content !== undefined) data.content = dto.content;
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
