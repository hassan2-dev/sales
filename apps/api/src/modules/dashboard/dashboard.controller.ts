import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../common/decorators/auth.decorators.js';
import { DashboardService } from './dashboard.service.js';
import { DashboardRangeDto } from './dto/dashboard.dto.js';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @RequirePermissions('dashboard:read')
  @Get('overview')
  overview(@Query() query: DashboardRangeDto) {
    return this.dashboardService.getOverview(query);
  }

  @RequirePermissions('dashboard:read')
  @Get('sales')
  sales(@Query() query: DashboardRangeDto) {
    return this.dashboardService.getSales(query);
  }

  @RequirePermissions('dashboard:read')
  @Get('sales-trend')
  salesTrend(@Query() query: DashboardRangeDto) {
    return this.dashboardService.getSalesTrend(query);
  }

  @RequirePermissions('dashboard:read')
  @Get('orders')
  orders(@Query() query: DashboardRangeDto) {
    return this.dashboardService.getOrderStats(query);
  }
}
