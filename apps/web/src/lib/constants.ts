import type { ProjectStatus } from '@natsu/types';

export const SITE_NAME = 'Natsu';

export const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Projects', to: '/projects' },
  { label: 'Experience', to: '/experience' },
  { label: 'Contact', to: '/contact' },
] as const;

export const ADMIN_NAV_LINKS = [
  { label: 'Overview', to: '/admin', icon: 'LayoutDashboard' },
  { label: 'Projects', to: '/admin/projects', icon: 'FolderKanban' },
  { label: 'Experience', to: '/admin/experience', icon: 'Route' },
  { label: 'Skills', to: '/admin/skills', icon: 'Sparkles' },
  { label: 'Messages', to: '/admin/messages', icon: 'Mail' },
  { label: 'Profile', to: '/admin/profile', icon: 'UserRound' },
  { label: 'Analytics', to: '/admin/analytics', icon: 'Activity' },
  { label: 'Settings', to: '/admin/settings', icon: 'Settings' },
] as const;

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  DRAFT: 'Draft',
  PUBLISHED: 'Live',
  ARCHIVED: 'Archived',
};

/** Suggested categories — the API stores a free-form string so this is a hint list. */
export const PROJECT_CATEGORIES = [
  'Anime Platform',
  'Telegram Bot',
  'AI Assistant',
  'Manga & Manhwa',
  'Web Application',
  'Open Source',
  'Experiment',
] as const;

export const SKILL_CATEGORIES = [
  'Frontend',
  'Backend',
  'Language',
  'Tooling',
  'Design',
  'AI & Data',
] as const;

export const SOCIAL_ICON_NAMES = [
  'github',
  'telegram',
  'instagram',
  'twitter',
  'discord',
  'youtube',
  'linkedin',
  'mail',
  'globe',
] as const;

export type SocialIconName = (typeof SOCIAL_ICON_NAMES)[number];

export const CONTACT_SUBJECTS = [
  'Project collaboration',
  'Freelance work',
  'Frontend / React role',
  'Just saying hi',
  'Something else',
] as const;

export const QUERY_KEYS = {
  profile: ['profile'] as const,
  projects: (params?: unknown) => ['projects', params ?? {}] as const,
  project: (slug: string) => ['project', slug] as const,
  experience: ['experience'] as const,
  skills: ['skills'] as const,
  socialLinks: ['social-links'] as const,
  settings: ['settings'] as const,
  adminOverview: ['admin', 'overview'] as const,
  adminMessages: (params?: unknown) => ['admin', 'messages', params ?? {}] as const,
  adminProjects: (params?: unknown) => ['admin', 'projects', params ?? {}] as const,
  adminExperience: ['admin', 'experience'] as const,
  adminSkills: ['admin', 'skills'] as const,
  adminProfile: ['admin', 'profile'] as const,
  adminSettings: ['admin', 'settings'] as const,
  adminAnalytics: (range: string) => ['admin', 'analytics', range] as const,
  session: ['auth', 'session'] as const,
} as const;

export const STORAGE_KEYS = {
  authToken: 'natsu.auth.token',
  theme: 'natsu.theme',
  introSeen: 'natsu.intro.seen',
  musicMuted: 'natsu.music.muted',
} as const;
