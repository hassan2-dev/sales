import { Controller, Get, Query } from '@nestjs/common';
import { RequirePermissions } from '../../common/decorators/auth.decorators.js';
import { PaginationDto } from '../../common/dto/pagination.dto.js';
import { AuditService } from './audit.service.js';

@Controller('audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @RequirePermissions('audit:read')
  findAll(@Query() query: PaginationDto) {
    return this.auditService.findAll(query);
  }
}
