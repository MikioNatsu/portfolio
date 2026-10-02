import { memo, useMemo } from 'react';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { cn, seededRandom } from '@/lib/utils';

/* -------------------------------------------------------------------------- */
/* Sakura petals                                                               */
/* -------------------------------------------------------------------------- */

interface Petal {
  left: number;
  delay: number;
  duration: number;
  scale: number;
  opacity: number;
  hue: string;
  blur: number;
}

function Petal({ petal }: { petal: Petal }) {
  return (
    <span
      className="absolute top-0 block"
      style={{
        left: `${petal.left}%`,
        animation: `drift ${petal.duration}s linear ${petal.delay}s infinite`,
        transform: `scale(${petal.scale})`,
        opacity: petal.opacity,
        filter: petal.blur ? `blur(${petal.blur}px)` : undefined,
        willChange: 'transform, opacity',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        <path
          d="M8 0C11 3 16 5 16 9a5 5 0 0 1-8 4A5 5 0 0 1 0 9c0-4 5-6 8-9Z"
          fill={petal.hue}
          fillOpacity="0.85"
        />
      </svg>
    </span>
  );
}

/**
 * Slow drifting sakura petals.
 * Pure CSS animation (compositor-only), capped count, disabled for reduced motion.
 */
export const SakuraPetals = memo(function SakuraPetals({
  count = 14,
  className,
}: {
  count?: number;
  className?: string;
}) {
  const reduceMotion = usePrefersReducedMotion();
  const petals = useMemo<Petal[]>(() => {
    const palette = ['#F0ABFC', '#EC4899', '#C084FC', '#FBCFE8'];
    return Array.from({ length: count }, (_, index) => {
      const seed = index + 1;
      return {
        left: seededRandom(seed) * 100,
        delay: seededRandom(seed + 5) * 18,
        duration: 16 + seededRandom(seed + 9) * 14,
        scale: 0.5 + seededRandom(seed + 13) * 0.9,
        opacity: 0.25 + seededRandom(seed + 17) * 0.4,
        hue: palette[Math.floor(seededRandom(seed + 21) * palette.length)] ?? '#F0ABFC',
        blur: seededRandom(seed + 29) > 0.7 ? 1.5 : 0,
      };
    });
  }, [count]);

  if (reduceMotion) return null;

  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
    >
      {petals.map((petal, index) => (
        <Petal key={index} petal={petal} />
      ))}
    </div>
  );
});

/* -------------------------------------------------------------------------- */
/* Ambient background layers                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Fixed, page-wide atmosphere: grid, aurora blobs, vignette and film grain.
 * Purely decorative and GPU-friendly.
 */
export const BackgroundLayers = memo(function BackgroundLayers({
  className,
}: {
  className?: string;
}) {
  const reduceMotion = usePrefersReducedMotion();

  return (
    <div aria-hidden="true" className={cn('pointer-events-none fixed inset-0 -z-10', className)}>
      <div className="absolute inset-0 grid-bg opacity-[0.35] mask-radial-soft" />

      <div
        className={cn(
          'absolute -left-[18%] top-[-12%] h-[46rem] w-[46rem] rounded-full blur-[140px]',
          !reduceMotion && 'animate-float-slow',
        )}
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.34), transparent 68%)' }}
      />
      <div
        className={cn(
          'absolute -right-[14%] top-[26%] h-[38rem] w-[38rem] rounded-full blur-[150px]',
          !reduceMotion && 'animate-float',
        )}
        style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.24), transparent 70%)' }}
      />
      <div
        className={cn(
          'absolute bottom-[-16%] left-[32%] h-[34rem] w-[34rem] rounded-full blur-[150px]',
          !reduceMotion && 'animate-float-slow',
        )}
        style={{ background: 'radial-gradient(circle, rgba(96,165,250,0.2), transparent 70%)' }}
      />

      {!reduceMotion && (
        <div className="absolute inset-x-0 top-0 h-px overflow-hidden">
          <div className="h-px w-1/3 animate-scanline bg-gradient-to-r from-transparent via-accent-violet/60 to-transparent" />
        </div>
      )}

      <div className="absolute inset-0 noise" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_38%,rgba(4,4,11,0.72)_100%)]" />
    </div>
  );
});
