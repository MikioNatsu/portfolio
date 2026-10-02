import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

/**
 * Accepts the token from either the Authorization header (SPA / API clients)
 * or the httpOnly session cookie, whichever is present.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const cookieName = config.get<string>('jwt.cookieName') ?? 'natsu_session';

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (request: Request): string | null =>
          (request?.cookies as Record<string, string> | undefined)?.[cookieName] ?? null,
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt.secret') ?? 'dev-only-insecure-secret-change-me',
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      throw new UnauthorizedException('This session is no longer valid.');
    }

    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }
}
