import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import type { Request } from 'express';
import { Observable, tap } from 'rxjs';

/** Request-level timing log. Never logs bodies or headers (no PII, no tokens). */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const started = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - started;
          if (duration > 400 || process.env.NODE_ENV !== 'production') {
            this.logger.log(`${request.method} ${request.originalUrl} — ${duration}ms`);
          }
        },
      }),
    );
  }
}
