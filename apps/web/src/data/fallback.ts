import type {
  Experience,
  Profile,
  ProfileStat,
  Project,
  ProjectSummary,
  ProjectTechnology,
  SiteSettings,
  Skill,
  SocialLink,
} from '@natsu/types';
import { slugify } from '@/lib/utils';

/**
 * Graceful-degradation content.
 *
 * The public site is fully CMS-driven, but a portfolio must never render a
 * broken page when the API is unreachable (cold start, local dev before
 * `docker compose up`, network hiccup...). Every hook falls back to this
 * dataset, which mirrors `apps/api/prisma/seed.ts`.
 *
 * Anything a visitor can read here is editable from the admin panel.
 */

function tech(name: string, icon: string, color: string): ProjectTechnology {
  return { id: `t_${slugify(name)}`, name, slug: slugify(name), icon, color };
}

const TECH = {
  react: tech('React', 'react', '#61DAFB'),
  typescript: tech('TypeScript', 'typescript', '#3178C6'),
  tailwind: tech('Tailwind CSS', 'tailwind', '#38BDF8'),
  javascript: tech('JavaScript', 'javascript', '#F7DF1E'),
  nextjs: tech('Next.js', 'nextjs', '#FFFFFF'),
  node: tech('Node.js', 'nodejs', '#5FA04E'),
  python: tech('Python', 'python', '#3776AB'),
  nest: tech('NestJS', 'nestjs', '#E0234E'),
  postgres: tech('PostgreSQL', 'postgresql', '#4169E1'),
  prisma: tech('Prisma', 'prisma', '#8B9DF7'),
  git: tech('Git', 'git', '#F05032'),
  figma: tech('Figma', 'figma', '#F24E1E'),
  framer: tech('Framer Motion', 'framer', '#E64BFF'),
  redis: tech('Redis', 'redis', '#FF4438'),
  telegram: tech('Telegram API', 'telegram', '#26A5E4'),
  llm: tech('Local LLM', 'brain', '#A855F7'),
  voice: tech('Voice / TTS', 'audio', '#F0ABFC'),
} as const;

const NOW = '2025-01-01T00:00:00.000Z';

/* -------------------------------------------------------------------------- */
/* Profile                                                                     */
/* -------------------------------------------------------------------------- */

const profileStats: ProfileStat[] = [
  {
    id: 'stat_experience',
    label: 'Years Experience',
    value: '4',
    suffix: '+',
    icon: 'Sparkles',
    order: 0,
    published: true,
  },
  {
    id: 'stat_projects',
    label: 'Projects Completed',
    value: '10',
    suffix: '+',
    icon: 'Layers',
    order: 1,
    published: true,
  },
  {
    id: 'stat_anime',
    label: 'Love for Anime',
    value: '∞',
    suffix: null,
    icon: 'Heart',
    order: 2,
    published: true,
  },
];

const socialLinks: SocialLink[] = [
  {
    id: 'social_github',
    label: 'GitHub',
    url: 'https://github.com',
    icon: 'github',
    handle: '@github',
    order: 0,
    published: true,
  },
  {
    id: 'social_telegram',
    label: 'Telegram',
    url: 'https://telegram.org',
    icon: 'telegram',
    handle: '@telegram',
    order: 1,
    published: true,
  },
  {
    id: 'social_instagram',
    label: 'Instagram',
    url: 'https://instagram.com',
    icon: 'instagram',
    handle: '@instagram',
    order: 2,
    published: true,
  },
  {
    id: 'social_twitter',
    label: 'X',
    url: 'https://x.com',
    icon: 'twitter',
    handle: '@x',
    order: 3,
    published: true,
  },
  {
    id: 'social_discord',
    label: 'Discord',
    url: 'https://discord.com',
    icon: 'discord',
    handle: '@discord',
    order: 4,
    published: true,
  },
];

export const fallbackProfile: Profile = {
  id: 'profile_natsu',
  name: 'Natsu',
  role: 'Frontend Developer · Anime Creator',
  headline: 'Frontend Developer who loves Anime',
  tagline: 'アニメで広がる、もっと特別な世界。',
  bio: 'I build modern web experiences inspired by anime, turning ideas into beautiful and functional products.',
  longBio:
    "I'm Natsu, a frontend developer focused on creating modern, beautiful and user-friendly web experiences. I care about motion, typography and the small details that make an interface feel alive — the same craft that makes a scene in an anime memorable.",
  avatarUrl: null,
  heroImageUrl: null,
  location: 'Uzbekistan',
  email: 'hello@example.com',
  availabilityLabel: 'Available for collaboration',
  availableForWork: true,
  resumeUrl: null,
  japanesePhrase: 'アニメで広がる、\nもっと特別な世界。',
  techPills: ['React', 'TypeScript', 'Tailwind', 'Anime'],
  musicTrackTitle: '夜のストーリー',
  musicTrackArtist: 'Natsu',
  musicAudioUrl: null,
  musicCoverUrl: null,
  stats: profileStats,
  socialLinks,
  updatedAt: NOW,
};

