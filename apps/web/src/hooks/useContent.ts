import { useQuery } from '@tanstack/react-query';
import type {
  Experience,
  Profile,
  Project,
  ProjectSummary,
  SiteSettings,
  Skill,
  SocialLink,
} from '@natsu/types';
import { publicApi } from '@/api/client';
import { QUERY_KEYS } from '@/lib/constants';
import {
  fallbackExperience,
  fallbackProfile,
  fallbackProjectSummaries,
  fallbackProjects,
  fallbackSettings,
  fallbackSkills,
} from '@/data/fallback';

const STALE = 5 * 60 * 1000;

/**
 * Every content hook returns `data` from the API when available and silently
 * falls back to the bundled dataset when it is not. Components therefore never
 * need to branch on loading/error to stay presentable — `isFallback` is exposed
 * for the rare case where we want to hint at it.
 */

export function useProfile() {
  const query = useQuery({
    queryKey: QUERY_KEYS.profile,
    queryFn: () => publicApi.getProfile(),
    staleTime: STALE,
  });

  const profile: Profile = query.data ?? fallbackProfile;
  profile.stats = (profile.stats ?? []).filter((stat) => stat.published);
  profile.socialLinks = (profile.socialLinks ?? []).filter((link) => link.published);

  return { ...query, profile, isFallback: !query.data };
}

export function useProjects(options: { featured?: boolean; limit?: number } = {}) {
  const { featured, limit } = options;
  const query = useQuery({
    queryKey: QUERY_KEYS.projects({ featured, limit }),
    queryFn: () => publicApi.getProjects({ featured, limit }),
    staleTime: STALE,
  });

  let projects: ProjectSummary[] = query.data ?? fallbackProjectSummaries;
  if (featured) projects = projects.filter((project) => project.featured);
  projects = [...projects].sort((a, b) => a.order - b.order).slice(0, limit ?? undefined);

  return { ...query, projects, isFallback: !query.data };
}

export function useProject(slug: string | undefined) {
  const query = useQuery({
    queryKey: QUERY_KEYS.project(slug ?? ''),
    queryFn: () => publicApi.getProject(slug as string),
    enabled: Boolean(slug),
    staleTime: STALE,
  });

  const fallbackProject =
    fallbackProjects.find((project) => project.slug === slug) ??
    (slug && !query.data ? undefined : null);
  const project: Project | null = query.data ?? fallbackProject ?? null;

  return { ...query, project, isFallback: !query.data && Boolean(fallbackProject) };
}

export function useExperience() {
  const query = useQuery({
    queryKey: QUERY_KEYS.experience,
    queryFn: () => publicApi.getExperience(),
    staleTime: STALE,
  });

  const experience: Experience[] = (query.data ?? fallbackExperience)
    .filter((item) => item.published)
    .sort((a, b) => a.order - b.order || Number(b.current) - Number(a.current));

  return { ...query, experience, isFallback: !query.data };
}

export function useSkills() {
  const query = useQuery({
    queryKey: QUERY_KEYS.skills,
    queryFn: () => publicApi.getSkills(),
    staleTime: STALE,
  });

  const skills: Skill[] = (query.data ?? fallbackSkills)
    .filter((skill) => skill.published)
    .sort((a, b) => a.order - b.order);

  return { ...query, skills, isFallback: !query.data };
}

export function useSocialLinks(profileOverride?: SocialLink[]) {
  const query = useQuery({
    queryKey: QUERY_KEYS.socialLinks,
    queryFn: () => publicApi.getSocialLinks(),
    staleTime: STALE,
  });

  const source = query.data ?? profileOverride ?? fallbackProfile.socialLinks;
  const socialLinks: SocialLink[] = source
    .filter((link) => link.published)
    .sort((a, b) => a.order - b.order);

  return { ...query, socialLinks, isFallback: !query.data };
}

export function useSettings() {
  const query = useQuery({
    queryKey: QUERY_KEYS.settings,
    queryFn: () => publicApi.getSettings(),
    staleTime: STALE,
  });

  const settings: SiteSettings = query.data ?? fallbackSettings;
  return { ...query, settings, isFallback: !query.data };
}
