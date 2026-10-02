import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { cleanText } from '../common/utils/content.util';
import type { CreateSocialLinkDto, UpdateSocialLinkDto } from './dto/social-link.dto';

@Injectable()
export class SocialLinksService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublished() {
    const links = await this.prisma.socialLink.findMany({
      where: { published: true },
      orderBy: { order: 'asc' },
    });

    // Fall back to the profile's own links when none are published separately.
    if (links.length > 0) return links;

    const profile = await this.prisma.profile.findFirst({
      include: { socialLinks: { orderBy: { order: 'asc' } } },
    });

    return (profile?.socialLinks ?? []).filter((link) => link.published);
  }

  async listAll() {
    const profile = await this.prisma.profile.findFirst();
    return this.prisma.socialLink.findMany({
      where: profile ? { OR: [{ profileId: profile.id }, { profileId: null }] } : {},
      orderBy: { order: 'asc' },
    });
  }

  async create(dto: CreateSocialLinkDto) {
    const profile = await this.prisma.profile.findFirst();

    return this.prisma.socialLink.create({
      data: {
        label: cleanText(dto.label),
        url: dto.url,
        icon: dto.icon,
        handle: dto.handle ? cleanText(dto.handle) : null,
        order: dto.order ?? (await this.prisma.socialLink.count()),
        published: dto.published ?? true,
        profileId: profile?.id ?? null,
      },
    });
  }

  async update(id: string, dto: UpdateSocialLinkDto) {
    const existing = await this.prisma.socialLink.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('That social link could not be found.');

    const data: Prisma.SocialLinkUpdateInput = {};
    if (dto.label !== undefined) data.label = cleanText(dto.label);
    if (dto.url !== undefined) data.url = dto.url;
    if (dto.icon !== undefined) data.icon = dto.icon;
    if (dto.handle !== undefined) data.handle = dto.handle ? cleanText(dto.handle) : null;
    if (dto.order !== undefined) data.order = dto.order;
    if (dto.published !== undefined) data.published = dto.published;

    return this.prisma.socialLink.update({ where: { id }, data });
  }

  async remove(id: string): Promise<void> {
    const existing = await this.prisma.socialLink.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('That social link could not be found.');
    await this.prisma.socialLink.delete({ where: { id } });
  }
}
