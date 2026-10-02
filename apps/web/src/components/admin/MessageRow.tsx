import { Link } from 'react-router-dom';
import type { ContactMessage } from '@natsu/types';
import { cn, formatDate, formatRelative, initials } from '@/lib/utils';

/**
 * Mail-style message row: unread dot, sender, time, subject and preview.
 * Renders as a link (`to`) or a selectable button (`onSelect`).
 */
export function MessageRow({
  message,
  selected,
  onSelect,
  to,
  linkState,
}: {
  message: ContactMessage;
  selected?: boolean;
  onSelect?: () => void;
  to?: string;
  linkState?: unknown;
}) {
  const unread = !message.read;

  const body = (
    <>
      <span className="flex w-2.5 shrink-0 justify-center pt-[0.6rem]">
        {unread && (
          <span
            className={cn('h-2 w-2 rounded-full', selected ? 'bg-white' : 'bg-sys-accent')}
            aria-hidden="true"
          />
        )}
      </span>
      <span
        className={cn(
          'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold',
          selected ? 'bg-white/20 text-white' : 'bg-sys-fill-3 text-sys-secondary',
        )}
        aria-hidden="true"
      >
        {initials(message.name)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-3">
          <span className={cn('truncate text-sm', unread ? 'font-semibold' : 'font-medium')}>
            {message.name}
          </span>
          <time
            dateTime={message.createdAt}
            title={formatDate(message.createdAt)}
            className={cn(
              'shrink-0 text-[12px] tabular-nums',
              selected ? 'text-white/75' : 'text-sys-secondary',
            )}
          >
            {formatRelative(message.createdAt)}
          </time>
        </span>
        <span className={cn('block truncate text-[13px]', !selected && 'text-sys-label')}>
          {message.subject}
        </span>
        <span
          className={cn(
            'line-clamp-2 text-[13px] leading-5',
            selected ? 'text-white/75' : 'text-sys-secondary',
          )}
        >
          {message.message}
        </span>
      </span>
      {unread && <span className="sr-only">Unread.</span>}
    </>
  );

  const classes = cn(
    'flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2.5 text-left transition-colors duration-150',
    selected ? 'bg-sys-accent-fill text-white' : 'text-sys-label hover:bg-sys-fill-4',
  );

  if (to) {
    return (
      <Link to={to} state={linkState} className={classes}>
        {body}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={selected || undefined}
      className={classes}
    >
      {body}
    </button>
  );
}
