import { useState } from 'react';
import { cn, seededRandom } from '@/lib/utils';

export interface SmartImageProps {
  src?: string | null;
  alt: string;
  /** Short label rendered in the generated placeholder (project title, initials...). */
  label?: string;
  accent?: string | null;
  className?: string;
  imgClassName?: string;
  /** Tailwind aspect utility, e.g. `aspect-[4/3]`. */
  aspect?: string;
  priority?: boolean;
  sizes?: string;
  objectPosition?: string;
  /** Adds a bottom gradient scrim so text stays readable over artwork. */
  scrim?: boolean;
  seed?: number;
}

/**
 * Image with a designed fallback.
 *
 * Three states, all layout-stable:
 *  1. loading  → shimmer over the placeholder art
 *  2. loaded   → the real image, faded in
 *  3. missing  → generated cover art (no broken icon, no collapsed layout)
 */
export function SmartImage({
  src,
  alt,
  label,
  accent,
  className,
  imgClassName,
  aspect = 'aspect-[4/3]',
  priority = false,
  sizes = '(max-width: 768px) 100vw, 50vw',
  objectPosition = 'center',
  scrim = false,
  seed = 7,
}: SmartImageProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(src ? 'loading' : 'error');
  const tint = accent ?? '#A855F7';
  const text = (label ?? alt ?? 'N').trim();
  const monogram = text.length <= 3 ? text.toUpperCase() : text.slice(0, 2).toUpperCase();

  const shapes = Array.from({ length: 3 }, (_, index) => ({
    cx: 18 + seededRandom(seed + index) * 64,
    cy: 20 + seededRandom(seed + index + 11) * 60,
    r: 10 + seededRandom(seed + index + 23) * 22,
    o: 0.06 + seededRandom(seed + index + 31) * 0.1,
  }));

  return (
    <div className={cn('relative overflow-hidden bg-ink-800/80', aspect, className)}>
      {/* Generated placeholder art — always present underneath */}
      <div
        className={cn(
          'absolute inset-0 transition-opacity duration-700',
          status === 'loaded' ? 'opacity-0' : 'opacity-100',
        )}
        aria-hidden="true"
      >
        <div className="absolute inset-0 grid-bg opacity-[0.35]" />
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(120% 90% at 18% 8%, ${tint}33, transparent 58%), radial-gradient(90% 90% at 88% 92%, #EC489933, transparent 62%), linear-gradient(150deg, #151029 0%, #0A0817 60%, #04040B 100%)`,
          }}
        />
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
        >
          {shapes.map((shape, index) => (
            <circle
              key={index}
              cx={shape.cx}
              cy={shape.cy}
              r={shape.r}
              fill={tint}
              fillOpacity={shape.o}
            />
          ))}
          <path d="M0 78 Q 26 62 50 74 T 100 66 L100 100 L0 100 Z" fill={tint} fillOpacity="0.09" />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-display text-4xl font-bold tracking-tight opacity-25 sm:text-5xl"
            style={{ color: tint }}
          >
            {monogram}
          </span>
        </div>

        {status === 'loading' && (
          <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        )}
      </div>

      {src && (
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          sizes={sizes}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          style={{ objectPosition }}
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-cinematic',
            status === 'loaded' ? 'scale-100 opacity-100 blur-0' : 'scale-105 opacity-0 blur-md',
            imgClassName,
          )}
        />
      )}

      {scrim && (
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/45 to-transparent"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
