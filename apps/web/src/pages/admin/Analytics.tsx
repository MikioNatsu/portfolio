import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Eye, FolderOpen, Mail, MousePointerClick } from 'lucide-react';
import { adminApi } from '@/api/client';
import { ActivityList } from '@/components/admin/ActivityList';
import { Panel } from '@/components/admin/Card';
import { AreaChart, BarBreakdown } from '@/components/admin/Charts';
import { PageHeader } from '@/components/admin/PageHeader';
import { SegmentedControl } from '@/components/admin/SegmentedControl';
import { Skeleton, TilesSkeleton } from '@/components/admin/Skeleton';
import { StatTile } from '@/components/admin/StatTile';
import { ErrorState } from '@/components/ui/States';
import { QUERY_KEYS } from '@/lib/constants';
import { cn } from '@/lib/utils';

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
    // Keep the current numbers on screen while another range loads.
    placeholderData: keepPreviousData,
  });

  const header = (
    <PageHeader
      title="Analytics"
      description="First-party, cookie-free measurement of views and submissions."
      actions={
        <SegmentedControl label="Date range" options={RANGES} value={range} onChange={setRange} />
      }
    />
  );

  if (analytics.isLoading) {
    return (
      <div className="space-y-6">
        {header}
        <TilesSkeleton />
        <Skeleton className="h-80 rounded-[18px]" />
      </div>
    );
  }

  if (analytics.isError || !analytics.data) {
    return (
      <div className="space-y-6">
        {header}
        <Panel>
          <ErrorState
            title="Couldn’t load analytics"
            description="The API didn’t respond with analytics data."
            onRetry={() => analytics.refetch()}
          />
        </Panel>
      </div>
    );
  }

  const { totals, series, topProjects, topPaths, devices, referrers, recentEvents } =
    analytics.data;
  const refreshing = analytics.isPlaceholderData && analytics.isFetching;
  const rangeLabel = RANGES.find((option) => option.value === range)?.label ?? range;

  return (
    <div className="space-y-6">
      {header}

      <div
        className={cn('space-y-6 transition-opacity duration-300', refreshing && 'opacity-60')}
        aria-busy={refreshing}
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile label="Page views" value={totals.views} icon={Eye} tone="green" />
          <StatTile
            label="Project views"
            value={totals.projectViews}
            icon={FolderOpen}
            tone="orange"
          />
          <StatTile
            label="Messages"
            value={totals.messages}
            hint={`${totals.unreadMessages} unread`}
            icon={Mail}
            tone="blue"
            to="/admin/messages"
          />
          <StatTile
            label="Tracked events"
            value={totals.events}
            icon={MousePointerClick}
            tone="indigo"
          />
        </div>

        <Panel title="Views over time" description={`Last ${rangeLabel}`}>
          <AreaChart data={series} tone="green" height={240} />
        </Panel>

        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          <Panel title="Top projects">
            <BarBreakdown
              items={topProjects.map((project) => ({ label: project.title, value: project.views }))}
              tone="orange"
              emptyLabel="No project views recorded yet."
            />
          </Panel>
          <Panel title="Top pages">
            <BarBreakdown items={topPaths} tone="accent" />
          </Panel>
          <Panel title="Devices">
            <BarBreakdown items={devices} tone="blue" />
          </Panel>
        </div>

        <div className="grid items-start gap-5 xl:grid-cols-[1fr_1.4fr]">
          <Panel title="Referrers" description="Domain only — full URLs are never stored.">
            <BarBreakdown items={referrers} tone="pink" emptyLabel="All traffic is direct." />
          </Panel>
          <Panel title="Recent events" padded={false}>
            <div className="pb-1.5">
              <ActivityList events={recentEvents} emptyLabel="No events recorded in this range." />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
