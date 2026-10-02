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
import { SkillsService } from './skills.service';
import { CreateSkillDto, UpdateSkillDto } from './dto/skill.dto';
import { ReorderDto } from '../projects/dto/query-projects.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('skills')
@Controller('skills')
export class SkillsController {
  constructor(private readonly skills: SkillsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Published skills, ordered for the grid' })
  list() {
    return this.skills.listPublished();
  }
}

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/skills')
export class AdminSkillsController {
  constructor(private readonly skills: SkillsService) {}

  @Get()
  @ApiOperation({ summary: 'All skills including hidden ones' })
  list() {
    return this.skills.listAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a skill' })
  create(@Body() dto: CreateSkillDto) {
    return this.skills.create(dto);
  }

  @Patch('reorder')
  reorder(@Body() dto: ReorderDto) {
    return this.skills.reorder(dto.ids);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSkillDto) {
    return this.skills.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.skills.remove(id);
  }
}
