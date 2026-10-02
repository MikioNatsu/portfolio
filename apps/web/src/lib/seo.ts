import type { Profile, Project, SiteSettings } from '@natsu/types';
import { env, siteUrl } from '@/lib/env';

/** JSON-LD builders. Kept in one place so every page emits consistent schema. */

export function personSchema(profile: Profile) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.role,
    description: profile.bio,
    url: siteUrl('/'),
    ...(profile.email ? { email: profile.email } : {}),
    ...(profile.location
      ? { address: { '@type': 'PostalAddress', addressLocality: profile.location } }
      : {}),
    ...(profile.avatarUrl ? { image: profile.avatarUrl } : {}),
    sameAs: profile.socialLinks.map((link) => link.url).filter(Boolean),
    knowsAbout: [
      'React',
      'TypeScript',
      'Tailwind CSS',
      'Node.js',
      'Anime platforms',
      'AI assistants',
    ],
  };
}

export function websiteSchema(settings: SiteSettings) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Natsu',
    url: siteUrl('/'),
    description: settings.siteDescription,
  };
}

export function creativeWorkSchema(project: Project) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    headline: project.summary,
    description: project.description,
    url: siteUrl(`/projects/${project.slug}`),
    ...(project.coverImage ? { image: project.coverImage } : {}),
    ...(project.year ? { dateCreated: String(project.year) } : {}),
    ...(project.role ? { creator: { '@type': 'Person', name: 'Natsu', role: project.role } } : {}),
    ...(project.liveUrl ? { sameAs: [project.liveUrl] } : {}),
    keywords: project.technologies.map((technology) => technology.name).join(', '),
  };
}

export function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: siteUrl(item.path),
    })),
  };
}

/** True when the deployment actually has a public origin configured. */
export const hasPublicSiteUrl = env.siteUrl.startsWith('http');
