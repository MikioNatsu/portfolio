import { useEffect, useState } from 'react';

/** Subscribe to a CSS media query. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const list = window.matchMedia(query);
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    setMatches(list.matches);
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** Respect the user's motion preference — disables decorative animation. */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/** True for coarse pointers (phones/tablets) — used to skip cursor & parallax. */
export function useIsTouchDevice(): boolean {
  return useMediaQuery('(hover: none), (pointer: coarse)');
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}

export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}

/** Hydration-safe mounted flag for portal / DOM-dependent widgets. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
