import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsISO8601,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import {
  ASSET_URL_MESSAGE,
  ASSET_URL_REGEX,
  EXTERNAL_URL_MESSAGE,
  EXTERNAL_URL_REGEX,
} from '../../common/validators/url.validator';

export class CreateExperienceDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  organization!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  role!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(4000)
  description!: string;

  @IsISO8601({}, { message: 'Start date must be an ISO date.' })
  startDate!: string;

  @IsOptional()
  @IsISO8601({}, { message: 'End date must be an ISO date.' })
  endDate?: string | null;

  @IsOptional()
  @IsBoolean()
  current?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  location?: string | null;

  @IsOptional()
  @Matches(EXTERNAL_URL_REGEX, { message: EXTERNAL_URL_MESSAGE })
  @MaxLength(2048)
  url?: string | null;

  @IsOptional()
  @Matches(ASSET_URL_REGEX, { message: ASSET_URL_MESSAGE })
  @MaxLength(2048)
  imageUrl?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(9999)
  order?: number;

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  technologies?: string[];
}

export class UpdateExperienceDto {
  @IsOptional() @IsString() @MinLength(2) @MaxLength(120) organization?: string;
  @IsOptional() @IsString() @MinLength(2) @MaxLength(120) role?: string;
  @IsOptional() @IsString() @MinLength(10) @MaxLength(4000) description?: string;
  @IsOptional() @IsISO8601() startDate?: string;
  @IsOptional() @IsISO8601() endDate?: string | null;
  @IsOptional() @IsBoolean() current?: boolean;
  @IsOptional() @IsString() @MaxLength(120) location?: string | null;
  @IsOptional()
  @Matches(EXTERNAL_URL_REGEX, { message: EXTERNAL_URL_MESSAGE })
  @MaxLength(2048)
  url?: string | null;
  @IsOptional()
  @Matches(ASSET_URL_REGEX, { message: ASSET_URL_MESSAGE })
  @MaxLength(2048)
  imageUrl?: string | null;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(9999) order?: number;
  @IsOptional() @IsBoolean() published?: boolean;
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  technologies?: string[];
}
