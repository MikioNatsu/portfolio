import { Module } from '@nestjs/common';
import { AdminSocialLinksController, SocialLinksController } from './social-links.controller';
import { SocialLinksService } from './social-links.service';

@Module({
  controllers: [SocialLinksController, AdminSocialLinksController],
  providers: [SocialLinksService],
  exports: [SocialLinksService],
})
export class SocialLinksModule {}
