import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { cleanText } from '../common/utils/content.util';
import type { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Singleton row — created with sensible defaults on first read. */
  async get() {
    const existing = await this.prisma.siteSettings.findFirst();
    if (existing) return existing;

    return this.prisma.siteSettings.create({
      data: {
        siteTitle: 'Natsu — Frontend Developer & Anime Creator',
        siteDescription:
          'Natsu — Frontend Developer & Anime Creator. I build modern web experiences inspired by anime, turning ideas into beautiful and functional products.',
        seoKeywords: ['Natsu', 'frontend developer', 'anime creator', 'React', 'TypeScript'],
      },
    });
  }

  async update(dto: UpdateSettingsDto) {
    const settings = await this.get();

    const data: Prisma.SiteSettingsUpdateInput = {};
    if (dto.siteTitle !== undefined) data.siteTitle = cleanText(dto.siteTitle);
    if (dto.siteDescription !== undefined) data.siteDescription = cleanText(dto.siteDescription);
    if (dto.seoKeywords !== undefined)
      data.seoKeywords = dto.seoKeywords.map(cleanText).filter(Boolean).slice(0, 24);
    if (dto.ogImageUrl !== undefined) data.ogImageUrl = dto.ogImageUrl;
    if (dto.twitterHandle !== undefined)
      data.twitterHandle = dto.twitterHandle ? cleanText(dto.twitterHandle) : null;
    if (dto.footerNote !== undefined)
      data.footerNote = dto.footerNote ? cleanText(dto.footerNote) : null;
    if (dto.contactEmail !== undefined)
      data.contactEmail = dto.contactEmail ? dto.contactEmail.toLowerCase().trim() : null;
    if (dto.analyticsEnabled !== undefined) data.analyticsEnabled = dto.analyticsEnabled;

    return this.prisma.siteSettings.update({ where: { id: settings.id }, data });
  }
}
