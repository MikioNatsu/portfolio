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
import { ExperienceService } from './experience.service';
import { CreateExperienceDto, UpdateExperienceDto } from './dto/experience.dto';
import { ReorderDto } from '../projects/dto/query-projects.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('experience')
@Controller('experience')
export class ExperienceController {
  constructor(private readonly experience: ExperienceService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Published experience entries, ordered' })
  list() {
    return this.experience.listPublished();
  }
}

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/experience')
export class AdminExperienceController {
  constructor(private readonly experience: ExperienceService) {}

  @Get()
  @ApiOperation({ summary: 'All experience entries including hidden ones' })
  list() {
    return this.experience.listAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create an experience entry' })
  create(@Body() dto: CreateExperienceDto) {
    return this.experience.create(dto);
  }

  @Patch('reorder')
  @ApiOperation({ summary: 'Persist a new display order' })
  reorder(@Body() dto: ReorderDto) {
    return this.experience.reorder(dto.ids);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an experience entry' })
  update(@Param('id') id: string, @Body() dto: UpdateExperienceDto) {
    return this.experience.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an experience entry' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.experience.remove(id);
  }
}
