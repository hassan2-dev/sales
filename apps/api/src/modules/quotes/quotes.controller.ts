import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { QuotesService } from './quotes.service.js';
import {
  AssignQuoteDto,
  CreateQuoteDto,
  QuoteQueryDto,
  UpdateQuoteStatusDto,
} from './dto/quote.dto.js';
import { RequirePermissions } from '../../common/decorators/auth.decorators.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { AuthUser } from '../auth/types/jwt-payload.type.js';

@ApiTags('quotes')
@ApiBearerAuth()
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  /** Authenticated B2B store quote — OTP account required */
  @Post()
  create(@Body() dto: CreateQuoteDto, @CurrentUser() user: AuthUser) {
    return this.quotesService.create(dto, user.id);
  }

  /** Customer's own quote requests */
  @Get('me')
  myQuotes(@CurrentUser() user: AuthUser) {
    return this.quotesService.listForUser(user.id);
  }

  @RequirePermissions('quotes:read')
  @Get()
  findAll(@Query() query: QuoteQueryDto) {
    return this.quotesService.findAll(query);
  }

  @RequirePermissions('quotes:read')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quotesService.findOne(id);
  }

  @RequirePermissions('quotes:update')
  @Patch(':id/assign')
  assign(@Param('id') id: string, @Body() dto: AssignQuoteDto) {
    return this.quotesService.assign(id, dto.assignedToId);
  }

  @RequirePermissions('quotes:update')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateQuoteStatusDto) {
    return this.quotesService.updateStatus(id, dto);
  }
}
