import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profile: ProfileService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Public profile: identity, stats and social links' })
  get() {
    return this.profile.get();
  }
}

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/profile')
export class AdminProfileController {
  constructor(private readonly profile: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Profile as stored (admin view)' })
  get() {
    return this.profile.get();
  }

  @Patch()
  @ApiOperation({ summary: 'Update the profile, including its statistics' })
  update(@Body() dto: UpdateProfileDto) {
    return this.profile.update(dto);
  }
}
