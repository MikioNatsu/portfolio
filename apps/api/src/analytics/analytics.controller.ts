import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AnalyticsService } from './analytics.service';
import { CreateAnalyticsEventDto } from './dto/create-analytics-event.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Public()
  @Post('event')
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle({ default: { limit: 120, ttl: 60_000 } })
  @ApiOperation({ summary: 'Record a first-party analytics event (rate limited)' })
  track(@Body() dto: CreateAnalyticsEventDto) {
    return this.analytics.track(dto);
  }
}

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
export class AdminAnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Get('analytics')
  @ApiOperation({ summary: 'Aggregated analytics for a time range' })
  summary(@Query('range') range?: string) {
    return this.analytics.summary(range ?? '30d');
  }

  @Get('overview')
  @ApiOperation({ summary: 'Dashboard overview: content, traffic and inbox' })
  overview() {
    return this.analytics.overview();
  }
}
