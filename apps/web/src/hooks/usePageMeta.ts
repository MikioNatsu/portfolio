import { useEffect } from 'react';
import { siteUrl } from '@/lib/env';

interface PageMeta {
  title: string;
  description?: string;
  image?: string | null;
  type?: 'website' | 'article' | 'profile';
  keywords?: string[];
  /** Emits `<meta name="robots" content="noindex">` — used across /admin. */
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

function upsertMeta(
  selector: string,
  attribute: 'name' | 'property',
  key: string,
  content: string,
) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function upsertLink(rel: string, href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

/**
 * Declarative document head management — no extra dependency needed.
 * Cleans up the JSON-LD script it owns; other tags are simply overwritten.
 */
export function usePageMeta({
  title,
  description,
  image,
  type = 'website',
  keywords,
  noindex,
  jsonLd,
}: PageMeta): void {
  useEffect(() => {
    document.title = title;
    upsertMeta('meta[property="og:title"]', 'property', 'og:title', title);
    upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    upsertMeta('meta[property="og:type"]', 'property', 'og:type', type);

    if (description) {
      upsertMeta('meta[name="description"]', 'name', 'description', description);
      upsertMeta('meta[property="og:description"]', 'property', 'og:description', description);
      upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    }
    if (keywords?.length) {
      upsertMeta('meta[name="keywords"]', 'name', 'keywords', keywords.join(', '));
    }
    if (image) {
      const absolute = image.startsWith('http') ? image : siteUrl(image);
      upsertMeta('meta[property="og:image"]', 'property', 'og:image', absolute);
      upsertMeta('meta[name="twitter:image"]', 'name', 'twitter:image', absolute);
    }
    upsertMeta(
      'meta[name="robots"]',
      'name',
      'robots',
      noindex ? 'noindex, nofollow' : 'index, follow',
    );
  }, [title, description, image, type, keywords, noindex]);

  useEffect(() => {
    const canonical = siteUrl(window.location.pathname);
    upsertLink('canonical', canonical);
    upsertMeta('meta[property="og:url"]', 'property', 'og:url', canonical);
  }, []);

  useEffect(() => {
    if (!jsonLd) return;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.managed = 'natsu';
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
    return () => script.remove();
  }, [jsonLd]);
}
