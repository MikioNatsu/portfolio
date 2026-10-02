import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { cleanText, slugify } from '../common/utils/content.util';
import type { CreateSkillDto, UpdateSkillDto } from './dto/skill.dto';

@Injectable()
export class SkillsService {
  constructor(private readonly prisma: PrismaService) {}

  listPublished() {
    return this.prisma.skill.findMany({
      where: { published: true },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });
  }

  listAll() {
    return this.prisma.skill.findMany({ orderBy: [{ order: 'asc' }, { name: 'asc' }] });
  }

  async create(dto: CreateSkillDto) {
    return this.prisma.skill.create({
      data: {
        name: cleanText(dto.name),
        slug: dto.slug || slugify(dto.name),
        category: cleanText(dto.category),
        icon: dto.icon ?? null,
        color: dto.color ?? null,
        level: dto.level ?? null,
        description: dto.description ? cleanText(dto.description) : null,
        order: dto.order ?? (await this.prisma.skill.count()),
        published: dto.published ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateSkillDto) {
    const existing = await this.prisma.skill.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('That skill could not be found.');

    const data: Prisma.SkillUpdateInput = {};
    if (dto.name !== undefined) data.name = cleanText(dto.name);
    if (dto.slug !== undefined) data.slug = dto.slug;
    if (dto.category !== undefined) data.category = cleanText(dto.category);
    if (dto.icon !== undefined) data.icon = dto.icon;
    if (dto.color !== undefined) data.color = dto.color;
    if (dto.level !== undefined) data.level = dto.level;
    if (dto.description !== undefined)
      data.description = dto.description ? cleanText(dto.description) : null;
    if (dto.order !== undefined) data.order = dto.order;
    if (dto.published !== undefined) data.published = dto.published;

    return this.prisma.skill.update({ where: { id }, data });
  }

  async remove(id: string): Promise<void> {
    const existing = await this.prisma.skill.findUnique({ where: { id }, select: { id: true } });
    if (!existing) throw new NotFoundException('That skill could not be found.');
    await this.prisma.skill.delete({ where: { id } });
  }

  async reorder(ids: string[]): Promise<{ ok: boolean }> {
    await this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.skill.updateMany({ where: { id }, data: { order: index } }),
      ),
    );
    return { ok: true };
  }
}
