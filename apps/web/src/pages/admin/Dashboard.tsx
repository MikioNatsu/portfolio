import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  Eye,
  FilePen,
  FolderKanban,
  Layers,
  Mail,
  MessageSquare,
  Plus,
  Route,
  Sparkles,
  Star,
} from 'lucide-react';
import { adminApi } from '@/api/client';
import { ActivityList } from '@/components/admin/ActivityList';
import { ListRow, Panel } from '@/components/admin/Card';
import { AreaChart } from '@/components/admin/Charts';
import { MessageRow } from '@/components/admin/MessageRow';
import { PageHeader } from '@/components/admin/PageHeader';
import { Skeleton, TilesSkeleton } from '@/components/admin/Skeleton';
import { StatTile } from '@/components/admin/StatTile';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { useAuth } from '@/hooks/useAuth';
import { QUERY_KEYS } from '@/lib/constants';

function greeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 5) return 'Good evening';
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

const todayLabel = () =>
  new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(
    new Date(),
  );

function PanelLink({ to, children }: { to: string; children: string }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-0.5 text-[13px] font-medium text-sys-accent transition-opacity hover:opacity-75"
    >
      {children}
      <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
    </Link>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const overview = useQuery({
    queryKey: QUERY_KEYS.adminOverview,
    queryFn: () => adminApi.overview(),
  });
  const traffic = useQuery({
    queryKey: QUERY_KEYS.adminAnalytics('30d'),
    queryFn: () => adminApi.analytics('30d'),
  });

  const firstName = user?.name?.split(/\s+/)[0];

  const header = (
    <PageHeader
      eyebrow={todayLabel()}
      title={firstName ? `${greeting()}, ${firstName}` : greeting()}
      actions={
        <>
          <Button to="/admin/messages" variant="secondary" size="sm">
            Messages
          </Button>
          <Button to="/admin/projects/new" size="sm" iconLeft={<Plus className="h-4 w-4" />}>
            New project
          </Button>
        </>
      }
    />
  );

  if (overview.isLoading) {
    return (
      <div className="space-y-6">
        {header}
        <TilesSkeleton />
        <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
          <Skeleton className="h-72 rounded-[18px]" />
          <Skeleton className="h-72 rounded-[18px]" />
        </div>
      </div>
    );
  }

  if (overview.isError || !overview.data) {
    return (
      <div className="space-y-6">
        {header}
        <Panel>
          <ErrorState
            title="Couldn’t load the overview"
            description="The API didn’t respond. Check that the backend is running."
            onRetry={() => overview.refetch()}
          />
        </Panel>
      </div>
    );
  }

  const { projects, messages, views, experience, skills, recentMessages, recentEvents } =
    overview.data;

  return (
    <div className="space-y-6">
      {header}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Projects"
          value={projects.total}
          hint={`${projects.published} live · ${projects.drafts} drafts`}
          icon={FolderKanban}
          tone="orange"
          to="/admin/projects"
        />
        <StatTile
          label="Unread messages"
          value={messages.unread}
          hint={`${messages.total} in total`}
          icon={Mail}
          tone="blue"
          to="/admin/messages"
        />
        <StatTile
          label="Views"
          value={views.total}
          hint={`${views.last7Days} in the last 7 days`}
          icon={Eye}
          tone="green"
          to="/admin/analytics"
        />
        <StatTile
          label="Content entries"
          value={experience + skills}
          hint={`${experience} experience · ${skills} skills`}
          icon={Layers}
          tone="teal"
          to="/admin/experience"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <div className="min-w-0 space-y-5">
          <Panel
            title="Views"
            description="Last 30 days"
            actions={<PanelLink to="/admin/analytics">Analytics</PanelLink>}
          >
            {traffic.isLoading ? (
              <Skeleton className="h-[220px] rounded-xl" />
            ) : traffic.data ? (
              <AreaChart data={traffic.data.series} tone="green" />
            ) : (
              <p className="py-10 text-center text-[13px] text-sys-secondary">
                Traffic data is unavailable right now.
              </p>
            )}
          </Panel>

          <Panel
            title="Recent messages"
            actions={<PanelLink to="/admin/messages">All messages</PanelLink>}
            padded={false}
          >
            {recentMessages.length === 0 ? (
              <EmptyState
                title="No messages yet"
                description="Submissions from the contact form will appear here."
                icon={<MessageSquare className="h-5 w-5" />}
              />
            ) : (
              <ul className="space-y-0.5 px-2.5 pb-2.5">
                {recentMessages.map((message) => (
                  <li key={message.id}>
                    <MessageRow
                      message={message}
                      to="/admin/messages"
                      linkState={{ messageId: message.id }}
                    />
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="min-w-0 space-y-5">
          <Panel title="Library" padded={false}>
            <div className="pb-1.5">
              <ListRow
                icon={Star}
                tone="yellow"
                title="Featured projects"
                detail={projects.featured}
                to="/admin/projects"
              />
              <ListRow
                icon={FilePen}
                tone="orange"
                title="Draft projects"
                detail={projects.drafts}
                to="/admin/projects"
              />
              <ListRow
                icon={Route}
                tone="teal"
                title="Experience entries"
                detail={experience}
                to="/admin/experience"
              />
              <ListRow
                icon={Sparkles}
                tone="pink"
                title="Skills"
                detail={skills}
                to="/admin/skills"
              />
            </div>
          </Panel>

          <Panel
            title="Recent activity"
            description="First-party analytics — no personal data."
            padded={false}
          >
            <div className="pb-1.5">
              <ActivityList
                events={recentEvents.slice(0, 8)}
                emptyLabel="Events appear once visitors browse the public site."
              />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
