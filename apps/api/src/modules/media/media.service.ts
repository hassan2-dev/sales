import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MediaType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { StorageService } from '../../storage/storage.service.js';
import { MediaQueryDto } from './dto/media.dto.js';

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async upload(
    file: Express.Multer.File,
    uploadedById?: string,
    alt?: string,
    folder?: string,
  ) {
    if (!file) throw new BadRequestException('File is required');

    const uploaded = await this.storage.upload(
      file.buffer,
      file.originalname,
      file.mimetype,
      { folder },
    );

    return this.prisma.media.create({
      data: {
        fileName: uploaded.storageKey.split('/').pop() ?? file.originalname,
        originalName: file.originalname,
        url: uploaded.url,
        mimeType: file.mimetype,
        size: uploaded.size,
        storageKey: uploaded.storageKey,
        type: this.resolveMediaType(file.mimetype),
        alt,
        uploadedById,
      },
    });
  }

  storageStatus() {
    return this.storage.getStatus();
  }

  async findAll(query: MediaQueryDto) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.MediaWhereInput = {};
    if (query.type) where.type = query.type;
    if (query.search) {
      where.OR = [
        { originalName: { contains: query.search, mode: 'insensitive' } },
        { fileName: { contains: query.search, mode: 'insensitive' } },
        { alt: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.media.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          uploadedBy: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      }),
      this.prisma.media.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async remove(id: string) {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (!media) throw new NotFoundException('Media not found');
    await this.storage.delete(media.storageKey);
    await this.prisma.media.delete({ where: { id } });
    return { deleted: true };
  }

  private resolveMediaType(mimeType: string): MediaType {
    if (mimeType.startsWith('image/')) return MediaType.IMAGE;
    if (mimeType === 'application/pdf') return MediaType.PDF;
    if (
      mimeType.includes('document') ||
      mimeType.includes('msword') ||
      mimeType.includes('officedocument') ||
      mimeType.includes('text/')
    ) {
      return MediaType.DOCUMENT;
    }
    return MediaType.OTHER;
  }
}
