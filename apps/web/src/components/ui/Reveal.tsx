import { motion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { fadeUp, staggerItem, viewportOnce } from '@/animations/variants';
import { cn } from '@/lib/utils';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  variants?: Variants;
  as?: 'div' | 'section' | 'li' | 'article' | 'span';
}

/**
 * Scroll-triggered reveal. Automatically becomes a plain element when the user
 * prefers reduced motion, so nothing is hidden behind a disabled animation.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  variants = fadeUp,
  as = 'div',
}: RevealProps) {
  const reduceMotion = usePrefersReducedMotion();
  const Component = motion[as];

  if (reduceMotion) {
    const Static = as;
    return <Static className={className}>{children}</Static>;
  }

  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={variants}
      transition={{ delay }}
    >
      {children}
    </Component>
  );
}

/** Staggered list container + item pair. */
export function RevealGroup({
  children,
  className,
  stagger = 0.09,
  delay = 0.05,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}) {
  const reduceMotion = usePrefersReducedMotion();

  if (reduceMotion) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduceMotion = usePrefersReducedMotion();
  if (reduceMotion) return <div className={className}>{children}</div>;

  return (
    <motion.div className={className} variants={staggerItem}>
      {children}
    </motion.div>
  );
}

/** Section wrapper with a consistent vertical rhythm and id anchor. */
export function Section({
  id,
  children,
  className,
  as: Tag = 'section',
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  as?: 'section' | 'div';
}) {
  return (
    <Tag id={id} className={cn('relative py-20 sm:py-24 lg:py-30', className)}>
      {children}
    </Tag>
  );
}
