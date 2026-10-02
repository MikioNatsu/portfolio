import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SocialLinksService } from './social-links.service';
import { CreateSocialLinkDto, UpdateSocialLinkDto } from './dto/social-link.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('social-links')
@Controller('social-links')
export class SocialLinksController {
  constructor(private readonly links: SocialLinksService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Published social links' })
  list() {
    return this.links.listPublished();
  }
}

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/social-links')
export class AdminSocialLinksController {
  constructor(private readonly links: SocialLinksService) {}

  @Get()
  list() {
    return this.links.listAll();
  }

  @Post()
  create(@Body() dto: CreateSocialLinkDto) {
    return this.links.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSocialLinkDto) {
    return this.links.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.links.remove(id);
  }
}
