import type { ReactNode } from 'react';
import { ChevronRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Action } from '@/components/ui/Action';
import { AnimatedNumber } from './AnimatedNumber';
import { IconTile } from './IconTile';
import type { SysTone } from './tones';

/** Health-app style summary card: coloured glyph, big counted-up number, hint. */
export function StatTile({
  label,
  value,
  hint,
  icon,
  tone = 'accent',
  to,
}: {
  label: string;
  value: number;
  hint?: ReactNode;
  icon: LucideIcon;
  tone?: SysTone;
  /** Makes the whole tile a link. */
  to?: string;
}) {
  const body = (
    <>
      <div className="flex items-center gap-2.5">
        <IconTile icon={icon} tone={tone} />
        <span className="truncate text-[13px] font-semibold text-sys-secondary">{label}</span>
        {to && (
          <ChevronRight
            className="ml-auto h-4 w-4 shrink-0 text-sys-tertiary transition-transform duration-300 ease-ios group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        )}
      </div>
      <p className="mt-4 text-[32px] font-semibold leading-none tracking-[-0.03em] text-sys-label">
        <AnimatedNumber value={value} />
      </p>
      {hint && <p className="mt-2 truncate text-[13px] text-sys-secondary">{hint}</p>}
    </>
  );

  const classes = 'sys-card group block p-5';

  if (!to) return <div className={classes}>{body}</div>;

  return (
    <Action
      to={to}
      className={cn(
        classes,
        'transition-[transform,box-shadow] duration-300 ease-ios hover:-translate-y-0.5 active:scale-[0.99]',
      )}
    >
      {body}
    </Action>
  );
}
