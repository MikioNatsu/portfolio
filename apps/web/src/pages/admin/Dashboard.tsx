import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Activity,
  Eye,
  FolderKanban,
  Mail,
  MessageSquare,
  Route,
  Sparkles,
  Star,
} from 'lucide-react';
import { adminApi } from '@/api/client';
import { QUERY_KEYS } from '@/lib/constants';
import { AdminPageHeader, Panel, StatTile, Table, Td, Th } from '@/components/admin/AdminUI';
import { Badge, Pill } from '@/components/ui/Badge';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { formatRelative, truncate } from '@/lib/utils';

export default function AdminDashboard() {
  const overview = useQuery({
    queryKey: QUERY_KEYS.adminOverview,
    queryFn: () => adminApi.overview(),
  });

  if (overview.isLoading) return <LoadingState label="Loading overview" />;

  if (overview.isError || !overview.data) {
    return (
      <ErrorState
        title="Could not load the dashboard"
        description="The API did not respond. Check that the backend is running."
        onRetry={() => overview.refetch()}
      />
    );
  }

  const { projects, messages, views, experience, skills, recentMessages, recentEvents } =
    overview.data;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Overview"
        description="A snapshot of the portfolio: content, traffic and inbound messages."
        actions={
          <>
            <Link
              to="/admin/projects/new"
              className="rounded-full bg-gradient-to-r from-accent-purple to-accent-pink px-4 py-2 text-xs font-medium text-white transition hover:brightness-110"
            >
              New project
            </Link>
            <Link
              to="/admin/messages"
              className="rounded-full border border-white/10 px-4 py-2 text-xs text-haze-300 transition hover:border-accent-violet/40 hover:text-white"
            >
              Review messages
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Projects"
          value={projects.total}
          hint={`${projects.published} published · ${projects.drafts} drafts`}
          icon={<FolderKanban className="h-4 w-4" />}
        />
        <StatTile
          label="Messages"
          value={messages.total}
          hint={`${messages.unread} unread`}
          tone={messages.unread > 0 ? 'accent' : 'default'}
          icon={<Mail className="h-4 w-4" />}
        />
        <StatTile
          label="Total views"
          value={views.total}
          hint={`${views.last7Days} in the last 7 days`}
          icon={<Eye className="h-4 w-4" />}
        />
        <StatTile
          label="Content"
          value={experience + skills}
          hint={`${experience} experience · ${skills} skills`}
          icon={<Sparkles className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <Panel
          title="Recent messages"
          description="The five newest contact submissions."
          actions={
            <Link
              to="/admin/messages"
              className="text-2xs uppercase tracking-[0.16em] text-haze-400 hover:text-white"
            >
              View all
            </Link>
          }
        >
          {recentMessages.length === 0 ? (
            <EmptyState
              title="No messages yet"
              description="Submissions from the contact form will appear here."
              icon={<MessageSquare className="h-5 w-5" />}
            />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>From</Th>
                  <Th>Subject</Th>
                  <Th>Received</Th>
                  <Th className="text-right">Status</Th>
                </tr>
              </thead>
              <tbody>
                {recentMessages.map((message) => (
                  <tr key={message.id} className="transition-colors hover:bg-white/[0.02]">
                    <Td>
                      <span className="block text-sm text-haze-100">{message.name}</span>
                      <span className="block text-2xs text-haze-400">{message.email}</span>
                    </Td>
                    <Td className="max-w-[16rem]">
                      <span className="block truncate text-sm">{message.subject}</span>
                      <span className="block truncate text-2xs text-haze-400">
                        {truncate(message.message, 56)}
                      </span>
                    </Td>
                    <Td className="whitespace-nowrap text-xs text-haze-400">
                      {formatRelative(message.createdAt)}
                    </Td>
                    <Td className="text-right">
                      {message.read ? (
                        <Badge tone="neutral">Read</Badge>
                      ) : (
                        <Badge tone="accent">New</Badge>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Panel>

        <div className="space-y-5">
          <Panel title="Content health">
            <ul className="space-y-3">
              <li className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-sm text-haze-300">
                  <Star className="h-3.5 w-3.5 text-accent-fuchsia" />
                  Featured projects
                </span>
                <Pill>{projects.featured}</Pill>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-sm text-haze-300">
                  <FolderKanban className="h-3.5 w-3.5 text-accent-violet" />
                  Draft projects
                </span>
                <Pill>{projects.drafts}</Pill>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-sm text-haze-300">
                  <Route className="h-3.5 w-3.5 text-accent-blue" />
                  Experience entries
                </span>
                <Pill>{experience}</Pill>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-sm text-haze-300">
                  <Sparkles className="h-3.5 w-3.5 text-accent-fuchsia" />
                  Skills
                </span>
                <Pill>{skills}</Pill>
              </li>
            </ul>
          </Panel>

          <Panel title="Recent activity" description="First-party analytics, no personal data.">
            {recentEvents.length === 0 ? (
              <EmptyState
                title="No activity recorded"
                description="Events appear once visitors browse the public site."
                icon={<Activity className="h-5 w-5" />}
              />
            ) : (
              <ul className="space-y-2.5">
                {recentEvents.slice(0, 8).map((event) => (
                  <li key={event.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0">
                      <span className="block truncate text-haze-200">{event.path}</span>
                      <span className="block text-2xs uppercase tracking-[0.14em] text-haze-400">
                        {event.event} {event.deviceType ? `· ${event.deviceType}` : ''}
                      </span>
                    </span>
                    <span className="shrink-0 text-2xs text-haze-400">
                      {formatRelative(event.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
