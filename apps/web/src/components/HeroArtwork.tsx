import { memo, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { Sparkle } from '@/components/layout/Logomark';
import { cn } from '@/lib/utils';

/**
 * Hero visual.
 *
 * Image-first: renders the artwork uploaded in *Admin → Profile* inside a
 * stable portrait frame, layered over CSS orbit rings and an ambient glow.
 * When no artwork is configured the frame becomes an intentional gallery
 * placeholder rather than collapsing — so the composition, the floating
 * widgets and the scroll parallax all stay exactly where they were designed
 * to be, with or without an image.
 */

interface HeroArtworkProps {
  imageUrl?: string | null;
  alt?: string;
  name?: string;
  className?: string;
}

export const HeroArtwork = memo(function HeroArtwork({
  imageUrl,
  alt = 'Natsu — artwork',
  name = 'Natsu',
  className,
}: HeroArtworkProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : -60]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, reduceMotion ? 1 : 1.04]);

  return (
    <div
      ref={containerRef}
      className={cn('relative mx-auto aspect-[4/5] w-full max-w-[34rem]', className)}
    >
      {/* Ambient glow behind the subject */}
      <div
        className="pointer-events-none absolute left-1/2 top-[38%] h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[110px]"
        style={{
          background:
            'radial-gradient(circle, rgba(168,85,247,0.5) 0%, rgba(236,72,153,0.26) 42%, transparent 72%)',
        }}
        aria-hidden="true"
      />

      {/* Orbit rings — pure CSS, so they cost nothing to animate */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden="true"
      >
        <span
          className={cn(
            'absolute aspect-square w-[86%] rounded-full border border-dashed border-accent-violet/25',
            !reduceMotion && 'animate-spin-slow',
          )}
        />
        <span className="absolute aspect-square w-[104%] rounded-full border border-accent-pink/10" />
        <span className="absolute aspect-square w-[72%] rounded-full border border-white/[0.05]" />
      </div>

      <motion.div style={{ y, scale }} className="relative h-full w-full">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={alt}
            loading="eager"
            decoding="async"
            className="h-full w-full object-contain drop-shadow-[0_40px_80px_rgba(4,4,11,0.9)]"
          />
        ) : (
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[2rem] border border-white/[0.08] bg-ink-800/40 backdrop-blur-xl">
            <span className="absolute inset-0 grid-bg opacity-[0.35]" aria-hidden="true" />
            <span
              className="absolute inset-0"
              aria-hidden="true"
              style={{
                background:
                  'radial-gradient(120% 80% at 30% 0%, rgba(168,85,247,0.18), transparent 60%), radial-gradient(90% 70% at 80% 100%, rgba(236,72,153,0.14), transparent 62%)',
              }}
            />
            <span
              aria-hidden="true"
              className="absolute -left-3 -top-3 h-16 w-16 rounded-tl-[2rem] border-l border-t border-accent-violet/40"
            />
            <span
              aria-hidden="true"
              className="absolute -bottom-3 -right-3 h-16 w-16 rounded-br-[2rem] border-b border-r border-accent-pink/40"
            />

            <div className="relative flex flex-col items-center gap-3 px-8 text-center">
              <Sparkle size={20} className="text-accent-fuchsia/90" />
              <p className="font-display text-3xl font-semibold tracking-tight text-haze-100">
                {name}
              </p>
              <span className="h-px w-12 bg-gradient-to-r from-transparent via-accent-violet/70 to-transparent" />
              <p className="jp text-2xs text-haze-400">アートワーク</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Ground reflection */}
      <div
        className="pointer-events-none absolute inset-x-8 bottom-2 h-24 rounded-[100%] blur-2xl"
        style={{ background: 'radial-gradient(ellipse, rgba(168,85,247,0.32), transparent 70%)' }}
        aria-hidden="true"
      />
    </div>
  );
});
