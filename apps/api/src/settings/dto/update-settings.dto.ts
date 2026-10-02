import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { ASSET_URL_MESSAGE, ASSET_URL_REGEX } from '../../common/validators/url.validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(160)
  siteTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  siteDescription?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(60, { each: true })
  seoKeywords?: string[];

  @IsOptional()
  @Matches(ASSET_URL_REGEX, { message: ASSET_URL_MESSAGE })
  @MaxLength(2048)
  ogImageUrl?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  twitterHandle?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  footerNote?: string | null;

  @IsOptional()
  @IsEmail({}, { message: 'Contact email must be valid.' })
  @MaxLength(160)
  contactEmail?: string | null;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  analyticsEnabled?: boolean;
}
