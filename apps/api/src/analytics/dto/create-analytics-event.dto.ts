import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { ANALYTICS_EVENTS } from '@natsu/types';

export class CreateAnalyticsEventDto {
  @IsIn(ANALYTICS_EVENTS as unknown as string[], { message: 'Unknown analytics event.' })
  event!: string;

  @IsString()
  @MaxLength(300)
  path!: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  projectId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  referrer?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  sessionId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  deviceType?: string | null;
}