/* -------------------------------------------------------------------------- */
/* Projects                                                                    */
/* -------------------------------------------------------------------------- */

export const fallbackProjects: Project[] = [
  {
    id: 'proj_tensei',
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
    results:
      'N/A — metrics are not published. This case study documents the build, not performance claims.',
    role: 'Founder & Frontend Developer',
    year: 2024,
    status: 'PUBLISHED',
    featured: true,
    order: 0,
    githubUrl: null,
    liveUrl: 'https://tensei.uz',
    coverImage: null,
    accentColor: '#A855F7',
    publishedAt: NOW,
    createdAt: NOW,
    updatedAt: NOW,
    technologies: [TECH.react, TECH.typescript, TECH.tailwind, TECH.node],
    images: [],
  },
  {
    id: 'proj_tenseiibot',
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
    status: 'PUBLISHED',
    featured: true,
    order: 1,
    githubUrl: null,
    liveUrl: null,
    coverImage: null,
    accentColor: '#60A5FA',
    publishedAt: NOW,
    createdAt: NOW,
    updatedAt: NOW,
    technologies: [TECH.python, TECH.telegram, TECH.postgres, TECH.redis],
    images: [],
  },
  {
    id: 'proj_yuuki',
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
    status: 'PUBLISHED',
    featured: true,
    order: 2,
    githubUrl: null,
    liveUrl: null,
    coverImage: null,
    accentColor: '#EC4899',
    publishedAt: NOW,
    createdAt: NOW,
    updatedAt: NOW,
    technologies: [TECH.python, TECH.llm, TECH.voice],
    images: [],
  },
  {
    id: 'proj_kiseki',
    title: 'Kiseki',
    slug: 'kiseki',
    category: 'Manga & Manhwa',
    summary: 'Modern manga and manhwa discovery platform with a strong visual experience.',
    description:
      'Kiseki is a reading-first discovery platform for manga and manhwa, designed so the artwork leads and the interface stays out of the way.',
    content:
      'The whole product is built around the reading surface: generous spacing, a distraction-free reader and a discovery feed that feels like browsing a shelf.',
    problem:
      'Most manga aggregators bury the artwork under ads, cramped grids and generic typography.',
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
    status: 'PUBLISHED',
    featured: true,
    order: 3,
    githubUrl: null,
    liveUrl: null,
    coverImage: null,
    accentColor: '#F0ABFC',
    publishedAt: NOW,
    createdAt: NOW,
    updatedAt: NOW,
    technologies: [TECH.react, TECH.typescript, TECH.tailwind, TECH.nest, TECH.prisma],
    images: [],
  },
];

export const fallbackProjectSummaries: ProjectSummary[] = fallbackProjects.map((project) => ({
  id: project.id,
  title: project.title,
  slug: project.slug,
  category: project.category,
  summary: project.summary,
  status: project.status,
  featured: project.featured,
  order: project.order,
  githubUrl: project.githubUrl,
  liveUrl: project.liveUrl,
  coverImage: project.coverImage,
  accentColor: project.accentColor,
  year: project.year,
  technologies: project.technologies,
}));

/* -------------------------------------------------------------------------- */
/* Experience                                                                  */
/* -------------------------------------------------------------------------- */

