import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { InventoryService } from './inventory.service.js';
import { UpdateInventoryDto } from './dto/inventory.dto.js';
import { RequirePermissions } from '../../common/decorators/auth.decorators.js';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @RequirePermissions('inventory:read')
  @Get('low-stock')
  findLowStock() {
    return this.inventoryService.findLowStock();
  }

  @RequirePermissions('inventory:read')
  @Get(':productId')
  findOne(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.inventoryService.findByProductId(productId);
  }

  @RequirePermissions('inventory:update')
  @Patch(':productId')
  update(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: UpdateInventoryDto,
  ) {
    return this.inventoryService.update(productId, dto);
  }
}
