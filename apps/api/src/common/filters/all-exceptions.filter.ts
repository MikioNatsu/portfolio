import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Request, Response } from 'express';
import type { ApiErrorShape } from '@natsu/types';

/**
 * Centralised error handling.
 *
 * Guarantees two things: clients always receive a predictable shape, and
 * internal details (stack traces, SQL, secrets) never leak in production.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exceptions');

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Something went wrong on the server.';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const payload = exception.getResponse();
      if (typeof payload === 'string') {
        message = payload;
      } else if (payload && typeof payload === 'object') {
        const shape = payload as { message?: string | string[]; error?: string };
        message = shape.message ?? exception.message;
        error = shape.error ?? exception.name;
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      ({ status, message, error } = this.mapPrismaError(exception));
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'The submitted data is not valid.';
      error = 'Bad Request';
    } else if (exception instanceof Error) {
      // Unexpected: log it, but never echo internals to the client.
      this.logger.error(`${request.method} ${request.url} → ${exception.message}`, exception.stack);
    }

    if (status >= 500) {
      this.logger.error(`${request.method} ${request.url} → ${status} ${JSON.stringify(message)}`);
    } else {
      this.logger.warn(`${request.method} ${request.url} → ${status}`);
    }

    const body: ApiErrorShape = {
      statusCode: status,
      message,
      error,
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(body);
  }

  private mapPrismaError(exception: Prisma.PrismaClientKnownRequestError): {
    status: number;
    message: string;
    error: string;
  } {
    switch (exception.code) {
      case 'P2002': {
        const target = (exception.meta?.target as string[] | undefined)?.join(', ') ?? 'field';
        return {
          status: HttpStatus.CONFLICT,
          message: `A record with this ${target} already exists.`,
          error: 'Conflict',
        };
      }
      case 'P2025':
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'The requested record was not found.',
          error: 'Not Found',
        };
      case 'P2003':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Related record constraint failed.',
          error: 'Bad Request',
        };
      default:
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'The database rejected this request.',
          error: 'Bad Request',
        };
    }
  }
}
