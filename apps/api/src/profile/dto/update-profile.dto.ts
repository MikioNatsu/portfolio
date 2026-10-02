import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ASSET_URL_MESSAGE, ASSET_URL_REGEX } from '../../common/validators/url.validator';

export class ProfileStatDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  id?: string;

  @IsString()
  @MaxLength(60)
  label!: string;

  @IsString()
  @MaxLength(24)
  value!: string;

  @IsOptional()
  @IsString()
  @MaxLength(12)
  suffix?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  icon?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(999)
  order?: number;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  role?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  headline?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  tagline?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(600)
  bio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  longBio?: string | null;

  @IsOptional()
  @Matches(ASSET_URL_REGEX, { message: ASSET_URL_MESSAGE })
  @MaxLength(2048)
  avatarUrl?: string | null;

  @IsOptional()
  @Matches(ASSET_URL_REGEX, { message: ASSET_URL_MESSAGE })
  @MaxLength(2048)
  heroImageUrl?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  location?: string | null;

  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  @MaxLength(160)
  email?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  availabilityLabel?: string | null;

  @IsOptional()
  @IsBoolean()
  availableForWork?: boolean;

  @IsOptional()
  @Matches(ASSET_URL_REGEX, { message: ASSET_URL_MESSAGE })
  @MaxLength(2048)
  resumeUrl?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  japanesePhrase?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  musicTrackTitle?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  musicTrackArtist?: string | null;

  @IsOptional()
  @Matches(ASSET_URL_REGEX, { message: ASSET_URL_MESSAGE })
  @MaxLength(2048)
  musicAudioUrl?: string | null;

  @IsOptional()
  @Matches(ASSET_URL_REGEX, { message: ASSET_URL_MESSAGE })
  @MaxLength(2048)
  musicCoverUrl?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  techPills?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProfileStatDto)
  stats?: ProfileStatDto[];
}
