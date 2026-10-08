import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../../common/decorators/auth.decorators.js';
import { AnalyticsService } from './analytics.service.js';
import { TrackVisitDto } from './dto/track-visit.dto.js';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Public()
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Post('visit')
  track(@Body() body: TrackVisitDto) {
    return this.analyticsService.trackVisit({
      surface: body.surface,
      visitorId: body.visitorId,
    });
  }
}
