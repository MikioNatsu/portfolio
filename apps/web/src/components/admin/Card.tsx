import type { ReactNode } from 'react';
import { ChevronRight, CircleAlert, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Action } from '@/components/ui/Action';
import { IconTile } from './IconTile';
import type { SysTone } from './tones';

/** Grouped content card — the admin's basic surface. */
export function Panel({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
  padded = true,
  as: Tag = 'section',
}: {
  title?: string;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  /** Turn off body padding for edge-to-edge lists. */
  padded?: boolean;
  as?: 'section' | 'div';
}) {
  const hasHeader = Boolean(title || actions);

  return (
    <Tag className={cn('sys-card overflow-hidden', className)}>
      {hasHeader && (
        <header className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2 px-5 pb-3 pt-4">
          <div className="min-w-0 space-y-0.5">
            {title && (
              <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-sys-label">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-[13px] leading-5 text-sys-secondary">{description}</p>
            )}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={cn(padded && (hasHeader ? 'px-5 pb-5' : 'p-5'), bodyClassName)}>
        {children}
      </div>
    </Tag>
  );
}

/** Small uppercase-free caption above a group, like iOS grouped list headers. */
export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={cn('px-1 text-[13px] font-semibold text-sys-secondary', className)}>
      {children}
    </h2>
  );
}

/**
 * iOS Settings-style row: icon tile, title, optional detail and a disclosure
 * chevron when it navigates. Separators are inset to start after the icon.
 */
export function ListRow({
  icon,
  tone = 'gray',
  title,
  subtitle,
  detail,
  to,
  href,
  onClick,
  chevron,
  className,
}: {
  icon?: LucideIcon;
  tone?: SysTone;
  title: ReactNode;
  subtitle?: ReactNode;
  detail?: ReactNode;
  to?: string;
  href?: string;
  onClick?: () => void;
  chevron?: boolean;
  className?: string;
}) {
  const interactive = Boolean(to || href || onClick);
  const content = (
    <>
      {icon && <IconTile icon={icon} tone={tone} size="sm" />}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm text-sys-label">{title}</span>
        {subtitle && (
          <span className="block truncate text-[12px] text-sys-secondary">{subtitle}</span>
        )}
      </span>
      {detail !== undefined && (
        <span className="shrink-0 text-sm tabular-nums text-sys-secondary">{detail}</span>
      )}
      {(chevron ?? interactive) && (
        <ChevronRight className="h-4 w-4 shrink-0 text-sys-tertiary" aria-hidden="true" />
      )}
    </>
  );

  const classes = cn(
    'relative flex w-full items-center gap-3 px-4 py-2.5 text-left',
    'after:absolute after:bottom-0 after:right-0 after:h-px after:bg-sys-separator last:after:hidden',
    icon ? 'after:left-[3.25rem]' : 'after:left-4',
    interactive && 'transition-colors duration-150 hover:bg-sys-fill-4 active:bg-sys-fill-3',
    className,
  );

  if (!interactive) return <div className={classes}>{content}</div>;

  return (
    <Action to={to} href={href} onClick={onClick} type="button" className={classes}>
      {content}
    </Action>
  );
}

/** Inline banner for form-level errors. */
export function InlineAlert({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-2.5 rounded-xl bg-sys-red/[0.1] px-4 py-3 text-sm text-sys-red-ink',
        className,
      )}
    >
      <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}
