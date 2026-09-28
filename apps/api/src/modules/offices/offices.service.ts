import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateOfficeDto, UpdateOfficeDto } from './dto/office.dto.js';

@Injectable()
export class OfficesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOfficeDto) {
    return this.prisma.office.create({
      data: {
        name: dto.name,
        city: dto.city,
        country: dto.country ?? 'Iraq',
        address: dto.address,
        phone: dto.phone,
        email: dto.email,
        contactPerson: dto.contactPerson,
        latitude: dto.latitude,
        longitude: dto.longitude,
        status: dto.status ?? ContentStatus.PUBLISHED,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async findAllPublic() {
    return this.prisma.office.findMany({
      where: { status: ContentStatus.PUBLISHED },
      orderBy: [{ sortOrder: 'asc' }, { city: 'asc' }],
    });
  }

  async findByCity(city: string) {
    const office = await this.prisma.office.findFirst({
      where: {
        status: ContentStatus.PUBLISHED,
        city: { equals: city, mode: 'insensitive' },
      },
    });
    if (!office) throw new NotFoundException('Office not found');
    return office;
  }

  async findAllAdmin() {
    return this.prisma.office.findMany({
      orderBy: [{ sortOrder: 'asc' }, { city: 'asc' }],
    });
  }

  async findOne(id: string) {
    const office = await this.prisma.office.findUnique({ where: { id } });
    if (!office) throw new NotFoundException('Office not found');
    return office;
  }

  async update(id: string, dto: UpdateOfficeDto) {
    await this.findOne(id);
    const data: Prisma.OfficeUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.city !== undefined) data.city = dto.city;
    if (dto.country !== undefined) data.country = dto.country;
    if (dto.address !== undefined) data.address = dto.address;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.contactPerson !== undefined) data.contactPerson = dto.contactPerson;
    if (dto.latitude !== undefined) data.latitude = dto.latitude;
    if (dto.longitude !== undefined) data.longitude = dto.longitude;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;
    return this.prisma.office.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.office.delete({ where: { id } });
    return { deleted: true };
  }
}
