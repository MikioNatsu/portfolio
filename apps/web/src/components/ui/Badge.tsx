import type { ReactNode } from 'react';
import type { ProjectStatus } from '@natsu/types';
import { PROJECT_STATUS_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function Badge({
  children,
  className,
  tone = 'neutral',
}: {
  children: ReactNode;
  className?: string;
  tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
}) {
  const tones = {
    neutral: 'border-white/10 bg-white/[0.05] text-haze-300',
    accent: 'border-accent-violet/35 bg-accent-violet/12 text-accent-fuchsia',
    success: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
    warning: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
    danger: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
  } as const;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-2xs font-medium uppercase tracking-[0.14em]',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-haze-300 backdrop-blur-sm transition-colors duration-300 hover:border-accent-violet/40 hover:text-haze-100',
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Pulsing availability indicator, e.g. "● Available for collaboration". */
export function StatusDot({
  label,
  tone = 'success',
  className,
}: {
  label: string;
  tone?: 'success' | 'accent' | 'muted';
  className?: string;
}) {
  const colors = {
    success: 'bg-emerald-400 shadow-[0_0_12px_2px_rgba(52,211,153,0.6)]',
    accent: 'bg-accent-violet shadow-[0_0_12px_2px_rgba(168,85,247,0.6)]',
    muted: 'bg-haze-400',
  } as const;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 text-2xs font-medium uppercase tracking-[0.18em] text-haze-300',
        className,
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span
          className={cn('absolute inline-flex h-full w-full rounded-full opacity-75', colors[tone])}
          style={{ animation: 'pulseRing 2.6s cubic-bezier(0.24,1,0.32,1) infinite' }}
        />
        <span className={cn('relative inline-flex h-1.5 w-1.5 rounded-full', colors[tone])} />
      </span>
      {label}
    </span>
  );
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const tone = status === 'PUBLISHED' ? 'success' : status === 'DRAFT' ? 'warning' : 'neutral';
  return (
    <Badge tone={tone} className="backdrop-blur-md">
      <span
        className={cn(
          'h-1 w-1 rounded-full',
          status === 'PUBLISHED'
            ? 'bg-emerald-300'
            : status === 'DRAFT'
              ? 'bg-amber-300'
              : 'bg-haze-400',
        )}
      />
      {PROJECT_STATUS_LABELS[status]}
    </Badge>
  );
}
