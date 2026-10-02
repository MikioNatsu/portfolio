import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Eye, FolderKanban, Mail, MousePointerClick } from 'lucide-react';
import { adminApi } from '@/api/client';
import { QUERY_KEYS } from '@/lib/constants';
import { AdminPageHeader, Panel, StatTile, Table, Td, Th } from '@/components/admin/AdminUI';
import { AreaChart, BarBreakdown } from '@/components/admin/Charts';
import { ErrorState, LoadingState } from '@/components/ui/States';
import { formatRelative } from '@/lib/utils';

const RANGES = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
] as const;

type Range = (typeof RANGES)[number]['value'];

export default function AdminAnalytics() {
  const [range, setRange] = useState<Range>('30d');

  const analytics = useQuery({
    queryKey: QUERY_KEYS.adminAnalytics(range),
    queryFn: () => adminApi.analytics(range),
  });

  if (analytics.isLoading) return <LoadingState label="Loading analytics" />;

  if (analytics.isError || !analytics.data) {
    return (
      <ErrorState
        title="Could not load analytics"
        description="The API did not respond with analytics data."
        onRetry={() => analytics.refetch()}
      />
    );
  }

  const { totals, series, topProjects, topPaths, devices, referrers, recentEvents } =
    analytics.data;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Analytics"
        description="First-party, cookie-free measurement: page views, project views and submissions."
        actions={
          <div className="flex gap-2">
            {RANGES.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setRange(option.value)}
                className={
                  range === option.value
                    ? 'rounded-full border border-accent-violet/45 bg-accent-violet/12 px-3.5 py-2 text-xs text-white'
                    : 'rounded-full border border-white/10 px-3.5 py-2 text-xs text-haze-400 transition-colors hover:text-haze-100'
                }
              >
                {option.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Page views" value={totals.views} icon={<Eye className="h-4 w-4" />} />
        <StatTile
          label="Project views"
          value={totals.projectViews}
          icon={<FolderKanban className="h-4 w-4" />}
        />
        <StatTile
          label="Contact submissions"
          value={totals.messages}
          hint={`${totals.unreadMessages} unread`}
          tone={totals.unreadMessages > 0 ? 'accent' : 'default'}
          icon={<Mail className="h-4 w-4" />}
        />
        <StatTile
          label="Tracked events"
          value={totals.events}
          icon={<MousePointerClick className="h-4 w-4" />}
        />
      </div>

      <Panel title="Views over time" description={`Last ${range.replace('d', ' days')}`}>
        <AreaChart data={series} />
      </Panel>

      <div className="grid gap-5 xl:grid-cols-3">
        <Panel title="Top projects">
          <BarBreakdown
            items={topProjects.map((project) => ({ label: project.title, value: project.views }))}
            accent="#EC4899"
            emptyLabel="No project views recorded yet."
          />
        </Panel>
        <Panel title="Top pages">
          <BarBreakdown items={topPaths} accent="#A855F7" />
        </Panel>
        <Panel title="Devices">
          <BarBreakdown items={devices} accent="#60A5FA" />
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1.3fr]">
        <Panel title="Referrers" description="Domain only — full URLs are never stored.">
          <BarBreakdown items={referrers} accent="#F0ABFC" emptyLabel="All traffic is direct." />
        </Panel>

        <Panel title="Recent events">
          <Table>
            <thead>
              <tr>
                <Th>Event</Th>
                <Th>Path</Th>
                <Th>Device</Th>
                <Th className="text-right">When</Th>
              </tr>
            </thead>
            <tbody>
              {recentEvents.map((event) => (
                <tr key={event.id} className="transition-colors hover:bg-white/[0.02]">
                  <Td className="text-xs uppercase tracking-[0.12em] text-haze-300">
                    {event.event}
                  </Td>
                  <Td className="max-w-[14rem] truncate text-xs text-haze-400">{event.path}</Td>
                  <Td className="text-xs text-haze-400">{event.deviceType ?? '—'}</Td>
                  <Td className="whitespace-nowrap text-right text-2xs text-haze-400">
                    {formatRelative(event.createdAt)}
                  </Td>
                </tr>
              ))}
              {recentEvents.length === 0 && (
                <tr>
                  <Td className="text-sm text-haze-400">No events recorded in this range.</Td>
                </tr>
              )}
            </tbody>
          </Table>
        </Panel>
      </div>
    </div>
  );
}
