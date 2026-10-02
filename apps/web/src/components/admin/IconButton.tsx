import { forwardRef, type ButtonHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Action } from '@/components/ui/Action';

const TONES = {
  default: 'text-sys-secondary hover:bg-sys-fill-3 hover:text-sys-label',
  accent: 'text-sys-accent hover:bg-sys-accent/10',
  danger: 'text-sys-secondary hover:bg-sys-red/[0.12] hover:text-sys-red-ink',
} as const;

const SIZES = {
  sm: { box: 'h-8 w-8', icon: 'h-4 w-4' },
  md: { box: 'h-9 w-9', icon: 'h-[18px] w-[18px]' },
} as const;

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible name — also shown as the native tooltip. */
  label: string;
  icon: LucideIcon;
  tone?: keyof typeof TONES;
  size?: keyof typeof SIZES;
  to?: string;
  href?: string;
  /** Visually marks a toggled-on state (e.g. "featured"). */
  active?: boolean;
  iconClassName?: string;
}

/** Round, borderless toolbar-style icon button. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    label,
    icon: Icon,
    tone = 'default',
    size = 'sm',
    active,
    className,
    iconClassName,
    type = 'button',
    ...rest
  },
  ref,
) {
  const dimensions = SIZES[size];
  return (
    <Action
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full transition-[background-color,color,transform] duration-200 ease-out active:scale-90 disabled:pointer-events-none disabled:opacity-35',
        dimensions.box,
        TONES[tone],
        className,
      )}
      {...rest}
    >
      <Icon
        className={cn(dimensions.icon, active && 'fill-current', iconClassName)}
        strokeWidth={1.9}
      />
    </Action>
  );
});
