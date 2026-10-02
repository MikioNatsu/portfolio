import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { EXTERNAL_URL_MESSAGE, EXTERNAL_URL_REGEX } from '../../common/validators/url.validator';

export const SOCIAL_ICONS = [
  'github',
  'telegram',
  'instagram',
  'twitter',
  'discord',
  'youtube',
  'linkedin',
  'mail',
  'globe',
] as const;

export class CreateSocialLinkDto {
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  label!: string;

  @Matches(EXTERNAL_URL_REGEX, { message: EXTERNAL_URL_MESSAGE })
  @MaxLength(2048)
  url!: string;

  @IsIn(SOCIAL_ICONS, { message: 'Unknown icon name.' })
  icon!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  handle?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(999)
  order?: number;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

export class UpdateSocialLinkDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(40) label?: string;
  @IsOptional()
  @Matches(EXTERNAL_URL_REGEX, { message: EXTERNAL_URL_MESSAGE })
  @MaxLength(2048)
  url?: string;
  @IsOptional() @IsIn(SOCIAL_ICONS) icon?: string;
  @IsOptional() @IsString() @MaxLength(80) handle?: string | null;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(999) order?: number;
  @IsOptional() @IsBoolean() published?: boolean;
}
