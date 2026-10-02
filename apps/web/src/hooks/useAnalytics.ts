import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import type { AnalyticsEventName } from '@natsu/types';
import { publicApi } from '@/api/client';
import { getDeviceType, getSessionId, safeReferrer } from '@/lib/utils';

/**
 * Lightweight first-party analytics.
 * No cookies, no personal data — a per-tab session id, the path, the device
 * class and the (domain-only) referrer.
 */
export function track(event: AnalyticsEventName, path?: string, projectId?: string | null): void {
  void publicApi.track({
    event,
    path: path ?? window.location.pathname,
    projectId: projectId ?? null,
    referrer: safeReferrer(),
    sessionId: getSessionId(),
  });
}

/** Fires a `page_view` on every route change. Mount once, inside the router. */
export function usePageViewTracking(): void {
  const location = useLocation();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    const path = `${location.pathname}${location.search}`;
    if (lastPath.current === path) return;
    lastPath.current = path;

    const timer = window.setTimeout(() => {
      void publicApi.track({
        event: 'page_view',
        path,
        deviceType: getDeviceType(),
        referrer: safeReferrer(),
        sessionId: getSessionId(),
      });
    }, 700);

    return () => window.clearTimeout(timer);
  }, [location.pathname, location.search]);
}

/** Records a project detail view once per mount. */
export function useProjectViewTracking(projectId?: string, slug?: string): void {
  useEffect(() => {
    if (!projectId) return;
    const timer = window.setTimeout(() => {
      void publicApi.track({
        event: 'project_view',
        path: `/projects/${slug ?? ''}`,
        projectId,
        deviceType: getDeviceType(),
        sessionId: getSessionId(),
      });
    }, 900);
    return () => window.clearTimeout(timer);
  }, [projectId, slug]);
}

/** Records outbound social clicks (also useful for the admin analytics page). */
export function trackSocialClick(label: string, url: string): void {
  void publicApi.track({
    event: 'social_click',
    path: `${window.location.pathname}#${label.toLowerCase()}:${url}`,
    deviceType: getDeviceType(),
    sessionId: getSessionId(),
  });
}
