import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  cleanText,
  flattenTechnologies,
  technologyCreate,
  technologyReplace,
} from '../common/utils/content.util';
import type { CreateExperienceDto, UpdateExperienceDto } from './dto/experience.dto';

const EXPERIENCE_INCLUDE = {
  technologies: { include: { technology: true } },
} satisfies Prisma.ExperienceInclude;

type ExperienceRow = Prisma.ExperienceGetPayload<{ include: typeof EXPERIENCE_INCLUDE }>;

function toClient(row: ExperienceRow) {
  return {
    id: row.id,
    organization: row.organization,
    role: row.role,
    description: row.description,
    startDate: row.startDate.toISOString(),
    endDate: row.endDate ? row.endDate.toISOString() : null,
    current: row.current,
    location: row.location,
    url: row.url,
    imageUrl: row.imageUrl,
    order: row.order,
    published: row.published,
    technologies: flattenTechnologies(row.technologies),
  };
}

@Injectable()
export class ExperienceService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublished() {
    const rows = await this.prisma.experience.findMany({
      where: { published: true },
      include: EXPERIENCE_INCLUDE,
      orderBy: [{ order: 'asc' }, { startDate: 'desc' }],
    });
    return rows.map(toClient);
  }

  async listAll() {
    const rows = await this.prisma.experience.findMany({
      include: EXPERIENCE_INCLUDE,
      orderBy: [{ order: 'asc' }, { startDate: 'desc' }],
    });
    return rows.map(toClient);
  }

  async create(dto: CreateExperienceDto) {
    const startDate = new Date(dto.startDate);
    if (Number.isNaN(startDate.getTime())) {
      throw new BadRequestException('Start date is not a valid date.');
    }

    const created = await this.prisma.experience.create({
      data: {
        organization: cleanText(dto.organization),
        role: cleanText(dto.role),
        description: cleanText(dto.description),
        startDate,
        endDate: dto.current || !dto.endDate ? null : new Date(dto.endDate),
        current: dto.current ?? false,
        location: dto.location ? cleanText(dto.location) : null,
        url: dto.url ?? null,
        imageUrl: dto.imageUrl ?? null,
        order: dto.order ?? (await this.prisma.experience.count()),
        published: dto.published ?? true,
        technologies: technologyCreate(dto.technologies),
      },
      include: EXPERIENCE_INCLUDE,
    });

    return toClient(created);
  }

  async update(id: string, dto: UpdateExperienceDto) {
    const existing = await this.prisma.experience.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('That experience entry could not be found.');

    const data: Prisma.ExperienceUpdateInput = {};

    if (dto.organization !== undefined) data.organization = cleanText(dto.organization);
    if (dto.role !== undefined) data.role = cleanText(dto.role);
    if (dto.description !== undefined) data.description = cleanText(dto.description);
    if (dto.startDate !== undefined) data.startDate = new Date(dto.startDate);

    if (dto.current !== undefined) {
      data.current = dto.current;
      if (dto.current) data.endDate = null;
      else if (dto.endDate) data.endDate = new Date(dto.endDate);
    } else if (dto.endDate !== undefined) {
      data.endDate = dto.endDate ? new Date(dto.endDate) : null;
    }

    if (dto.location !== undefined) data.location = dto.location ? cleanText(dto.location) : null;
    if (dto.url !== undefined) data.url = dto.url;
    if (dto.imageUrl !== undefined) data.imageUrl = dto.imageUrl;
    if (dto.order !== undefined) data.order = dto.order;
    if (dto.published !== undefined) data.published = dto.published;
    if (dto.technologies !== undefined) data.technologies = technologyReplace(dto.technologies);

    const updated = await this.prisma.experience.update({
      where: { id },
      data,
      include: EXPERIENCE_INCLUDE,
    });

    return toClient(updated);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.prisma.experience.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('That experience entry could not be found.');
    await this.prisma.experience.delete({ where: { id } });
  }

  async reorder(ids: string[]): Promise<{ ok: boolean }> {
    await this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.experience.updateMany({ where: { id }, data: { order: index } }),
      ),
    );
    return { ok: true };
  }
}
