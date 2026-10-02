import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateSkillDto {
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  name!: string;

  @IsString()
  @MaxLength(60)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug may only contain lowercase letters, numbers and single hyphens.',
  })
  slug!: string;

  @IsString()
  @MaxLength(60)
  category!: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  icon?: string | null;

  @IsOptional()
  @Matches(/^#[0-9a-fA-F]{6}$/, { message: 'Colour must be a hex value like #A855F7.' })
  color?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  level?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  description?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(9999)
  order?: number;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

export class UpdateSkillDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(60) name?: string;
  @IsOptional() @IsString() @MaxLength(60) slug?: string;
  @IsOptional() @IsString() @MaxLength(60) category?: string;
  @IsOptional() @IsString() @MaxLength(40) icon?: string | null;
  @IsOptional() @Matches(/^#[0-9a-fA-F]{6}$/) color?: string | null;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(100) level?: number | null;
  @IsOptional() @IsString() @MaxLength(280) description?: string | null;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(9999) order?: number;
  @IsOptional() @IsBoolean() published?: boolean;
}
