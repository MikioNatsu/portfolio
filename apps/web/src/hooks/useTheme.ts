import { useCallback, useEffect, useState } from 'react';
import { STORAGE_KEYS } from '@/lib/constants';

export const THEMES = ['midnight', 'sakura'] as const;
export type Theme = (typeof THEMES)[number];

const DEFAULT_THEME: Theme = 'midnight';

function readStoredTheme(): Theme {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEYS.theme);
    return THEMES.includes(stored as Theme) ? (stored as Theme) : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

/**
 * Two ambient palettes: `midnight` (deep violet Tokyo night) and `sakura`
 * (warmer, pink-shifted dusk). Both stay dark so contrast never regresses —
 * only the atmosphere, glows and accents move.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readStoredTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    try {
      window.localStorage.setItem(STORAGE_KEYS.theme, theme);
    } catch {
      /* ignore quota / privacy mode */
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'midnight' ? 'sakura' : 'midnight'));
  }, []);

  return { theme, setTheme, toggleTheme };
}
