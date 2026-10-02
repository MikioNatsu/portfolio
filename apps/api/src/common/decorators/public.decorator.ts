import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'natsu:isPublic';

/**
 * Marks a route as reachable without a JWT.
 * Every other route is protected by the global `JwtAuthGuard` — secure by
 * default, so a forgotten decorator fails closed rather than open.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
