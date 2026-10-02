import { Eye, FolderOpen, Mail, MousePointerClick, type LucideIcon } from 'lucide-react';
import type { AnalyticsSummary } from '@natsu/types';
import { formatRelative } from '@/lib/utils';
import { IconTile } from './IconTile';
import type { SysTone } from './tones';

type AnalyticsEvent = AnalyticsSummary['recentEvents'][number];

const EVENT_STYLES: Record<string, { label: string; icon: LucideIcon; tone: SysTone }> = {
  page_view: { label: 'Page view', icon: Eye, tone: 'green' },
  project_view: { label: 'Project view', icon: FolderOpen, tone: 'orange' },
  project_click: { label: 'Project click', icon: MousePointerClick, tone: 'indigo' },
  contact_submitted: { label: 'Message sent', icon: Mail, tone: 'blue' },
};

function describe(event: string) {
  return (
    EVENT_STYLES[event] ?? {
      label: event.replace(/_/g, ' ').replace(/^\w/, (char) => char.toUpperCase()),
      icon: MousePointerClick,
      tone: 'gray' as const,
    }
  );
}

/** Recent first-party analytics events as compact rows. */
export function ActivityList({
  events,
  emptyLabel = 'No activity recorded yet.',
}: {
  events: AnalyticsEvent[];
  emptyLabel?: string;
}) {
  if (events.length === 0) {
    return <p className="px-5 pb-5 text-[13px] text-sys-secondary">{emptyLabel}</p>;
  }

  return (
    <ul>
      {events.map((event) => {
        const style = describe(event.event);
        return (
          <li
            key={event.id}
            className="relative flex items-center gap-3 px-5 py-2.5 after:absolute after:bottom-0 after:left-[3.75rem] after:right-0 after:h-px after:bg-sys-separator last:after:hidden"
          >
            <IconTile icon={style.icon} tone={style.tone} size="sm" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm text-sys-label">{event.path}</span>
              <span className="block truncate text-[12px] text-sys-secondary">
                {style.label}
                {event.deviceType ? ` · ${event.deviceType}` : ''}
                {event.referrer ? ` · via ${event.referrer}` : ''}
              </span>
            </span>
            <time
              dateTime={event.createdAt}
              className="shrink-0 text-[12px] tabular-nums text-sys-secondary"
            >
              {formatRelative(event.createdAt)}
            </time>
          </li>
        );
      })}
    </ul>
  );
}
