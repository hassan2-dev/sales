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
import { OfficesService } from './offices.service.js';
import { CreateOfficeDto, UpdateOfficeDto } from './dto/office.dto.js';
import {
  Public,
  RequirePermissions,
} from '../../common/decorators/auth.decorators.js';

@Controller('offices')
export class OfficesController {
  constructor(private readonly officesService: OfficesService) {}

  @Public()
  @Get()
  findAllPublic() {
    return this.officesService.findAllPublic();
  }

  @Public()
  @Get('slug/:city')
  findByCity(@Param('city') city: string) {
    return this.officesService.findByCity(city);
  }

  @RequirePermissions('offices:read')
  @Get('admin/all')
  findAllAdmin() {
    return this.officesService.findAllAdmin();
  }

  @RequirePermissions('offices:read')
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.officesService.findOne(id);
  }

  @RequirePermissions('offices:create')
  @Post()
  create(@Body() dto: CreateOfficeDto) {
    return this.officesService.create(dto);
  }

  @RequirePermissions('offices:update')
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOfficeDto,
  ) {
    return this.officesService.update(id, dto);
  }

  @RequirePermissions('offices:delete')
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.officesService.remove(id);
  }
}
