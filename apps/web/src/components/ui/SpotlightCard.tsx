import { useCallback, useState, type PointerEvent, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  /** Accent used for the hover spotlight + border illumination. */
  accent?: string | null;
  as?: 'div' | 'article' | 'li';
}

/**
 * Surface with a pointer-tracking spotlight and border illumination.
 * Kept CSS-variable based so hovering never triggers a React re-render.
 */
export function SpotlightCard({
  children,
  className,
  accent,
  as: Tag = 'div',
}: SpotlightCardProps) {
  const [active, setActive] = useState(false);

  const onPointerMove = useCallback((event: PointerEvent<HTMLElement>) => {
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    element.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
    element.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
  }, []);

  return (
    <Tag
      onPointerMove={onPointerMove}
      onPointerEnter={() => setActive(true)}
      onPointerLeave={() => setActive(false)}
      className={cn(
        'group/spot relative isolate overflow-hidden rounded-3xl border border-white/[0.07] bg-ink-800/60 backdrop-blur-xl transition-all duration-500 ease-cinematic',
        'hover:-translate-y-1.5 hover:border-white/[0.14] hover:shadow-card',
        className,
      )}
      style={{ ['--accent' as string]: accent ?? '#A855F7' }}
    >
      {/* Spotlight follows the pointer */}
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500',
          active && 'opacity-100',
        )}
        style={{
          background:
            'radial-gradient(420px circle at var(--spot-x, 50%) var(--spot-y, 50%), color-mix(in srgb, var(--accent) 22%, transparent), transparent 62%)',
        }}
      />
      {/* Top hairline that lights up on hover */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 z-10 h-px opacity-0 transition-opacity duration-500 group-hover/spot:opacity-100"
        style={{
          background: `linear-gradient(90deg, transparent, ${accent ?? '#A855F7'}, transparent)`,
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </Tag>
  );
}
