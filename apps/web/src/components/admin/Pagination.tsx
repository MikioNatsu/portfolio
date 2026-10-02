import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IconButton } from './IconButton';

/** Compact "‹ 2 of 5 ›" pager with a total count. */
export function Pagination({
  page,
  totalPages,
  total,
  noun = 'items',
  onPageChange,
  className,
}: {
  page: number;
  totalPages: number;
  total: number;
  noun?: string;
  onPageChange: (page: number) => void;
  className?: string;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        'flex items-center justify-between gap-4 border-t border-sys-separator px-4 py-2.5',
        className,
      )}
    >
      <p className="text-[13px] text-sys-secondary">
        {total} {noun}
      </p>
      <div className="flex items-center gap-1">
        <IconButton
          label="Previous page"
          icon={ChevronLeft}
          disabled={page <= 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
        />
        <span className="min-w-[4.5rem] text-center text-[13px] tabular-nums text-sys-label">
          {page} of {totalPages}
        </span>
        <IconButton
          label="Next page"
          icon={ChevronRight}
          disabled={page >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        />
      </div>
    </nav>
  );
}
