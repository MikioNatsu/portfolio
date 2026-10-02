import { Suspense, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';
import { pageTransition } from '@/animations/variants';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { usePageViewTracking } from '@/hooks/useAnalytics';
import { LoadingState } from '@/components/ui/States';

/** Scrolls to top on navigation while keeping in-page anchors working. */
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname, hash]);

  return null;
}

/**
 * Route outlet wrapper: animates page entry, resets scroll and records the
 * page view for first-party analytics.
 */
export function PageTransition() {
  const location = useLocation();
  const reduceMotion = usePrefersReducedMotion();
  usePageViewTracking();

  const content = (
    <Suspense fallback={<LoadingState label="Loading" className="min-h-[60vh]" />}>
      <Outlet />
    </Suspense>
  );

  if (reduceMotion) {
    return (
      <>
        <ScrollToTop />
        {content}
      </>
    );
  }

  return (
    <>
      <ScrollToTop />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          variants={pageTransition}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {content}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
