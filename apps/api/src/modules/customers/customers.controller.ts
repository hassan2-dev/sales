import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { CustomersService } from './customers.service.js';
import { CustomerQueryDto, UpdateCustomerDto } from './dto/customer.dto.js';
import { RequirePermissions } from '../../common/decorators/auth.decorators.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { AuthUser } from '../auth/types/jwt-payload.type.js';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  /** Store customer — own profile (must be before :id routes) */
  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.customersService.findMe(user.id);
  }

  @Patch('me')
  updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateCustomerDto) {
    return this.customersService.updateMe(user.id, dto);
  }

  @RequirePermissions('customers:read')
  @Get()
  findAll(@Query() query: CustomerQueryDto) {
    return this.customersService.findAll(query);
  }

  @RequirePermissions('customers:read')
  @Get(':id/history')
  getHistory(@Param('id', ParseUUIDPipe) id: string) {
    return this.customersService.getHistory(id);
  }

  @RequirePermissions('customers:read')
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.customersService.findOne(id);
  }

  @RequirePermissions('customers:update')
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customersService.update(id, dto);
  }
}
