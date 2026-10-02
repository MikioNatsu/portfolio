import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Public site settings (SEO defaults, footer note)' })
  get() {
    return this.settings.get();
  }
}

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/settings')
export class AdminSettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get()
  get() {
    return this.settings.get();
  }

  @Patch()
  @ApiOperation({ summary: 'Update site settings' })
  update(@Body() dto: UpdateSettingsDto) {
    return this.settings.update(dto);
  }
}
