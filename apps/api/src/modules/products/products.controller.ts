import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service.js';
import {
  AddProductDocumentDto,
  AddProductImageDto,
  CreateProductDto,
  ProductQueryDto,
  UpdateProductDto,
} from './dto/product.dto.js';
import {
  Public,
  RequirePermissions,
} from '../../common/decorators/auth.decorators.js';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get()
  findCatalog(@Query() query: ProductQueryDto) {
    return this.productsService.findCatalog(query);
  }

  @Public()
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @ApiBearerAuth()
  @RequirePermissions('products:read')
  @Get('admin')
  findAdmin(@Query() query: ProductQueryDto) {
    return this.productsService.findAdmin(query);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @ApiBearerAuth()
  @RequirePermissions('products:create')
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @ApiBearerAuth()
  @RequirePermissions('products:update')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @ApiBearerAuth()
  @RequirePermissions('products:delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @ApiBearerAuth()
  @RequirePermissions('products:update')
  @Post(':id/images')
  addImage(@Param('id') id: string, @Body() dto: AddProductImageDto) {
    return this.productsService.addImage(id, dto);
  }

  @ApiBearerAuth()
  @RequirePermissions('products:update')
  @Delete(':id/images/:imageId')
  removeImage(@Param('id') id: string, @Param('imageId') imageId: string) {
    return this.productsService.removeImage(id, imageId);
  }

  @ApiBearerAuth()
  @RequirePermissions('products:update')
  @Post(':id/documents')
  addDocument(@Param('id') id: string, @Body() dto: AddProductDocumentDto) {
    return this.productsService.addDocument(id, dto);
  }

  @ApiBearerAuth()
  @RequirePermissions('products:update')
  @Delete(':id/documents/:documentId')
  removeDocument(
    @Param('id') id: string,
    @Param('documentId') documentId: string,
  ) {
    return this.productsService.removeDocument(id, documentId);
  }
}
