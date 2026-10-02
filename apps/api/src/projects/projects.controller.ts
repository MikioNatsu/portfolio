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
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectsDto, ReorderDto } from './dto/query-projects.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Published projects, newest ordering first' })
  list(@Query() query: QueryProjectsDto) {
    return this.projects.listPublished({
      featured: query.featured,
      limit: query.limit,
      search: query.search,
    });
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'A single published project by slug' })
  findOne(@Param('slug') slug: string) {
    return this.projects.findBySlug(slug);
  }
}

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/projects')
export class AdminProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'Paginated project list including drafts' })
  list(@Query() query: QueryProjectsDto) {
    return this.projects.list(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Fetch a project by id (admin view)' })
  findOne(@Param('id') id: string) {
    return this.projects.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a project' })
  create(@Body() dto: CreateProjectDto) {
    return this.projects.create(dto);
  }

  @Patch('reorder')
  @ApiOperation({ summary: 'Persist a new display order' })
  reorder(@Body() dto: ReorderDto) {
    return this.projects.reorder(dto.ids);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a project' })
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projects.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a project and its gallery' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.projects.remove(id);
  }
}
