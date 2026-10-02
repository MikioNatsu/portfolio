import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  @MaxLength(160)
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Passwords are at least 8 characters.' })
  @MaxLength(128)
  password!: string;
}