export const fallbackExperience: Experience[] = [
  {
    id: 'exp_tensei',
    organization: 'Tensei.uz',
    role: 'Founder & Frontend Developer',
    description:
      'Founded and built an anime platform for the Uzbek audience — product direction, design system and the entire frontend, from catalogue to community.',
    startDate: '2024-01-01T00:00:00.000Z',
    endDate: null,
    current: true,
    location: 'Remote',
    url: 'https://tensei.uz',
    imageUrl: null,
    order: 0,
    published: true,
    technologies: [TECH.react, TECH.typescript, TECH.tailwind, TECH.node],
  },
  {
    id: 'exp_tenseiibot',
    organization: 'TenseiiBot',
    role: 'Creator & Developer',
    description:
      'Designed and developed a Telegram anime bot with inline search, favorites, AI features and a large anime database behind a fast, cached query layer.',
    startDate: '2023-01-01T00:00:00.000Z',
    endDate: '2024-01-01T00:00:00.000Z',
    current: false,
    location: 'Remote',
    url: null,
    imageUrl: null,
    order: 1,
    published: true,
    technologies: [TECH.python, TECH.telegram, TECH.postgres, TECH.redis],
  },
  {
    id: 'exp_yuuki',
    organization: 'Yuuki Assistant',
    role: 'AI Developer',
    description:
      'Built a local-first desktop AI companion: local LLM inference, voice interaction, an emotion layer and an animated avatar, with privacy as the default.',
    startDate: '2022-01-01T00:00:00.000Z',
    endDate: '2023-01-01T00:00:00.000Z',
    current: false,
    location: 'Personal project',
    url: null,
    imageUrl: null,
    order: 2,
    published: true,
    technologies: [TECH.python, TECH.llm, TECH.voice],
  },
  {
    id: 'exp_kiseki',
    organization: 'Kiseki',
    role: 'Frontend Developer',
    description:
      'Frontend for a manga and manhwa discovery platform — editorial grid, reader experience and a token-based design system.',
    startDate: '2021-01-01T00:00:00.000Z',
    endDate: '2022-01-01T00:00:00.000Z',
    current: false,
    location: 'Remote',
    url: null,
    imageUrl: null,
    order: 3,
    published: true,
    technologies: [TECH.react, TECH.typescript, TECH.tailwind],
  },
];

/* -------------------------------------------------------------------------- */
/* Skills                                                                      */
/* -------------------------------------------------------------------------- */

export const fallbackSkills: Skill[] = [
  {
    id: 'skill_react',
    name: 'React',
    slug: 'react',
    category: 'Frontend',
    icon: 'react',
    color: '#61DAFB',
    level: null,
    description: 'Component architecture, hooks, suspense and performance work.',
    order: 0,
    published: true,
  },
  {
    id: 'skill_typescript',
    name: 'TypeScript',
    slug: 'typescript',
    category: 'Language',
    icon: 'typescript',
    color: '#3178C6',
    level: null,
    description: 'Strict typing, generics and type-safe API layers end to end.',
    order: 1,
    published: true,
  },
  {
    id: 'skill_tailwind',
    name: 'Tailwind CSS',
    slug: 'tailwind-css',
    category: 'Frontend',
    icon: 'tailwind',
    color: '#38BDF8',
    level: null,
    description: 'Design systems built from tokens, with no unused CSS in production.',
    order: 2,
    published: true,
  },
  {
    id: 'skill_javascript',
    name: 'JavaScript',
    slug: 'javascript',
    category: 'Language',
    icon: 'javascript',
    color: '#F7DF1E',
    level: null,
    description: 'Modern ES2022+, async patterns and the browser platform.',
    order: 3,
    published: true,
  },
  {
    id: 'skill_nextjs',
    name: 'Next.js',
    slug: 'nextjs',
    category: 'Frontend',
    icon: 'nextjs',
    color: '#FFFFFF',
    level: null,
    description: 'App router, server components, rendering strategy and SEO.',
    order: 4,
    published: true,
  },
  {
    id: 'skill_nodejs',
    name: 'Node.js',
    slug: 'nodejs',
    category: 'Backend',
    icon: 'nodejs',
    color: '#5FA04E',
    level: null,
    description: 'REST APIs, NestJS services and database-backed applications.',
    order: 5,
    published: true,
  },
  {
    id: 'skill_python',
    name: 'Python',
    slug: 'python',
    category: 'Backend',
    icon: 'python',
    color: '#3776AB',
    level: null,
    description: 'Bots, automation and AI/LLM integration work.',
    order: 6,
    published: true,
  },
  {
    id: 'skill_git',
    name: 'Git',
    slug: 'git',
    category: 'Tooling',
    icon: 'git',
    color: '#F05032',
    level: null,
    description: 'Branching strategies, reviews and clean, readable history.',
    order: 7,
    published: true,
  },
  {
    id: 'skill_figma',
    name: 'Figma',
    slug: 'figma',
    category: 'Design',
    icon: 'figma',
    color: '#F24E1E',
    level: null,
    description: 'Interface design, design tokens and handoff to code.',
    order: 8,
    published: true,
  },
];

/* -------------------------------------------------------------------------- */
/* Settings                                                                    */
/* -------------------------------------------------------------------------- */

export const fallbackSettings: SiteSettings = {
  id: 'settings_default',
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
  ogImageUrl: null,
  twitterHandle: null,
  footerNote: 'Designed & built with an unreasonable amount of care.',
  contactEmail: 'hello@example.com',
  analyticsEnabled: true,
  updatedAt: NOW,
};
