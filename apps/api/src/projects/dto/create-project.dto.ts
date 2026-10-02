import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ProjectStatus } from '@prisma/client';
import {
  ASSET_URL_MESSAGE,
  ASSET_URL_REGEX,
  EXTERNAL_URL_MESSAGE,
  EXTERNAL_URL_REGEX,
} from '../../common/validators/url.validator';

export class CreateProjectDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  title!: string;

  @IsString()
  @MaxLength(120)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug may only contain lowercase letters, numbers and single hyphens.',
  })
  slug!: string;

  @IsString()
  @MaxLength(80)
  category!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(400)
  summary!: string;

  @IsString()
  @MinLength(20)
  @MaxLength(6000)
  description!: string;

  @IsOptional()
  @IsString()
  @MaxLength(6000)
  content?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  problem?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  solution?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(200, { each: true })
  features?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  architecture?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  challenges?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  implementation?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  results?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  role?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1990)
  @Max(2100)
  year?: number | null;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(9999)
  order?: number;

  @IsOptional()
  @Matches(EXTERNAL_URL_REGEX, { message: EXTERNAL_URL_MESSAGE })
  @MaxLength(2048)
  githubUrl?: string | null;

  @IsOptional()
  @Matches(EXTERNAL_URL_REGEX, { message: EXTERNAL_URL_MESSAGE })
  @MaxLength(2048)
  liveUrl?: string | null;

  @IsOptional()
  @Matches(ASSET_URL_REGEX, { message: ASSET_URL_MESSAGE })
  @MaxLength(2048)
  coverImage?: string | null;

  @IsOptional()
  @Matches(/^#[0-9a-fA-F]{6}$/, { message: 'Accent colour must be a hex value like #A855F7.' })
  accentColor?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  technologies?: string[];
}
