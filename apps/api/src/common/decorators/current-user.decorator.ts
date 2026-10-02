import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { UserRole } from '@natsu/types';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

/** Injects the authenticated admin into a controller handler. */
export const CurrentUser = createParamDecorator(
  (
    data: keyof AuthenticatedUser | undefined,
    context: ExecutionContext,
  ): AuthenticatedUser | unknown => {
    const request = context.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();
    const user = request.user;
    if (!user) return undefined;
    return data ? user[data] : user;
  },
);
