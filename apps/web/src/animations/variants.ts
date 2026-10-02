import type { Variants } from 'framer-motion';

export const EASE_CINEMATIC = [0.22, 1, 0.36, 1] as const;
export const EASE_SWIFT = [0.4, 0, 0.2, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 26 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: EASE_CINEMATIC },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.9, ease: EASE_CINEMATIC } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: EASE_CINEMATIC } },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -36 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: EASE_CINEMATIC } },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 36 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: EASE_CINEMATIC } },
};

/** Curtain reveal used for large imagery. */
export const maskReveal: Variants = {
  hidden: { opacity: 0, clipPath: 'inset(12% 8% 12% 8% round 28px)', scale: 1.04 },
  visible: {
    opacity: 1,
    clipPath: 'inset(0% 0% 0% 0% round 28px)',
    scale: 1,
    transition: { duration: 1.1, ease: EASE_CINEMATIC },
  },
};

export const staggerContainer = (stagger = 0.09, delayChildren = 0.05): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_CINEMATIC } },
};

/** Page-level enter/exit used by the route transition wrapper. */
export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_CINEMATIC } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.28, ease: EASE_SWIFT } },
};

export const menuOverlay: Variants = {
  hidden: { opacity: 0, clipPath: 'circle(0% at 92% 6%)' },
  visible: {
    opacity: 1,
    clipPath: 'circle(145% at 92% 6%)',
    transition: { duration: 0.7, ease: EASE_CINEMATIC },
  },
  exit: {
    opacity: 0,
    clipPath: 'circle(0% at 92% 6%)',
    transition: { duration: 0.45, ease: EASE_SWIFT },
  },
};

export const menuItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 0.16 + index * 0.06, ease: EASE_CINEMATIC },
  }),
};

export const viewportOnce = { once: true, margin: '-80px' } as const;
