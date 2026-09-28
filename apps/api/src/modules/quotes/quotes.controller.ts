import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { QuotesService } from './quotes.service.js';
import {
  AssignQuoteDto,
  CreateQuoteDto,
  QuoteQueryDto,
  UpdateQuoteStatusDto,
} from './dto/quote.dto.js';
import {
  Public,
  RequirePermissions,
} from '../../common/decorators/auth.decorators.js';

@ApiTags('quotes')
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Public()
  @Post()
  create(@Body() dto: CreateQuoteDto) {
    return this.quotesService.create(dto);
  }

  @ApiBearerAuth()
  @RequirePermissions('quotes:read')
  @Get()
  findAll(@Query() query: QuoteQueryDto) {
    return this.quotesService.findAll(query);
  }

  @ApiBearerAuth()
  @RequirePermissions('quotes:read')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quotesService.findOne(id);
  }

  @ApiBearerAuth()
  @RequirePermissions('quotes:update')
  @Patch(':id/assign')
  assign(@Param('id') id: string, @Body() dto: AssignQuoteDto) {
    return this.quotesService.assign(id, dto.assignedToId);
  }

  @ApiBearerAuth()
  @RequirePermissions('quotes:update')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateQuoteStatusDto) {
    return this.quotesService.updateStatus(id, dto);
  }
}
