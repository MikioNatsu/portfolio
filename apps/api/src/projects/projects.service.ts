import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ProjectStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { buildPaginated, resolvePagination } from '../common/dto/pagination.dto';
import {
  cleanText,
  flattenTechnologies,
  technologyCreate,
  technologyReplace,
} from '../common/utils/content.util';
import type { CreateProjectDto } from './dto/create-project.dto';
import type { UpdateProjectDto } from './dto/update-project.dto';
import type { QueryProjectsDto } from './dto/query-projects.dto';

const PROJECT_INCLUDE = {
  technologies: { include: { technology: true } },
  images: { orderBy: { order: 'asc' } },
} satisfies Prisma.ProjectInclude;

type ProjectRow = Prisma.ProjectGetPayload<{ include: typeof PROJECT_INCLUDE }>;

function toSummary(row: ProjectRow) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    category: row.category,
    summary: row.summary,
    status: row.status,
    featured: row.featured,
    order: row.order,
    githubUrl: row.githubUrl,
    liveUrl: row.liveUrl,
    coverImage: row.coverImage,
    accentColor: row.accentColor,
    year: row.year,
    technologies: flattenTechnologies(row.technologies),
  };
}

function toDetail(row: ProjectRow) {
  return {
    ...row,
    technologies: flattenTechnologies(row.technologies),
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    images: row.images.map((image) => ({ ...image, createdAt: image.createdAt.toISOString() })),
  };
}

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  /* ------------------------------------------------------------------ */
  /* Public                                                              */
  /* ------------------------------------------------------------------ */

  async listPublished(options: { featured?: boolean; limit?: number; search?: string }) {
    const where: Prisma.ProjectWhereInput = { status: ProjectStatus.PUBLISHED };

    if (options.featured !== undefined) where.featured = options.featured;
    if (options.search) {
      where.OR = [
        { title: { contains: options.search, mode: 'insensitive' } },
        { summary: { contains: options.search, mode: 'insensitive' } },
        { category: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const rows = await this.prisma.project.findMany({
      where,
      include: PROJECT_INCLUDE,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      take: options.limit ?? undefined,
    });

    return rows.map(toSummary);
  }

  async findBySlug(slug: string) {
    const row = await this.prisma.project.findFirst({
      where: { slug, status: ProjectStatus.PUBLISHED },
      include: PROJECT_INCLUDE,
    });

    if (!row) throw new NotFoundException('That project could not be found.');
    return toDetail(row);
  }

  /* ------------------------------------------------------------------ */
  /* Admin                                                               */
  /* ------------------------------------------------------------------ */

  async list(query: QueryProjectsDto) {
    const { skip, take, page, pageSize } = resolvePagination(query);

    const where: Prisma.ProjectWhereInput = {};
    if (query.status) where.status = query.status as ProjectStatus;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { category: { contains: query.search, mode: 'insensitive' } },
        { slug: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.project.findMany({
        where,
        include: PROJECT_INCLUDE,
        orderBy: [{ order: 'asc' }, { updatedAt: 'desc' }],
        skip,
        take,
      }),
      this.prisma.project.count({ where }),
    ]);

    return buildPaginated(rows.map(toDetail), total, page, pageSize);
  }

  async findOne(id: string) {
    const row = await this.prisma.project.findUnique({ where: { id }, include: PROJECT_INCLUDE });
    if (!row) throw new NotFoundException('That project could not be found.');
    return toDetail(row);
  }

  async create(dto: CreateProjectDto) {
    const created = await this.prisma.project.create({
      data: {
        title: cleanText(dto.title),
        slug: dto.slug,
        category: cleanText(dto.category),
        summary: cleanText(dto.summary),
        description: cleanText(dto.description),
        content: dto.content ? cleanText(dto.content) : null,
        problem: dto.problem ? cleanText(dto.problem) : null,
        solution: dto.solution ? cleanText(dto.solution) : null,
        features: (dto.features ?? []).map(cleanText).filter(Boolean),
        architecture: dto.architecture ? cleanText(dto.architecture) : null,
        challenges: dto.challenges ? cleanText(dto.challenges) : null,
        implementation: dto.implementation ? cleanText(dto.implementation) : null,
        results: dto.results ? cleanText(dto.results) : null,
        role: dto.role ? cleanText(dto.role) : null,
        year: dto.year ?? null,
        status: dto.status ?? ProjectStatus.DRAFT,
        featured: dto.featured ?? false,
        order: dto.order ?? 0,
        githubUrl: dto.githubUrl ?? null,
        liveUrl: dto.liveUrl ?? null,
        coverImage: dto.coverImage ?? null,
        accentColor: dto.accentColor ?? null,
        publishedAt: dto.status === ProjectStatus.PUBLISHED ? new Date() : null,
        technologies: technologyCreate(dto.technologies),
      },
      include: PROJECT_INCLUDE,
    });

    return toDetail(created);
  }

  async update(id: string, dto: UpdateProjectDto) {
    const existing = await this.prisma.project.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('That project could not be found.');

    const data: Prisma.ProjectUpdateInput = {};

    /** Empty strings from a form mean "clear this field". */
    const optionalText = (value: string | null | undefined): string | null | undefined =>
      value === undefined ? undefined : value && value.length > 0 ? cleanText(value) : null;

    if (dto.title !== undefined) data.title = cleanText(dto.title);
    if (dto.slug !== undefined) data.slug = dto.slug;
    if (dto.category !== undefined) data.category = cleanText(dto.category);
    if (dto.summary !== undefined) data.summary = cleanText(dto.summary);
    if (dto.description !== undefined) data.description = cleanText(dto.description);

    if (dto.content !== undefined) data.content = optionalText(dto.content);
    if (dto.problem !== undefined) data.problem = optionalText(dto.problem);
    if (dto.solution !== undefined) data.solution = optionalText(dto.solution);
    if (dto.architecture !== undefined) data.architecture = optionalText(dto.architecture);
    if (dto.challenges !== undefined) data.challenges = optionalText(dto.challenges);
    if (dto.implementation !== undefined) data.implementation = optionalText(dto.implementation);
    if (dto.results !== undefined) data.results = optionalText(dto.results);
    if (dto.role !== undefined) data.role = optionalText(dto.role);

    if (dto.features !== undefined) data.features = dto.features.map(cleanText).filter(Boolean);
    if (dto.year !== undefined) data.year = dto.year;
    if (dto.featured !== undefined) data.featured = dto.featured;
    if (dto.order !== undefined) data.order = dto.order;
    if (dto.githubUrl !== undefined) data.githubUrl = dto.githubUrl;
    if (dto.liveUrl !== undefined) data.liveUrl = dto.liveUrl;
    if (dto.coverImage !== undefined) data.coverImage = dto.coverImage;
    if (dto.accentColor !== undefined) data.accentColor = dto.accentColor;

    if (dto.status !== undefined) {
      data.status = dto.status;
      // Stamp the first publish, never overwrite it afterwards.
      if (dto.status === ProjectStatus.PUBLISHED && !existing.publishedAt) {
        data.publishedAt = new Date();
      }
    }

    if (dto.technologies !== undefined) {
      data.technologies = technologyReplace(dto.technologies);
    }

    const updated = await this.prisma.project.update({
      where: { id },
      data,
      include: PROJECT_INCLUDE,
    });

    return toDetail(updated);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.prisma.project.findUnique({ where: { id }, select: { id: true } });
    if (!existing) throw new NotFoundException('That project could not be found.');
    await this.prisma.project.delete({ where: { id } });
  }

  async reorder(ids: string[]): Promise<{ ok: boolean }> {
    await this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.project.updateMany({ where: { id }, data: { order: index } }),
      ),
    );
    return { ok: true };
  }
}
