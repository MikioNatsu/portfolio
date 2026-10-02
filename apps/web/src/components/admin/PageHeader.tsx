import { useRef, type ReactNode } from 'react';
import { useToolbarTitle } from '@/hooks/useToolbarTitle';
import { cn } from '@/lib/utils';

/**
 * Large-title page header. When the title scrolls under the toolbar, the
 * toolbar shows a compact copy — the iOS navigation-bar pattern.
 */
export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  className,
}: {
  title: string;
  description?: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useToolbarTitle(title, headingRef);

  return (
    <header
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6',
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        {eyebrow && <p className="text-[13px] font-medium text-sys-secondary">{eyebrow}</p>}
        <h1
          ref={headingRef}
          className="break-words text-[28px] font-bold leading-[1.15] tracking-[-0.025em] text-sys-label sm:text-[34px]"
        >
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl text-[15px] leading-6 text-sys-secondary">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
