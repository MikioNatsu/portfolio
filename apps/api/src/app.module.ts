import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { configuration } from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { ProjectsModule } from './projects/projects.module';
import { ExperienceModule } from './experience/experience.module';
import { SkillsModule } from './skills/skills.module';
import { SocialLinksModule } from './social-links/social-links.module';
import { ContactsModule } from './contacts/contacts.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { UploadsModule } from './uploads/uploads.module';
import { SettingsModule } from './settings/settings.module';
import { HealthModule } from './health/health.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration],
      // Prefer a package-local `.env`, fall back to the monorepo root.
      envFilePath: ['.env', '../../.env'],
    }),

    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: Number(process.env.THROTTLE_TTL ?? 60) * 1000,
        limit: Number(process.env.THROTTLE_LIMIT ?? 120),
      },
    ]),

    PrismaModule,
    AuthModule,
    ProfileModule,
    ProjectsModule,
    ExperienceModule,
    SkillsModule,
    SocialLinksModule,
    ContactsModule,
    AnalyticsModule,
    UploadsModule,
    SettingsModule,
    HealthModule,
  ],
  providers: [
    // Order matters: throttling runs before authentication.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
