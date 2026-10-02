import type { ReactNode } from 'react';
import { TriangleAlert, Inbox, LoaderCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { useSkin } from './skin';

/** Inline spinner block. */
export function LoadingState({
  label = 'Loading…',
  className,
}: {
  label?: string;
  className?: string;
}) {
  const skin = useSkin();

  if (skin === 'system') {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn('flex flex-col items-center justify-center gap-3 py-16', className)}
      >
        <LoaderCircle className="h-5 w-5 animate-spin text-sys-secondary" aria-hidden="true" />
        <p className="text-[13px] text-sys-secondary">{label}</p>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-16 text-haze-300',
        className,
      )}
    >
      <div className="relative flex h-12 w-12 items-center justify-center">
        <span className="absolute inset-0 rounded-full border border-accent-violet/30" />
        <span className="absolute inset-0 animate-spin-slow rounded-full border-t border-accent-violet" />
        <LoaderCircle className="h-4 w-4 animate-spin text-accent-violet" />
      </div>
      <p className="text-xs uppercase tracking-[0.2em] text-haze-400">{label}</p>
    </div>
  );
}

/** Skeleton block for card grids. */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('card-surface overflow-hidden rounded-3xl', 'animate-shimmer', className)}>
      <div className="aspect-[4/3] w-full bg-white/[0.04]" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-20 rounded-full bg-white/[0.06]" />
        <div className="h-5 w-2/3 rounded-full bg-white/[0.06]" />
        <div className="h-3 w-full rounded-full bg-white/[0.04]" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('grid gap-6 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}

const MESSAGE_SKINS = {
  cinematic: {
    title: 'font-display text-lg text-haze-100',
    description: 'max-w-sm text-sm text-haze-400',
    empty:
      'flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center',
    emptyIcon:
      'flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-accent-fuchsia',
    error:
      'flex flex-col items-center justify-center gap-4 rounded-3xl border border-rose-400/20 bg-rose-500/[0.05] px-6 py-14 text-center',
    errorIcon:
      'flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-400/30 bg-rose-500/10 text-rose-200',
  },
  system: {
    title: 'text-[15px] font-semibold text-sys-label',
    description: 'max-w-sm text-[13px] leading-5 text-sys-secondary',
    empty: 'flex flex-col items-center justify-center gap-3 px-6 py-14 text-center',
    emptyIcon:
      'flex h-12 w-12 items-center justify-center rounded-full bg-sys-fill-4 text-sys-secondary',
    error: 'flex flex-col items-center justify-center gap-3 px-6 py-14 text-center',
    errorIcon:
      'flex h-12 w-12 items-center justify-center rounded-full bg-sys-red/[0.12] text-sys-red-ink',
  },
} as const;

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  const classes = MESSAGE_SKINS[useSkin()];

  return (
    <div className={cn(classes.empty, className)}>
      <div className={classes.emptyIcon}>{icon ?? <Inbox className="h-5 w-5" />}</div>
      <div className="space-y-1.5">
        <h3 className={classes.title}>{title}</h3>
        {description && <p className={classes.description}>{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  description,
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  const classes = MESSAGE_SKINS[useSkin()];

  return (
    <div role="alert" className={cn(classes.error, className)}>
      <div className={classes.errorIcon}>
        <TriangleAlert className="h-5 w-5" />
      </div>
      <div className="space-y-1.5">
        <h3 className={classes.title}>{title}</h3>
        {description && <p className={classes.description}>{description}</p>}
      </div>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          iconLeft={<RefreshCw className="h-3.5 w-3.5" />}
        >
          Try again
        </Button>
      )}
    </div>
  );
}
