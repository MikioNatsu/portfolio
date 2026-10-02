import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * End-to-end smoke tests.
 *
 * The database is stubbed so the suite runs without infrastructure, while still
 * exercising the real module graph: global prefix, validation pipe, throttler,
 * the secure-by-default JWT guard and the exception filter.
 */
describe('API (e2e)', () => {
  let app: INestApplication;

  const prismaStub = {
    isHealthy: async () => true,
    $connect: async () => undefined,
    $disconnect: async () => undefined,
    onModuleInit: async () => undefined,
    onModuleDestroy: async () => undefined,
  };

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret-value-for-e2e-only';

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue(prismaStub)
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('reports health without authentication', async () => {
    const response = await request(app.getHttpServer()).get('/api/health').expect(200);
    expect(response.body).toMatchObject({ status: 'ok', database: 'up' });
  });

  it('protects admin routes by default', async () => {
    await request(app.getHttpServer()).get('/api/admin/overview').expect(401);
    await request(app.getHttpServer()).get('/api/admin/messages').expect(401);
    await request(app.getHttpServer()).get('/api/admin/projects').expect(401);
  });

  it('rejects an unauthenticated delete', async () => {
    await request(app.getHttpServer()).delete('/api/admin/projects/some-id').expect(401);
  });

  it('rejects a malformed login payload with 400, not 500', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'not-an-email', password: 'short' })
      .expect(400);

    expect(response.body.statusCode).toBe(400);
  });

  it('rejects unknown fields on the contact form', async () => {
    await request(app.getHttpServer())
      .post('/api/contact')
      .send({
        name: 'Test',
        email: 'test@example.com',
        subject: 'Hello',
        message: 'This message is long enough to pass validation.',
        isAdmin: true,
      })
      .expect(400);
  });

  it('validates the contact payload', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/contact')
      .send({ name: 'A', email: 'nope', subject: '', message: 'short' })
      .expect(400);

    expect(response.body.statusCode).toBe(400);
  });
});
