import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ContentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { slugify } from '../../common/utils/slugify.js';
import { CreatePageDto, UpdatePageDto } from './dto/page.dto.js';

@Injectable()
export class PagesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePageDto) {
    const slug = await this.ensureUniqueSlug(dto.slug || slugify(dto.title));
    return this.prisma.page.create({
      data: {
        title: dto.title,
        slug,
        content: dto.content,
        excerpt: dto.excerpt,
        coverImage: dto.coverImage,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
        status: dto.status ?? ContentStatus.DRAFT,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async findAllPublic() {
    return this.prisma.page.findMany({
      where: { status: ContentStatus.PUBLISHED },
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
    });
  }

  async findBySlug(slug: string) {
    const page = await this.prisma.page.findFirst({
      where: { slug, status: ContentStatus.PUBLISHED },
    });
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  async findAllAdmin() {
    return this.prisma.page.findMany({
      orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
    });
  }

  async findOne(id: string) {
    const page = await this.prisma.page.findUnique({ where: { id } });
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  async update(id: string, dto: UpdatePageDto) {
    await this.findOne(id);
    const data: Prisma.PageUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.content !== undefined) data.content = dto.content;
    if (dto.excerpt !== undefined) data.excerpt = dto.excerpt;
    if (dto.coverImage !== undefined) data.coverImage = dto.coverImage;
    if (dto.metaTitle !== undefined) data.metaTitle = dto.metaTitle;
    if (dto.metaDescription !== undefined) {
      data.metaDescription = dto.metaDescription;
    }
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;
    if (dto.slug !== undefined) {
      data.slug = await this.ensureUniqueSlug(dto.slug, id);
    } else if (dto.title !== undefined) {
      data.slug = await this.ensureUniqueSlug(slugify(dto.title), id);
    }
    return this.prisma.page.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.page.delete({ where: { id } });
    return { deleted: true };
  }

  private async ensureUniqueSlug(base: string, excludeId?: string) {
    let slug = base;
    let i = 0;
    while (true) {
      const existing = await this.prisma.page.findUnique({ where: { slug } });
      if (!existing || existing.id === excludeId) return slug;
      i += 1;
      slug = `${base}-${i}`;
      if (i > 100) throw new ConflictException('Unable to generate unique slug');
    }
  }
}
