import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { join } from 'node:path';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const config = app.get(ConfigService);
  const isProduction = config.get<boolean>('isProduction');
  const port = config.get<number>('port') ?? 4000;
  const frontendUrl = config.get<string>('frontendUrl') ?? 'http://localhost:5173';

  /* ---------------------------------------------------------------- */
  /* Security                                                          */
  /* ---------------------------------------------------------------- */

  app.use(
    helmet({
      // Images uploaded to local storage are served to the web origin.
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      // Swagger UI needs inline styles/scripts in development.
      contentSecurityPolicy: isProduction ? undefined : false,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
  );

  app.use(cookieParser());

  const allowedOrigins = Array.from(
    new Set(
      [
        frontendUrl,
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:4173',
      ].filter(Boolean),
    ),
  );

  app.enableCors({
    origin: (origin, callback) => {
      // Same-origin, server-to-server and curl requests have no Origin header.
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      if (!isProduction && /^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  });

  /* ---------------------------------------------------------------- */
  /* Application                                                       */
  /* ---------------------------------------------------------------- */

  // Every route lives under /api. Static uploads are mounted at the Express
  // level below, so they keep their own /uploads prefix.
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
      validationError: { target: false, value: false },
    }),
  );

  // Local-disk uploads are served from /uploads (Cloudinary URLs are absolute).
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
    maxAge: '7d',
    index: false,
  });

  app.enableShutdownHooks();

  if (!isProduction) {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('Natsu Portfolio API')
        .setDescription(
          'Content API for the Natsu portfolio: profile, projects, experience, skills, contact and analytics.',
        )
        .setVersion('1.0.0')
        .addBearerAuth()
        .build(),
    );
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  await app.listen(port, '0.0.0.0');

  logger.log(`API listening on http://localhost:${port}/api`);
  if (!isProduction) logger.log(`Swagger docs at http://localhost:${port}/api/docs`);
  logger.log(`CORS allowed origins: ${allowedOrigins.join(', ')}`);
}

void bootstrap();
