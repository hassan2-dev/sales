import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ContentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { slugify } from '../../common/utils/slugify.js';
import {
  CreateNewsDto,
  SetFeaturedDto,
  UpdateNewsDto,
} from './dto/news.dto.js';

@Injectable()
export class NewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateNewsDto) {
    const slug = await this.ensureUniqueSlug(dto.slug || slugify(dto.title));
    const status = dto.status ?? ContentStatus.DRAFT;
    return this.prisma.newsArticle.create({
      data: {
        title: dto.title,
        slug,
        excerpt: dto.excerpt,
        content: dto.content,
        coverImage: dto.coverImage,
        author: dto.author,
        category: dto.category,
        featured: dto.featured ?? false,
        status,
        publishedAt:
          dto.publishedAt != null
            ? new Date(dto.publishedAt)
            : status === ContentStatus.PUBLISHED
              ? new Date()
              : undefined,
      },
    });
  }

  async findAllPublic() {
    return this.prisma.newsArticle.findMany({
      where: { status: ContentStatus.PUBLISHED },
      orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }],
    });
  }

  async findBySlug(slug: string) {
    const article = await this.prisma.newsArticle.findFirst({
      where: { slug, status: ContentStatus.PUBLISHED },
    });
    if (!article) throw new NotFoundException('News article not found');
    return article;
  }

  async findAllAdmin() {
    return this.prisma.newsArticle.findMany({
      orderBy: [{ updatedAt: 'desc' }],
    });
  }

  async findOne(id: string) {
    const article = await this.prisma.newsArticle.findUnique({ where: { id } });
    if (!article) throw new NotFoundException('News article not found');
    return article;
  }

  async update(id: string, dto: UpdateNewsDto) {
    await this.findOne(id);
    const data: Prisma.NewsArticleUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.excerpt !== undefined) data.excerpt = dto.excerpt;
    if (dto.content !== undefined) data.content = dto.content;
    if (dto.coverImage !== undefined) data.coverImage = dto.coverImage;
    if (dto.author !== undefined) data.author = dto.author;
    if (dto.category !== undefined) data.category = dto.category;
    if (dto.featured !== undefined) data.featured = dto.featured;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.publishedAt !== undefined) {
      data.publishedAt = dto.publishedAt ? new Date(dto.publishedAt) : null;
    }
    if (dto.slug !== undefined) {
      data.slug = await this.ensureUniqueSlug(dto.slug, id);
    } else if (dto.title !== undefined) {
      data.slug = await this.ensureUniqueSlug(slugify(dto.title), id);
    }
    return this.prisma.newsArticle.update({ where: { id }, data });
  }

  async publish(id: string) {
    await this.findOne(id);
    return this.prisma.newsArticle.update({
      where: { id },
      data: {
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });
  }

  async unpublish(id: string) {
    await this.findOne(id);
    return this.prisma.newsArticle.update({
      where: { id },
      data: { status: ContentStatus.DRAFT },
    });
  }

  async setFeatured(id: string, dto: SetFeaturedDto) {
    await this.findOne(id);
    return this.prisma.newsArticle.update({
      where: { id },
      data: { featured: dto.featured },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.newsArticle.delete({ where: { id } });
    return { deleted: true };
  }

  private async ensureUniqueSlug(base: string, excludeId?: string) {
    let slug = base;
    let i = 0;
    while (true) {
      const existing = await this.prisma.newsArticle.findUnique({
        where: { slug },
      });
      if (!existing || existing.id === excludeId) return slug;
      i += 1;
      slug = `${base}-${i}`;
      if (i > 100) throw new ConflictException('Unable to generate unique slug');
    }
  }
}
