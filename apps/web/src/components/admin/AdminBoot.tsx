import { readStoredAppearance, resolveAppearance, useApplyAppearance } from '@/hooks/useAppearance';

/**
 * Suspense fallback while the admin bundle downloads. It already applies the
 * admin appearance so the hand-off to the real shell has no colour flash.
 */
export function AdminBoot() {
  const prefersDark =
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  useApplyAppearance(resolveAppearance(readStoredAppearance(), prefersDark));

  return <div className="min-h-dvh bg-sys-canvas" aria-busy="true" />;
}
