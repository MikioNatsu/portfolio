import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateContactDto {
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters.' })
  @MaxLength(80)
  name!: string;

  @IsEmail({}, { message: 'Please provide a valid email address.' })
  @MaxLength(160)
  email!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(160)
  subject!: string;

  @IsString()
  @MinLength(10, { message: 'Message must be at least 10 characters.' })
  @MaxLength(5000)
  message!: string;

  /**
   * Honeypot: real users never see this field. If it is filled, the request is
   * treated as a bot and silently accepted without storing anything.
   */
  @IsOptional()
  @IsString()
  @MaxLength(120)
  company?: string;
}
