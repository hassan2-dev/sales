import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ServicesService } from './services.service.js';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto.js';
import {
  Public,
  RequirePermissions,
} from '../../common/decorators/auth.decorators.js';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Public()
  @Get()
  findAllPublic() {
    return this.servicesService.findAllPublic();
  }

  @Public()
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.servicesService.findBySlug(slug);
  }

  @RequirePermissions('services:read')
  @Get('admin/all')
  findAllAdmin() {
    return this.servicesService.findAllAdmin();
  }

  @RequirePermissions('services:read')
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.servicesService.findOne(id);
  }

  @RequirePermissions('services:create')
  @Post()
  create(@Body() dto: CreateServiceDto) {
    return this.servicesService.create(dto);
  }

  @RequirePermissions('services:update')
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateServiceDto,
  ) {
    return this.servicesService.update(id, dto);
  }

  @RequirePermissions('services:delete')
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.servicesService.remove(id);
  }
}
