import type {
  AnalyticsEventName,
  AnalyticsEventInput,
  AnalyticsSummary,
  AuthUser,
  ContactMessage,
  ContactSubmissionResult,
  DashboardOverview,
  Experience,
  LoginResponse,
  Paginated,
  Profile,
  Project,
  ProjectSummary,
  SiteSettings,
  Skill,
  SocialLink,
  UploadResult,
} from '@natsu/types';
import { env } from '@/lib/env';
import { STORAGE_KEYS } from '@/lib/constants';

export class ApiError extends Error {
  readonly status: number;
  readonly details?: string[];

  constructor(message: string, status: number, details?: string[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

type QueryValue = string | number | boolean | undefined | null;

function buildQuery(params?: Record<string, QueryValue>): string {
  if (!params) return '';
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

function resolveUrl(path: string): string {
  const base = env.apiUrl.replace(/\/$/, '');
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
}

export function getAuthToken(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEYS.authToken);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null): void {
  try {
    if (token) window.localStorage.setItem(STORAGE_KEYS.authToken, token);
    else window.localStorage.removeItem(STORAGE_KEYS.authToken);
  } catch {
    /* storage unavailable — sessions simply won't persist */
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  auth?: boolean;
  timeoutMs?: number;
  /** Skip throwing on failure and return `null` instead (used for optional widgets). */
  optional?: boolean;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, auth = false, timeoutMs = 15000, optional = false, headers, ...init } = options;

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  const finalHeaders = new Headers(headers);
  if (body !== undefined && !(body instanceof FormData)) {
    finalHeaders.set('Content-Type', 'application/json');
  }
  if (auth) {
    const token = getAuthToken();
    if (token) finalHeaders.set('Authorization', `Bearer ${token}`);
  }

  try {
    const response = await fetch(resolveUrl(path), {
      ...init,
      headers: finalHeaders,
      credentials: 'include',
      signal: controller.signal,
      body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
    });

    if (response.status === 204) return undefined as T;

    const text = await response.text();
    const payload = text ? (JSON.parse(text) as unknown) : null;

    if (!response.ok) {
      const shape = payload as { message?: string | string[]; error?: string } | null;
      const rawMessage = shape?.message ?? shape?.error ?? response.statusText;
      const details = Array.isArray(rawMessage) ? rawMessage : undefined;
      const message = Array.isArray(rawMessage)
        ? (rawMessage[0] ?? 'Request failed')
        : rawMessage || 'Request failed';

      if (response.status === 401) setAuthToken(null);
      if (optional) return null as T;
      throw new ApiError(message, response.status, details);
    }

    return payload as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (optional) return null as T;
    const aborted = error instanceof DOMException && error.name === 'AbortError';
    throw new ApiError(
      aborted ? 'The request timed out. Please try again.' : 'Unable to reach the server.',
      0,
    );
  } finally {
    window.clearTimeout(timer);
  }
}

/* -------------------------------------------------------------------------- */
/* Public API                                                                  */
/* -------------------------------------------------------------------------- */

export const publicApi = {
  getProfile: (options?: RequestOptions) =>
    request<Profile>('/api/profile', { optional: true, ...options }),

  getProjects: (params?: { featured?: boolean; limit?: number; search?: string }) =>
    request<ProjectSummary[]>(`/api/projects${buildQuery(params)}`, { optional: true }),

  getProject: (slug: string) =>
    request<Project>(`/api/projects/${encodeURIComponent(slug)}`, { optional: true }),

  getExperience: () => request<Experience[]>('/api/experience', { optional: true }),

  getSkills: () => request<Skill[]>('/api/skills', { optional: true }),

  getSocialLinks: () => request<SocialLink[]>('/api/social-links', { optional: true }),

  getSettings: () => request<SiteSettings>('/api/settings', { optional: true }),

  submitContact: (payload: {
    name: string;
    email: string;
    subject: string;
    message: string;
    /** Honeypot — must stay empty. */
    company?: string;
  }) => request<ContactSubmissionResult>('/api/contact', { method: 'POST', body: payload }),

  track: (payload: AnalyticsEventInput) =>
    request<{ ok: boolean }>('/api/analytics/event', {
      method: 'POST',
      body: payload,
      optional: true,
      timeoutMs: 8000,
    }),
};

/* -------------------------------------------------------------------------- */
/* Admin API                                                                   */
/* -------------------------------------------------------------------------- */

export type MessageListParams = {
  page?: number;
  pageSize?: number;
  status?: string;
  search?: string;
};

export type AdminProjectListParams = {
  page?: number;
  pageSize?: number;
  status?: string;
  search?: string;
};

export const adminApi = {
  login: (payload: { email: string; password: string }) =>
    request<LoginResponse>('/api/auth/login', { method: 'POST', body: payload }),

  logout: () => request<{ ok: boolean }>('/api/auth/logout', { method: 'POST', auth: true }),

  me: () => request<AuthUser>('/api/auth/me', { auth: true, optional: true }),

  overview: () => request<DashboardOverview>('/api/admin/overview', { auth: true }),

  /* Messages ---------------------------------------------------------------- */
  listMessages: (params?: MessageListParams) =>
    request<Paginated<ContactMessage>>(`/api/admin/messages${buildQuery(params)}`, { auth: true }),

  markMessageRead: (id: string, read: boolean) =>
    request<ContactMessage>(`/api/admin/messages/${id}/read`, {
      method: 'PATCH',
      auth: true,
      body: { read },
    }),

  deleteMessage: (id: string) =>
    request<void>(`/api/admin/messages/${id}`, { method: 'DELETE', auth: true }),

  /* Projects ---------------------------------------------------------------- */
  listProjects: (params?: AdminProjectListParams) =>
    request<Paginated<Project>>(`/api/admin/projects${buildQuery(params)}`, { auth: true }),

  getProject: (id: string) => request<Project>(`/api/admin/projects/${id}`, { auth: true }),

  createProject: (payload: Record<string, unknown>) =>
    request<Project>('/api/admin/projects', { method: 'POST', auth: true, body: payload }),

  updateProject: (id: string, payload: Record<string, unknown>) =>
    request<Project>(`/api/admin/projects/${id}`, { method: 'PATCH', auth: true, body: payload }),

  deleteProject: (id: string) =>
    request<void>(`/api/admin/projects/${id}`, { method: 'DELETE', auth: true }),

  reorderProjects: (ids: string[]) =>
    request<{ ok: boolean }>('/api/admin/projects/reorder', {
      method: 'PATCH',
      auth: true,
      body: { ids },
    }),

  /* Experience -------------------------------------------------------------- */
  listExperience: () => request<Experience[]>('/api/admin/experience', { auth: true }),

  createExperience: (payload: Record<string, unknown>) =>
    request<Experience>('/api/admin/experience', { method: 'POST', auth: true, body: payload }),

  updateExperience: (id: string, payload: Record<string, unknown>) =>
    request<Experience>(`/api/admin/experience/${id}`, {
      method: 'PATCH',
      auth: true,
      body: payload,
    }),

  deleteExperience: (id: string) =>
    request<void>(`/api/admin/experience/${id}`, { method: 'DELETE', auth: true }),

  reorderExperience: (ids: string[]) =>
    request<{ ok: boolean }>('/api/admin/experience/reorder', {
      method: 'PATCH',
      auth: true,
      body: { ids },
    }),

  /* Skills ------------------------------------------------------------------ */
  listSkills: () => request<Skill[]>('/api/admin/skills', { auth: true }),

  createSkill: (payload: Record<string, unknown>) =>
    request<Skill>('/api/admin/skills', { method: 'POST', auth: true, body: payload }),

  updateSkill: (id: string, payload: Record<string, unknown>) =>
    request<Skill>(`/api/admin/skills/${id}`, { method: 'PATCH', auth: true, body: payload }),

  deleteSkill: (id: string) =>
    request<void>(`/api/admin/skills/${id}`, { method: 'DELETE', auth: true }),

  reorderSkills: (ids: string[]) =>
    request<{ ok: boolean }>('/api/admin/skills/reorder', {
      method: 'PATCH',
      auth: true,
      body: { ids },
    }),

  /* Profile & settings ------------------------------------------------------ */
  /** Stored profile, including unpublished statistics and links. */
  getProfile: () => request<Profile>('/api/admin/profile', { auth: true }),

  getSettings: () => request<SiteSettings>('/api/admin/settings', { auth: true }),

  updateProfile: (payload: Record<string, unknown>) =>
    request<Profile>('/api/admin/profile', { method: 'PATCH', auth: true, body: payload }),

  updateSettings: (payload: Record<string, unknown>) =>
    request<SiteSettings>('/api/admin/settings', { method: 'PATCH', auth: true, body: payload }),

  /* Uploads ----------------------------------------------------------------- */
  upload: (file: File, folder = 'general') => {
    const form = new FormData();
    form.append('file', file);
    form.append('folder', folder);
    return request<UploadResult>('/api/admin/uploads', {
      method: 'POST',
      auth: true,
      body: form,
      timeoutMs: 60000,
    });
  },

  /* Analytics --------------------------------------------------------------- */
  analytics: (range: '7d' | '30d' | '90d' = '30d') =>
    request<AnalyticsSummary>(`/api/admin/analytics?range=${range}`, { auth: true }),

  /* Social links ------------------------------------------------------------ */
  createSocialLink: (payload: Record<string, unknown>) =>
    request<SocialLink>('/api/admin/social-links', { method: 'POST', auth: true, body: payload }),

  updateSocialLink: (id: string, payload: Record<string, unknown>) =>
    request<SocialLink>(`/api/admin/social-links/${id}`, {
      method: 'PATCH',
      auth: true,
      body: payload,
    }),

  deleteSocialLink: (id: string) =>
    request<void>(`/api/admin/social-links/${id}`, { method: 'DELETE', auth: true }),
};

export type { AnalyticsEventName };
