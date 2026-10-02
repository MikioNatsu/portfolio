import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import type { AuthUser, LoginResponse } from '@natsu/types';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 8, ttl: 60_000 } })
  @ApiOperation({ summary: 'Exchange admin credentials for a JWT' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponse> {
    const result = await this.auth.login(dto);

    // Mirror the token into an httpOnly cookie so browser sessions survive
    // reloads without exposing the value to JavaScript.
    response.cookie(
      this.config.get<string>('jwt.cookieName') ?? 'natsu_session',
      result.accessToken,
      {
        httpOnly: true,
        sameSite: this.config.get<boolean>('isProduction') ? 'none' : 'lax',
        secure: this.config.get<boolean>('isProduction') ?? false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      },
    );

    return result;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear the session cookie' })
  logout(@Res({ passthrough: true }) response: Response): { ok: boolean } {
    response.clearCookie(this.config.get<string>('jwt.cookieName') ?? 'natsu_session', {
      path: '/',
    });
    return this.auth.logout();
  }

  @Get('me')
  @ApiOperation({ summary: 'Return the currently authenticated admin' })
  me(@CurrentUser() user: AuthenticatedUser): Promise<AuthUser> {
    return this.auth.me(user.id);
  }
}
