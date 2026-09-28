import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../common/decorators/auth.decorators.js';
import { DashboardService } from './dashboard.service.js';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @RequirePermissions('dashboard:read')
  @Get('overview')
  overview() {
    return this.dashboardService.getOverview();
  }

  @RequirePermissions('dashboard:read')
  @Get('sales')
  sales() {
    return this.dashboardService.getSales();
  }

  @RequirePermissions('dashboard:read')
  @Get('sales-trend')
  salesTrend(@Query('days') days?: string) {
    return this.dashboardService.getSalesTrend(days ? Number(days) : 30);
  }

  @RequirePermissions('dashboard:read')
  @Get('orders')
  orders() {
    return this.dashboardService.getOrderStats();
  }
}
