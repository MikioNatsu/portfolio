/**
 * Shared domain contracts between `apps/web` and `apps/api`.
 *
 * IMPORTANT: this package is intentionally **type-only**. Every export below is
 * either an interface, a type alias or a `const`-object-as-union. It emits no
 * runtime JavaScript, which lets both apps consume it via `import type`
 * without any build step, bundler alias or runtime resolution concerns.
 *
 * Runtime constants (select options, colour maps, ...) live in the apps.
 */

/* -------------------------------------------------------------------------- */
/* Enums expressed as unions                                                   */
/* -------------------------------------------------------------------------- */

export const PROJECT_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const IMAGE_KINDS = ['COVER', 'THUMBNAIL', 'MOBILE', 'DESKTOP', 'GALLERY'] as const;
export type ImageKind = (typeof IMAGE_KINDS)[number];

export const CONTACT_STATUSES = ['NEW', 'READ', 'ARCHIVED'] as const;
export type ContactStatus = (typeof CONTACT_STATUSES)[number];

export const USER_ROLES = ['ADMIN', 'EDITOR'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const ANALYTICS_EVENTS = [
  'page_view',
  'project_view',
  'contact_submitted',
  'project_click',
  'social_click',
  'resume_download',
] as const;
export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];

export const DEVICE_TYPES = ['desktop', 'tablet', 'mobile', 'unknown'] as const;
export type DeviceType = (typeof DEVICE_TYPES)[number];

/* -------------------------------------------------------------------------- */
/* Core entities                                                               */
/* -------------------------------------------------------------------------- */

export interface Technology {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
}

/** A technology attached to a project (flattened for the client). */
export type ProjectTechnology = Technology;

export interface ProjectImage {
  id: string;
  url: string;
  alt: string | null;
  caption: string | null;
  kind: ImageKind;
  width: number | null;
  height: number | null;
  order: number;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  description: string;
  content: string | null;
  problem: string | null;
  solution: string | null;
  features: string[];
  architecture: string | null;
  challenges: string | null;
  implementation: string | null;
  results: string | null;
  role: string | null;
  year: number | null;
  status: ProjectStatus;
  featured: boolean;
  order: number;
  githubUrl: string | null;
  liveUrl: string | null;
  coverImage: string | null;
  accentColor: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  technologies: ProjectTechnology[];
  images: ProjectImage[];
}

/** Compact projection used by grids and cards. */
export interface ProjectSummary {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  status: ProjectStatus;
  featured: boolean;
  order: number;
  githubUrl: string | null;
  liveUrl: string | null;
  coverImage: string | null;
  accentColor: string | null;
  year: number | null;
  technologies: ProjectTechnology[];
}

export interface ProfileStat {
  id: string;
  label: string;
  value: string;
  suffix: string | null;
  icon: string | null;
  order: number;
  published: boolean;
}

export interface SocialLink {
  id: string;
  label: string;
  url: string;
  icon: string;
  handle: string | null;
  order: number;
  published: boolean;
}

export interface Profile {
  id: string;
  name: string;
  role: string;
  headline: string | null;
  tagline: string | null;
  bio: string;
  longBio: string | null;
  avatarUrl: string | null;
  heroImageUrl: string | null;
  location: string | null;
  email: string | null;
  availabilityLabel: string | null;
  availableForWork: boolean;
  resumeUrl: string | null;
  japanesePhrase: string | null;
  techPills: string[];
  musicTrackTitle: string | null;
  musicTrackArtist: string | null;
  musicAudioUrl: string | null;
  musicCoverUrl: string | null;
  stats: ProfileStat[];
  socialLinks: SocialLink[];
  updatedAt: string;
}

export interface Experience {
  id: string;
  organization: string;
  role: string;
  description: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  location: string | null;
  url: string | null;
  imageUrl: string | null;
  order: number;
  published: boolean;
  technologies: Technology[];
}

export interface Skill {
  id: string;
  name: string;
  slug: string;
  category: string;
  icon: string | null;
  color: string | null;
  level: number | null;
  description: string | null;
  order: number;
  published: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactStatus;
  read: boolean;
  createdAt: string;
}

export interface SiteSettings {
  id: string;
  siteTitle: string;
  siteDescription: string;
  seoKeywords: string[];
  ogImageUrl: string | null;
  twitterHandle: string | null;
  footerNote: string | null;
  contactEmail: string | null;
  analyticsEnabled: boolean;
  updatedAt: string;
}

/* -------------------------------------------------------------------------- */
/* Auth                                                                        */
/* -------------------------------------------------------------------------- */

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl: string | null;
  lastLoginAt: string | null;
}

export interface LoginResponse {
  accessToken: string;
  expiresIn: string;
  user: AuthUser;
}

/* -------------------------------------------------------------------------- */
/* Analytics                                                                   */
/* -------------------------------------------------------------------------- */

export interface AnalyticsEventInput {
  event: AnalyticsEventName;
  path: string;
  projectId?: string | null;
  referrer?: string | null;
  sessionId?: string | null;
  deviceType?: DeviceType | null;
}

export interface AnalyticsBreakdownItem {
  label: string;
  value: number;
}

export interface AnalyticsSeriesPoint {
  date: string;
  views: number;
  events: number;
}

export interface AnalyticsSummary {
  totals: {
    views: number;
    projectViews: number;
    events: number;
    messages: number;
    unreadMessages: number;
    projects: number;
    publishedProjects: number;
  };
  series: AnalyticsSeriesPoint[];
  topProjects: Array<{ id: string; title: string; slug: string; views: number }>;
  topPaths: AnalyticsBreakdownItem[];
  devices: AnalyticsBreakdownItem[];
  referrers: AnalyticsBreakdownItem[];
  recentEvents: Array<{
    id: string;
    event: string;
    path: string;
    deviceType: string | null;
    referrer: string | null;
    createdAt: string;
  }>;
}

export interface DashboardOverview {
  projects: { total: number; published: number; drafts: number; featured: number };
  messages: { total: number; unread: number };
  views: { total: number; last7Days: number };
  experience: number;
  skills: number;
  recentMessages: ContactMessage[];
  recentEvents: AnalyticsSummary['recentEvents'];
}

/* -------------------------------------------------------------------------- */
/* Infra                                                                       */
/* -------------------------------------------------------------------------- */

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
}

export interface ApiErrorShape {
  statusCode: number;
  message: string | string[];
  error?: string;
  path?: string;
  timestamp?: string;
}

export interface UploadResult {
  url: string;
  publicId: string;
  width: number | null;
  height: number | null;
  format: string | null;
  bytes: number | null;
  provider: 'cloudinary' | 'local';
}

export interface ContactSubmissionResult {
  id: string;
  received: boolean;
  emailSent: boolean;
  message: string;
}
