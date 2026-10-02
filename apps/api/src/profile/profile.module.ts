import { Module } from '@nestjs/common';
import { AdminProfileController, ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  controllers: [ProfileController, AdminProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
