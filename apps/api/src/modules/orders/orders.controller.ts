import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '@prisma/client';
import { OrdersService } from './orders.service.js';
import {
  Public,
  RequirePermissions,
} from '../../common/decorators/auth.decorators.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { PaginationDto } from '../../common/dto/pagination.dto.js';
import type { AuthUser } from '../auth/types/jwt-payload.type.js';

class CreateOrderDto {
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  shippingAddress?: string;

  @IsOptional()
  @IsString()
  billingAddress?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  shipping?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discount?: number;
}

class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status!: OrderStatus;

  @IsOptional()
  @IsString()
  note?: string;
}

class AddOrderNoteDto {
  @IsString()
  note!: string;

  @IsOptional()
  isInternal?: boolean;
}

class OrderQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsUUID()
  customerId?: string;
}

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @RequirePermissions('orders:create')
  @Post()
  create(
    @Body() dto: CreateOrderDto,
    @CurrentUser() user: AuthUser,
    @Headers('x-session-id') sessionId?: string,
  ) {
    return this.ordersService.createFromCart({
      ...dto,
      sessionId: dto.sessionId || sessionId,
      createdById: user.id,
    });
  }

  @Public()
  @Post('checkout')
  checkout(
    @Body() dto: CreateOrderDto,
    @Headers('x-session-id') sessionId?: string,
  ) {
    return this.ordersService.createFromCart({
      ...dto,
      sessionId: dto.sessionId || sessionId,
    });
  }

  @RequirePermissions('orders:read')
  @Get()
  findAll(@Query() query: OrderQueryDto) {
    return this.ordersService.findAll(query);
  }

  @RequirePermissions('orders:read')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @RequirePermissions('orders:update')
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.ordersService.updateStatus(id, dto.status, user.id, dto.note);
  }

  @RequirePermissions('orders:update')
  @Post(':id/notes')
  addNote(
    @Param('id') id: string,
    @Body() dto: AddOrderNoteDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.ordersService.addNote(
      id,
      user.id,
      dto.note,
      dto.isInternal ?? true,
    );
  }
}
