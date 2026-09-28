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
import { NewsService } from './news.service.js';
import {
  CreateNewsDto,
  SetFeaturedDto,
  UpdateNewsDto,
} from './dto/news.dto.js';
import {
  Public,
  RequirePermissions,
} from '../../common/decorators/auth.decorators.js';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Public()
  @Get()
  findAllPublic() {
    return this.newsService.findAllPublic();
  }

  @Public()
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.newsService.findBySlug(slug);
  }

  @RequirePermissions('news:read')
  @Get('admin/all')
  findAllAdmin() {
    return this.newsService.findAllAdmin();
  }

  @RequirePermissions('news:read')
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.newsService.findOne(id);
  }

  @RequirePermissions('news:create')
  @Post()
  create(@Body() dto: CreateNewsDto) {
    return this.newsService.create(dto);
  }

  @RequirePermissions('news:update')
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateNewsDto,
  ) {
    return this.newsService.update(id, dto);
  }

  @RequirePermissions('news:update')
  @Patch(':id/publish')
  publish(@Param('id', ParseUUIDPipe) id: string) {
    return this.newsService.publish(id);
  }

  @RequirePermissions('news:update')
  @Patch(':id/unpublish')
  unpublish(@Param('id', ParseUUIDPipe) id: string) {
    return this.newsService.unpublish(id);
  }

  @RequirePermissions('news:update')
  @Patch(':id/featured')
  setFeatured(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SetFeaturedDto,
  ) {
    return this.newsService.setFeatured(id, dto);
  }

  @RequirePermissions('news:delete')
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.newsService.remove(id);
  }
}
