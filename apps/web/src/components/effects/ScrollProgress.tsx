import { motion, useScroll, useSpring } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';

/** Thin cinematic reading-progress bar pinned to the top of the viewport. */
export function ScrollProgress() {
  const reduceMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, restDelta: 0.001 });

  if (reduceMotion) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[100] h-px origin-left bg-gradient-to-r from-accent-purple via-accent-pink to-accent-blue"
      style={{ scaleX }}
    />
  );
}
