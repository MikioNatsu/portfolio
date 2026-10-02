import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { cleanText } from '../common/utils/content.util';
import type { UpdateProfileDto } from './dto/update-profile.dto';

type ProfileWithRelations = Prisma.ProfileGetPayload<{
  include: { stats: true; socialLinks: true };
}>;

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * The portfolio has exactly one profile. If none exists yet (fresh database),
   * a neutral placeholder is created so the public site renders immediately
   * instead of erroring.
   */
  async get(): Promise<ProfileWithRelations> {
    const existing = await this.prisma.profile.findFirst({
      include: {
        stats: { orderBy: { order: 'asc' } },
        socialLinks: { orderBy: { order: 'asc' } },
      },
    });

    if (existing) return existing;

    return this.prisma.profile.create({
      data: {
        slug: 'natsu',
        name: 'Natsu',
        role: 'Frontend Developer · Anime Creator',
        bio: 'I build modern web experiences inspired by anime, turning ideas into beautiful and functional products.',
        techPills: ['React', 'TypeScript', 'Tailwind', 'Anime'],
        availabilityLabel: 'Available for collaboration',
        availableForWork: true,
      },
      include: {
        stats: { orderBy: { order: 'asc' } },
        socialLinks: { orderBy: { order: 'asc' } },
      },
    });
  }

  async update(dto: UpdateProfileDto): Promise<ProfileWithRelations> {
    const profile = await this.get();

    const data: Prisma.ProfileUpdateInput = {};

    if (dto.name !== undefined) data.name = cleanText(dto.name);
    if (dto.role !== undefined) data.role = cleanText(dto.role);
    if (dto.headline !== undefined) data.headline = dto.headline ? cleanText(dto.headline) : null;
    if (dto.tagline !== undefined) data.tagline = dto.tagline ? cleanText(dto.tagline) : null;
    if (dto.bio !== undefined) data.bio = cleanText(dto.bio);
    if (dto.longBio !== undefined) data.longBio = dto.longBio ? cleanText(dto.longBio) : null;
    if (dto.avatarUrl !== undefined) data.avatarUrl = dto.avatarUrl;
    if (dto.heroImageUrl !== undefined) data.heroImageUrl = dto.heroImageUrl;
    if (dto.location !== undefined) data.location = dto.location ? cleanText(dto.location) : null;
    if (dto.email !== undefined) data.email = dto.email ? dto.email.toLowerCase().trim() : null;
    if (dto.availabilityLabel !== undefined)
      data.availabilityLabel = dto.availabilityLabel ? cleanText(dto.availabilityLabel) : null;
    if (dto.availableForWork !== undefined) data.availableForWork = dto.availableForWork;
    if (dto.resumeUrl !== undefined) data.resumeUrl = dto.resumeUrl;
    if (dto.japanesePhrase !== undefined)
      data.japanesePhrase = dto.japanesePhrase ? cleanText(dto.japanesePhrase) : null;
    if (dto.musicTrackTitle !== undefined)
      data.musicTrackTitle = dto.musicTrackTitle ? cleanText(dto.musicTrackTitle) : null;
    if (dto.musicTrackArtist !== undefined)
      data.musicTrackArtist = dto.musicTrackArtist ? cleanText(dto.musicTrackArtist) : null;
    if (dto.musicAudioUrl !== undefined) data.musicAudioUrl = dto.musicAudioUrl;
    if (dto.musicCoverUrl !== undefined) data.musicCoverUrl = dto.musicCoverUrl;
    if (dto.techPills !== undefined) data.techPills = dto.techPills.map(cleanText).filter(Boolean);

    await this.prisma.$transaction(async (tx) => {
      await tx.profile.update({ where: { id: profile.id }, data });

      // Statistics are replaced wholesale: the admin panel owns the list.
      if (dto.stats !== undefined) {
        await tx.profileStat.deleteMany({ where: { profileId: profile.id } });
        if (dto.stats.length > 0) {
          await tx.profileStat.createMany({
            data: dto.stats.slice(0, 12).map((stat, index) => ({
              profileId: profile.id,
              label: cleanText(stat.label),
              value: cleanText(stat.value),
              suffix: stat.suffix ? cleanText(stat.suffix) : null,
              icon: stat.icon ?? null,
              order: stat.order ?? index,
              published: stat.published ?? true,
            })),
          });
        }
      }
    });

    return this.get();
  }
}
