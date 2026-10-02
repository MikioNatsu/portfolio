import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Global authentication guard.
 *
 * Routes opt out with `@Public()`. Anything else requires a valid bearer token
 * (or the httpOnly session cookie) — so a new endpoint is protected by default.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  override canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;
    return super.canActivate(context);
  }

  override handleRequest<TUser>(error: unknown, user: TUser | false): TUser {
    if (error || !user) {
      throw error instanceof Error ? error : new UnauthorizedException('Authentication required.');
    }
    return user;
  }
}
