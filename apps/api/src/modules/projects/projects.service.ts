import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ContentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { slugify } from '../../common/utils/slugify.js';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto.js';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProjectDto) {
    const slug = await this.ensureUniqueSlug(dto.slug || slugify(dto.title));
    return this.prisma.project.create({
      data: {
        title: dto.title,
        slug,
        description: dto.description,
        shortDescription: dto.shortDescription,
        coverImage: dto.coverImage,
        content: dto.content,
        client: dto.client,
        location: dto.location,
        completedAt: dto.completedAt ? new Date(dto.completedAt) : undefined,
        featured: dto.featured ?? false,
        status: dto.status ?? ContentStatus.DRAFT,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async findAllPublic() {
    return this.prisma.project.findMany({
      where: { status: ContentStatus.PUBLISHED },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findBySlug(slug: string) {
    const project = await this.prisma.project.findFirst({
      where: { slug, status: ContentStatus.PUBLISHED },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async findAllAdmin() {
    return this.prisma.project.findMany({
      orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async update(id: string, dto: UpdateProjectDto) {
    await this.findOne(id);
    const data: Prisma.ProjectUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.shortDescription !== undefined) {
      data.shortDescription = dto.shortDescription;
    }
    if (dto.coverImage !== undefined) data.coverImage = dto.coverImage;
    if (dto.content !== undefined) data.content = dto.content;
    if (dto.client !== undefined) data.client = dto.client;
    if (dto.location !== undefined) data.location = dto.location;
    if (dto.completedAt !== undefined) {
      data.completedAt = dto.completedAt ? new Date(dto.completedAt) : null;
    }
    if (dto.featured !== undefined) data.featured = dto.featured;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;
    if (dto.slug !== undefined) {
      data.slug = await this.ensureUniqueSlug(dto.slug, id);
    } else if (dto.title !== undefined) {
      data.slug = await this.ensureUniqueSlug(slugify(dto.title), id);
    }
    return this.prisma.project.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.project.delete({ where: { id } });
    return { deleted: true };
  }

  private async ensureUniqueSlug(base: string, excludeId?: string) {
    let slug = base;
    let i = 0;
    while (true) {
      const existing = await this.prisma.project.findUnique({ where: { slug } });
      if (!existing || existing.id === excludeId) return slug;
      i += 1;
      slug = `${base}-${i}`;
      if (i > 100) throw new ConflictException('Unable to generate unique slug');
    }
  }
}
