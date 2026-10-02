import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { AppearanceContext, useAppearanceState } from '@/hooks/useAppearance';
import { SkinContext } from '@/components/ui/skin';
import { LoadingState } from '@/components/ui/States';
import { Toaster } from './Toaster';

/**
 * Everything under `/admin` (including the login screen): the light / dark
 * appearance, the Apple-style "system" skin for shared primitives, toasts,
 * and motion that honours the user's reduced-motion preference.
 */
export function AdminRoot() {
  const appearance = useAppearanceState();

  return (
    <AppearanceContext.Provider value={appearance}>
      <SkinContext.Provider value="system">
        <MotionConfig reducedMotion="user">
          <Toaster>
            <Suspense fallback={<LoadingState label="Loading" className="min-h-dvh" />}>
              <Outlet />
            </Suspense>
          </Toaster>
        </MotionConfig>
      </SkinContext.Provider>
    </AppearanceContext.Provider>
  );
}
