/**
 * Database seed — idempotent.
 *
 * Creates the admin user, the profile (with statistics and social links),
 * projects, experience, skills and site settings.
 *
 * Content mirrors the reference design. Statistics are seeded as *editable*
 * values so they can be removed from the admin panel — nothing on the public
 * site is hardcoded, and no invented metric is presented as fact.
 *
 * Run with: npm run db:seed   (or `npm run db:seed:direct` to skip the CLI)
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config as loadEnv } from 'dotenv';
import { PrismaClient, ProjectStatus, type Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

// `prisma db seed` injects the environment, but a direct `ts-node` run does
// not. Load the package-local file first, then fall back to the monorepo root.
for (const candidate of [resolve(__dirname, '../.env'), resolve(__dirname, '../../../.env')]) {
  if (existsSync(candidate)) loadEnv({ path: candidate });
}

if (!process.env.DATABASE_URL) {
  console.error('✗ DATABASE_URL is not set. Create a .env file (see .env.example) and retry.');
  process.exit(1);
}

const prisma = new PrismaClient();

const NOW = new Date('2025-01-01T00:00:00.000Z');

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const TECHNOLOGY_COLORS: Record<string, string> = {
  react: '#61DAFB',
  typescript: '#3178C6',
  'tailwind-css': '#38BDF8',
  javascript: '#F7DF1E',
  'next-js': '#FFFFFF',
  'node-js': '#5FA04E',
  python: '#3776AB',
  nestjs: '#E0234E',
  postgresql: '#4169E1',
  prisma: '#8B9DF7',
  redis: '#FF4438',
  git: '#F05032',
  figma: '#F24E1E',
  'telegram-api': '#26A5E4',
  'local-llm': '#A855F7',
  'voice-tts': '#F0ABFC',
};

async function ensureTechnologies(names: string[]): Promise<void> {
  for (const name of names) {
    const slug = slugify(name);
    await prisma.technology.upsert({
      where: { slug },
      update: {},
      create: { name, slug, color: TECHNOLOGY_COLORS[slug] ?? '#A855F7' },
    });
  }
}

async function main(): Promise<void> {
  /* ------------------------------------------------------------------ */
  /* Admin user                                                          */
  /* ------------------------------------------------------------------ */

  const adminEmail = (process.env.ADMIN_EMAIL ?? 'admin@example.com').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'ChangeMe123!';
  const adminName = process.env.ADMIN_NAME ?? 'Natsu';

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { name: adminName },
    create: { email: adminEmail, name: adminName, passwordHash, role: 'ADMIN' },
  });

  console.log(`✓ admin user ready → ${admin.email}`);

  /* ------------------------------------------------------------------ */
  /* Profile                                                             */
  /* ------------------------------------------------------------------ */

  const existingProfile = await prisma.profile.findFirst({ where: { slug: 'natsu' } });

  const profile = existingProfile
    ? await prisma.profile.update({
        where: { id: existingProfile.id },
        data: { updatedAt: new Date() },
      })
    : await prisma.profile.create({
        data: {
          slug: 'natsu',
          name: 'Natsu',
          role: 'Frontend Developer · Anime Creator',
          headline: 'Frontend Developer who loves Anime',
          tagline: 'アニメで広がる、もっと特別な世界。',
          bio: 'I build modern web experiences inspired by anime, turning ideas into beautiful and functional products.',
          longBio:
            "I'm Natsu, a frontend developer focused on creating modern, beautiful and user-friendly web experiences. I care about motion, typography and the small details that make an interface feel alive — the same craft that makes a scene in an anime memorable.",
          location: 'Uzbekistan',
          email: process.env.CONTACT_EMAIL ?? 'hello@example.com',
          availabilityLabel: 'Available for collaboration',
          availableForWork: true,
          japanesePhrase: 'アニメで広がる、\nもっと特別な世界。',
          techPills: ['React', 'TypeScript', 'Tailwind', 'Anime'],
          musicTrackTitle: '夜のストーリー',
          musicTrackArtist: 'Natsu',
        },
      });

  // Replace the statistics set so re-running the seed stays deterministic.
  await prisma.profileStat.deleteMany({ where: { profileId: profile.id } });
  await prisma.profileStat.createMany({
    data: [
      { profileId: profile.id, label: 'Years Experience', value: '4', suffix: '+', icon: 'sparkles', order: 0 },
      { profileId: profile.id, label: 'Projects Completed', value: '10', suffix: '+', icon: 'layers', order: 1 },
      { profileId: profile.id, label: 'Love for Anime', value: '∞', suffix: null, icon: 'heart', order: 2 },
    ],
  });

  // Social links — placeholder destinations. Replace them in the admin panel.
  const socials = [
    { label: 'GitHub', url: 'https://github.com', icon: 'github', handle: '@github', order: 0 },
    { label: 'Telegram', url: 'https://telegram.org', icon: 'telegram', handle: '@telegram', order: 1 },
    { label: 'Instagram', url: 'https://instagram.com', icon: 'instagram', handle: '@instagram', order: 2 },
    { label: 'X', url: 'https://x.com', icon: 'twitter', handle: '@x', order: 3 },
    { label: 'Discord', url: 'https://discord.com', icon: 'discord', handle: '@discord', order: 4 },
  ];

  await prisma.socialLink.deleteMany({ where: { profileId: profile.id } });
  await prisma.socialLink.createMany({
    data: socials.map((social) => ({ ...social, profileId: profile.id, published: true })),
  });

  console.log(`✓ profile ready → ${profile.name}`);

  /* ------------------------------------------------------------------ */
  /* Projects                                                            */
  /* ------------------------------------------------------------------ */

  const projectSeeds: Array<Prisma.ProjectUncheckedCreateInput & { technologies: string[] }> = [
    {
      title: 'Tensei.uz',
      slug: 'tensei-uz',
      category: 'Anime Platform',
      summary: 'Anime discovery, streaming and community experience focused on Uzbek users.',
      description:
        'Tensei.uz is an anime platform built for the Uzbek audience: a fast discovery experience, a clean streaming surface and a community layer, wrapped in a visual language that respects the source material.',
      content:
        'The platform focuses on three things: finding an anime quickly, watching it without friction, and talking about it with other people. Everything else is deliberately quiet.',
      problem:
        'Uzbek anime fans were scattered across foreign platforms with no localisation, slow load times and interfaces that ignored the way the community actually talks about anime.',
      solution:
        'A localised, mobile-first anime platform with a fast catalogue, keyboard-friendly search, watch progress and a community feed — all built on a component system that scales.',
      features: [
        'Localised catalogue with Uzbek metadata',
        'Instant search with keyboard navigation',
        'Responsive streaming layout',
        'Watch progress and personal lists',
        'Community discussion layer',
      ],
      architecture:
        'React + TypeScript single-page application with a typed API layer, route-level code splitting and a design-system package shared across the site.',
      challenges:
        'Keeping first paint fast while rendering heavy artwork, and designing a catalogue that stays readable when metadata is missing or partially translated.',
      implementation:
        'Image-heavy routes are lazy loaded and progressively rendered, catalogue state is cached on the client, and every card degrades gracefully when an image or a field is absent.',
      results: 'N/A — metrics are not published. This case study documents the build, not performance claims.',
      role: 'Founder & Frontend Developer',
      year: 2024,
      status: ProjectStatus.PUBLISHED,
      featured: true,
      order: 0,
      liveUrl: 'https://tensei.uz',
      accentColor: '#A855F7',
      publishedAt: NOW,
      technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js'],
    },
    {
      title: 'TenseiiBot',
      slug: 'tenseiibot',
      category: 'Telegram Bot',
      summary:
        'Anime search, inline mode, favorites, AI features and a large anime database in Telegram.',
      description:
        'TenseiiBot brings anime search into Telegram. Inline mode lets anyone drop a result into any chat, favorites keep a personal list, and AI features help when you only remember the plot.',
      content:
        'Built around a large anime database, the bot answers in under a second and works in any chat through inline mode.',
      problem:
        'Searching for an anime usually means leaving the conversation, opening a browser and losing the thread — especially on mobile.',
      solution:
        'A Telegram-native bot with a large anime database, inline results that work in any chat, personal favorites and AI assistance for vague queries.',
      features: [
        'Inline mode usable from any chat',
        'Large anime database with fast lookup',
        'Personal favorites and history',
        'AI-assisted search from a plot description',
        'Localised responses',
      ],
      architecture:
        'Event-driven bot service with a database layer for the catalogue, a cache in front of the hottest queries and a queue for the AI-assisted search path.',
      challenges:
        'Keeping response latency low while the catalogue grows, and handling rate limits without dropping user requests.',
      implementation:
        'Hot queries are cached, media is resolved lazily, and heavy AI lookups are deferred so the common path never waits on them.',
      results: 'N/A — no public metrics are claimed.',
      role: 'Creator & Developer',
      year: 2023,
      status: ProjectStatus.PUBLISHED,
      featured: true,
      order: 1,
      accentColor: '#60A5FA',
      publishedAt: NOW,
      technologies: ['Python', 'Telegram API', 'PostgreSQL', 'Redis'],
    },
    {
      title: 'Yuuki Assistant',
      slug: 'yuuki-assistant',
      category: 'AI Assistant',
      summary:
        'Personal desktop AI companion with local LLM, voice interaction, emotions and avatar integration.',
      description:
        'Yuuki is a desktop companion that runs a local LLM. She listens, answers out loud, reacts with emotions and lives behind an animated avatar — private by default because nothing leaves the machine.',
      content:
        'The interesting part is the loop: speech in, intent, local inference, voice out, and an avatar that reacts to the result.',
      problem:
        'Cloud assistants are convenient but send everything to a server, and they have no personality to speak of.',
      solution:
        'A local-first desktop assistant with a local language model, voice interaction, an emotion layer and an animated avatar.',
      features: [
        'Local LLM inference — no data leaves the device',
        'Voice input and spoken responses',
        'Emotion state driving the avatar',
        'Desktop integration and quick invocation',
        'Configurable personality',
      ],
      architecture:
        'A desktop process orchestrating a local inference runtime, a speech pipeline and an avatar renderer, communicating over an internal message bus.',
      challenges:
        'Making local inference feel responsive on consumer hardware and keeping the voice pipeline from blocking the UI.',
      implementation:
        'Streaming generation feeds the avatar as tokens arrive, the speech pipeline runs off the main thread, and expensive models are loaded on demand.',
      results: 'N/A — a personal project, no metrics claimed.',
      role: 'AI Developer',
      year: 2022,
      status: ProjectStatus.PUBLISHED,
      featured: true,
      order: 2,
      accentColor: '#EC4899',
      publishedAt: NOW,
      technologies: ['Python', 'Local LLM', 'Voice / TTS'],
    },
    {
      title: 'Kiseki',
      slug: 'kiseki',
      category: 'Manga & Manhwa',
      summary: 'Modern manga and manhwa discovery platform with a strong visual experience.',
      description:
        'Kiseki is a reading-first discovery platform for manga and manhwa, designed so the artwork leads and the interface stays out of the way.',
      content:
        'The whole product is built around the reading surface: generous spacing, a distraction-free reader and a discovery feed that feels like browsing a shelf.',
      problem: 'Most manga aggregators bury the artwork under ads, cramped grids and generic typography.',
      solution:
        'A visual-first discovery platform with an editorial grid, a clean reader and comfortable defaults for long sessions.',
      features: [
        'Editorial discovery grid',
        'Distraction-free reading surface',
        'Reading progress and library',
        'Tag and genre exploration',
        'Responsive from phone to desktop',
      ],
      architecture:
        'Component-driven frontend with a typed API layer and a token-based design system so theming stays consistent across every surface.',
      challenges:
        'Designing a grid that handles wildly different cover aspect ratios without breaking the rhythm of the page.',
      implementation:
        'Covers render inside a fixed-ratio frame with intelligent object positioning, so portrait and landscape art both sit correctly.',
      results: 'N/A — no metrics claimed.',
      role: 'Frontend Developer',
      year: 2021,
      status: ProjectStatus.PUBLISHED,
      featured: true,
      order: 3,
      accentColor: '#F0ABFC',
      publishedAt: NOW,
      technologies: ['React', 'TypeScript', 'Tailwind CSS', 'NestJS', 'Prisma'],
    },
  ];

  for (const seed of projectSeeds) {
    const { technologies, ...data } = seed;
    await ensureTechnologies(technologies);

    const project = await prisma.project.upsert({
      where: { slug: seed.slug },
      update: { ...data, technologies: undefined },
      create: data,
    });

    // Re-link technologies deterministically.
    await prisma.projectTechnology.deleteMany({ where: { projectId: project.id } });
    for (const name of technologies) {
      const technology = await prisma.technology.findUnique({ where: { slug: slugify(name) } });
      if (technology) {
        await prisma.projectTechnology.create({
          data: { projectId: project.id, technologyId: technology.id },
        });
      }
    }
  }

  console.log(`✓ ${projectSeeds.length} projects ready`);

  /* ------------------------------------------------------------------ */
  /* Experience                                                          */
  /* ------------------------------------------------------------------ */

  const experienceSeeds = [
    {
      organization: 'Tensei.uz',
      role: 'Founder & Frontend Developer',
      description:
        'Founded and built an anime platform for the Uzbek audience — product direction, design system and the entire frontend, from catalogue to community.',
      startDate: new Date('2024-01-01T00:00:00.000Z'),
      endDate: null,
      current: true,
      location: 'Remote',
      url: 'https://tensei.uz',
      order: 0,
      technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js'],
    },
    {
      organization: 'TenseiiBot',
      role: 'Creator & Developer',
      description:
        'Designed and developed a Telegram anime bot with inline search, favorites, AI features and a large anime database behind a fast, cached query layer.',
      startDate: new Date('2023-01-01T00:00:00.000Z'),
      endDate: new Date('2024-01-01T00:00:00.000Z'),
      current: false,
      location: 'Remote',
      url: null,
      order: 1,
      technologies: ['Python', 'Telegram API', 'PostgreSQL', 'Redis'],
    },
    {
      organization: 'Yuuki Assistant',
      role: 'AI Developer',
      description:
        'Built a local-first desktop AI companion: local LLM inference, voice interaction, an emotion layer and an animated avatar, with privacy as the default.',
      startDate: new Date('2022-01-01T00:00:00.000Z'),
      endDate: new Date('2023-01-01T00:00:00.000Z'),
      current: false,
      location: 'Personal project',
      url: null,
      order: 2,
      technologies: ['Python', 'Local LLM', 'Voice / TTS'],
    },
    {
      organization: 'Kiseki',
      role: 'Frontend Developer',
      description:
        'Frontend for a manga and manhwa discovery platform — editorial grid, reader experience and a token-based design system.',
      startDate: new Date('2021-01-01T00:00:00.000Z'),
      endDate: new Date('2022-01-01T00:00:00.000Z'),
      current: false,
      location: 'Remote',
      url: null,
      order: 3,
      technologies: ['React', 'TypeScript', 'Tailwind CSS'],
    },
  ];

  for (const seed of experienceSeeds) {
    const { technologies, ...data } = seed;
    await ensureTechnologies(technologies);

    const existing = await prisma.experience.findFirst({ where: { organization: seed.organization } });

    const entry = existing
      ? await prisma.experience.update({ where: { id: existing.id }, data })
      : await prisma.experience.create({ data: { ...data, published: true } });

    await prisma.experienceTechnology.deleteMany({ where: { experienceId: entry.id } });
    for (const name of technologies) {
      const technology = await prisma.technology.findUnique({ where: { slug: slugify(name) } });
      if (technology) {
        await prisma.experienceTechnology.create({
          data: { experienceId: entry.id, technologyId: technology.id },
        });
      }
    }
  }

  console.log(`✓ ${experienceSeeds.length} experience entries ready`);

  /* ------------------------------------------------------------------ */
  /* Skills                                                              */
  /* ------------------------------------------------------------------ */

  const skillSeeds = [
    { name: 'React', category: 'Frontend', icon: 'react', color: '#61DAFB', description: 'Component architecture, hooks, suspense and performance work.' },
    { name: 'TypeScript', category: 'Language', icon: 'typescript', color: '#3178C6', description: 'Strict typing, generics and type-safe API layers end to end.' },
    { name: 'Tailwind CSS', category: 'Frontend', icon: 'tailwind', color: '#38BDF8', description: 'Design systems built from tokens, with no unused CSS in production.' },
    { name: 'JavaScript', category: 'Language', icon: 'javascript', color: '#F7DF1E', description: 'Modern ES2022+, async patterns and the browser platform.' },
    { name: 'Next.js', category: 'Frontend', icon: 'nextjs', color: '#FFFFFF', description: 'App router, server components, rendering strategy and SEO.' },
    { name: 'Node.js', category: 'Backend', icon: 'nodejs', color: '#5FA04E', description: 'REST APIs, NestJS services and database-backed applications.' },
    { name: 'Python', category: 'Backend', icon: 'python', color: '#3776AB', description: 'Bots, automation and AI/LLM integration work.' },
    { name: 'Git', category: 'Tooling', icon: 'git', color: '#F05032', description: 'Branching strategies, reviews and clean, readable history.' },
    { name: 'Figma', category: 'Design', icon: 'figma', color: '#F24E1E', description: 'Interface design, design tokens and handoff to code.' },
  ];

  for (const [index, seed] of skillSeeds.entries()) {
    const slug = slugify(seed.name);
    await prisma.skill.upsert({
      where: { slug },
      update: { ...seed, order: index },
      create: { ...seed, slug, order: index, published: true },
    });
  }

  console.log(`✓ ${skillSeeds.length} skills ready`);

  /* ------------------------------------------------------------------ */
  /* Site settings                                                       */
  /* ------------------------------------------------------------------ */

  const existingSettings = await prisma.siteSettings.findFirst();
  const settingsData = {
    siteTitle: 'Natsu — Frontend Developer & Anime Creator',
    siteDescription:
      'Natsu — Frontend Developer & Anime Creator. I build modern web experiences inspired by anime, turning ideas into beautiful and functional products.',
    seoKeywords: [
      'Natsu',
      'frontend developer',
      'anime creator',
      'React developer',
      'TypeScript',
      'portfolio',
      'Tensei.uz',
    ],
    footerNote: 'Designed & built with an unreasonable amount of care.',
    contactEmail: process.env.CONTACT_EMAIL ?? 'hello@example.com',
    analyticsEnabled: true,
  };

  if (existingSettings) {
    await prisma.siteSettings.update({ where: { id: existingSettings.id }, data: settingsData });
  } else {
    await prisma.siteSettings.create({ data: settingsData });
  }

  console.log('✓ site settings ready');

  console.log('\nSeed complete.');
  console.log(`   Admin login : ${adminEmail}`);
  console.log('   Password    : the value of ADMIN_PASSWORD (default: ChangeMe123!)');
  console.log('   → Change it immediately in any non-local environment.\n');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
