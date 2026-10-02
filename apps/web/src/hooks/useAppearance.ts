import { createContext, useCallback, useContext, useLayoutEffect, useState } from 'react';
import { STORAGE_KEYS } from '@/lib/constants';
import { useMediaQuery } from './useMediaQuery';

export const APPEARANCES = ['system', 'light', 'dark'] as const;
export type AppearancePreference = (typeof APPEARANCES)[number];
export type ResolvedAppearance = 'light' | 'dark';

const DEFAULT_PREFERENCE: AppearancePreference = 'system';

/** `system` follows the OS; explicit choices win. */
export function resolveAppearance(
  preference: AppearancePreference,
  prefersDark: boolean,
): ResolvedAppearance {
  if (preference === 'system') return prefersDark ? 'dark' : 'light';
  return preference;
}

export function readStoredAppearance(): AppearancePreference {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEYS.adminAppearance);
    return APPEARANCES.includes(stored as AppearancePreference)
      ? (stored as AppearancePreference)
      : DEFAULT_PREFERENCE;
  } catch {
    return DEFAULT_PREFERENCE;
  }
}

/**
 * Applies the resolved appearance to `<html>` for as long as the caller is
 * mounted. Runs as a layout effect so the first admin paint already uses the
 * right palette — no flash of the public site's colours.
 */
export function useApplyAppearance(resolved: ResolvedAppearance): void {
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.adminAppearance = resolved;

    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const previousThemeColor = meta?.getAttribute('content') ?? null;
    meta?.setAttribute('content', resolved === 'dark' ? '#0A0A0B' : '#F5F5F7');

    return () => {
      delete root.dataset.adminAppearance;
      if (meta && previousThemeColor) meta.setAttribute('content', previousThemeColor);
    };
  }, [resolved]);
}

export interface AppearanceState {
  preference: AppearancePreference;
  resolved: ResolvedAppearance;
  setPreference: (preference: AppearancePreference) => void;
}

/** Owns the admin appearance: stored preference + live OS setting. */
export function useAppearanceState(): AppearanceState {
  const [preference, setPreferenceState] = useState<AppearancePreference>(readStoredAppearance);
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const resolved = resolveAppearance(preference, prefersDark);

  useApplyAppearance(resolved);

  const setPreference = useCallback((next: AppearancePreference) => {
    setPreferenceState(next);
    try {
      window.localStorage.setItem(STORAGE_KEYS.adminAppearance, next);
    } catch {
      /* storage unavailable — the choice lasts for this session only */
    }
  }, []);

  return { preference, resolved, setPreference };
}

export const AppearanceContext = createContext<AppearanceState | null>(null);

export function useAppearance(): AppearanceState {
  const value = useContext(AppearanceContext);
  if (!value) throw new Error('useAppearance must be used inside the admin root.');
  return value;
}
