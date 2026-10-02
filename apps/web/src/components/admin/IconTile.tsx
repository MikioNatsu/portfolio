import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TONE_BG, type SysTone } from './tones';

const SIZES = {
  sm: { box: 'h-6 w-6 rounded-[7px]', icon: 'h-3.5 w-3.5' },
  md: { box: 'h-8 w-8 rounded-[9px]', icon: 'h-4 w-4' },
  lg: { box: 'h-10 w-10 rounded-[11px]', icon: 'h-5 w-5' },
} as const;

/** iOS Settings-style glyph: a white symbol on a rounded, coloured square. */
export function IconTile({
  icon: Icon,
  tone,
  size = 'md',
  className,
}: {
  icon: LucideIcon;
  tone: SysTone;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const dimensions = SIZES[size];
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center text-white shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.18)]',
        TONE_BG[tone],
        dimensions.box,
        className,
      )}
      aria-hidden="true"
    >
      <Icon className={dimensions.icon} strokeWidth={2.1} />
    </span>
  );
}
