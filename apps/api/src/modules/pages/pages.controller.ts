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
import { PagesService } from './pages.service.js';
import { CreatePageDto, UpdatePageDto } from './dto/page.dto.js';
import {
  Public,
  RequirePermissions,
} from '../../common/decorators/auth.decorators.js';

@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Public()
  @Get()
  findAllPublic() {
    return this.pagesService.findAllPublic();
  }

  @Public()
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.pagesService.findBySlug(slug);
  }

  @RequirePermissions('pages:read')
  @Get('admin/all')
  findAllAdmin() {
    return this.pagesService.findAllAdmin();
  }

  @RequirePermissions('pages:read')
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.pagesService.findOne(id);
  }

  @RequirePermissions('pages:create')
  @Post()
  create(@Body() dto: CreatePageDto) {
    return this.pagesService.create(dto);
  }

  @RequirePermissions('pages:update')
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePageDto,
  ) {
    return this.pagesService.update(id, dto);
  }

  @RequirePermissions('pages:delete')
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.pagesService.remove(id);
  }
}
