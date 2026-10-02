import { cn } from '@/lib/utils';

/** Shimmering placeholder block. Respects reduced motion via the global rule. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('sys-skeleton rounded-md', className)} aria-hidden="true" />;
}

/** Varied line lengths so placeholder rows read like real content. */
const LINE_WIDTHS = ['w-2/3', 'w-1/2', 'w-3/4', 'w-2/5', 'w-3/5'] as const;

/** Rows shaped like the admin's list rows (thumbnail + two lines). */
export function ListSkeleton({ rows = 5, className }: { rows?: number; className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('divide-y divide-sys-separator', className)}
    >
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-3 px-4 py-3.5">
          <Skeleton className="h-10 w-10 shrink-0 rounded-[10px]" />
          <div className="flex-1 space-y-2">
            <Skeleton className={cn('h-3.5', LINE_WIDTHS[index % LINE_WIDTHS.length])} />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TilesSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="sys-card space-y-4 p-5">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-8 w-8 rounded-[9px]" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-28" />
        </div>
      ))}
    </div>
  );
}

/** Generic page placeholder used while a lazy admin route loads. */
export function PageSkeleton() {
  return (
    <div role="status" aria-label="Loading page" className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <div className="sys-card">
        <ListSkeleton rows={4} />
      </div>
    </div>
  );
}
