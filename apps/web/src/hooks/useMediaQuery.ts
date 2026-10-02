import { useCallback, useEffect, useRef, useState } from 'react';

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

/**
 * Live content width of an element (ResizeObserver); `fallback` until measured.
 * Uses a callback ref so it keeps tracking if the element is swapped out.
 */
export function useElementWidth<T extends HTMLElement = HTMLDivElement>(fallback: number) {
  const [width, setWidth] = useState(fallback);
  const observer = useRef<ResizeObserver | null>(null);

  const ref = useCallback((node: T | null) => {
    observer.current?.disconnect();
    observer.current = null;
    if (!node || typeof ResizeObserver === 'undefined') return;
    observer.current = new ResizeObserver(([entry]) => {
      const next = Math.round(entry?.contentRect.width ?? 0);
      if (next > 0) setWidth(next);
    });
    observer.current.observe(node);
  }, []);

  // No unmount effect: React calls the callback ref with `null` on unmount,
  // which disconnects above. (An effect cleanup would also fire during
  // StrictMode's simulated remount and kill the observer for good.)
  return { ref, width };
}
