import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Mail, MailOpen, Search, Trash2 } from 'lucide-react';
import { adminApi } from '@/api/client';
import { AdminPageHeader, ConfirmDialog, Panel } from '@/components/admin/AdminUI';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import type { ContactMessage } from '@natsu/types';
import { formatDate, formatRelative } from '@/lib/utils';

const PAGE_SIZE = 12;

export default function AdminMessages() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState<ContactMessage | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ContactMessage | null>(null);

  const messages = useQuery({
    queryKey: ['admin', 'messages', { page, status, search }],
    queryFn: () => adminApi.listMessages({ page, pageSize: PAGE_SIZE, status, search }),
  });

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['admin'] });

  const markRead = useMutation({
    mutationFn: ({ id, read }: { id: string; read: boolean }) => adminApi.markMessageRead(id, read),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminApi.deleteMessage(id),
    onSuccess: () => {
      setPendingDelete(null);
      setOpen(null);
      invalidate();
    },
  });

  const view = (message: ContactMessage) => {
    setOpen(message);
    if (!message.read) markRead.mutate({ id: message.id, read: true });
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Messages"
        description="Submissions from the public contact form, newest first."
      />

      <Panel>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-haze-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search name, email or subject…"
              aria-label="Search messages"
              className="w-full rounded-2xl border border-white/10 bg-ink-800/70 py-3 pl-11 pr-4 text-sm text-haze-100 placeholder:text-haze-400/70 focus:border-accent-violet/60 focus:outline-none focus:ring-4 focus:ring-accent-violet/12"
            />
          </div>

          <div className="flex gap-2">
            {[
              { value: '', label: 'All' },
              { value: 'NEW', label: 'Unread' },
              { value: 'READ', label: 'Read' },
              { value: 'ARCHIVED', label: 'Archived' },
            ].map((option) => (
              <button
                key={option.value || 'all'}
                type="button"
                onClick={() => {
                  setStatus(option.value);
                  setPage(1);
                }}
                className={
                  status === option.value
                    ? 'rounded-full border border-accent-violet/45 bg-accent-violet/12 px-3.5 py-2 text-xs text-white'
                    : 'rounded-full border border-white/10 px-3.5 py-2 text-xs text-haze-400 transition-colors hover:text-haze-100'
                }
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </Panel>

      <Panel className="p-0">
        {messages.isLoading ? (
          <LoadingState label="Loading messages" />
        ) : messages.isError || !messages.data ? (
          <ErrorState title="Could not load messages" onRetry={() => messages.refetch()} />
        ) : messages.data.items.length === 0 ? (
          <EmptyState
            title="Inbox is empty"
            description="When someone uses the contact form, their message lands here."
          />
        ) : (
          <>
            <ul className="divide-y divide-white/[0.05]">
              {messages.data.items.map((message) => (
                <li key={message.id}>
                  <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      onClick={() => view(message)}
                      className="flex flex-1 items-start gap-4 text-left"
                    >
                      <span
                        className={
                          message.read
                            ? 'mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 text-haze-400'
                            : 'mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-accent-violet/40 bg-accent-violet/12 text-accent-fuchsia'
                        }
                      >
                        {message.read ? (
                          <MailOpen className="h-3.5 w-3.5" />
                        ) : (
                          <Mail className="h-3.5 w-3.5" />
                        )}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2.5">
                          <span className="text-sm font-medium text-haze-100">{message.name}</span>
                          <span className="text-2xs text-haze-400">{message.email}</span>
                          {!message.read && <Badge tone="accent">New</Badge>}
                        </span>
                        <span className="mt-1 block truncate text-sm text-haze-300">
                          {message.subject}
                        </span>
                        <span className="mt-0.5 line-clamp-2 block text-xs text-haze-400">
                          {message.message}
                        </span>
                      </span>
                    </button>

                    <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                      <span
                        className="whitespace-nowrap text-2xs text-haze-400"
                        title={formatDate(message.createdAt)}
                      >
                        {formatRelative(message.createdAt)}
                      </span>
                      <div className="flex gap-1.5">
                        <Button
                          variant="subtle"
                          size="sm"
                          onClick={() => markRead.mutate({ id: message.id, read: !message.read })}
                        >
                          Mark {message.read ? 'unread' : 'read'}
                        </Button>
                        <button
                          type="button"
                          aria-label="Delete message"
                          onClick={() => setPendingDelete(message)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-haze-400 transition-colors hover:border-rose-400/50 hover:text-rose-200"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {messages.data.totalPages > 1 && (
              <div className="flex items-center justify-between gap-4 border-t border-white/[0.06] px-5 py-4">
                <p className="text-2xs uppercase tracking-[0.16em] text-haze-400">
                  Page {messages.data.page} of {messages.data.totalPages} · {messages.data.total}{' '}
                  total
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="subtle"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((value) => value - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="subtle"
                    size="sm"
                    disabled={page >= messages.data.totalPages}
                    onClick={() => setPage((value) => value + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Panel>

      {open && (
        <Panel
          title={open.subject}
          description={`${open.name} · ${open.email} · ${formatDate(open.createdAt)}`}
          actions={
            <Button variant="ghost" size="sm" onClick={() => setOpen(null)}>
              Close
            </Button>
          }
        >
          <p className="whitespace-pre-line text-sm leading-relaxed text-haze-200">
            {open.message}
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Button
              size="sm"
              href={`mailto:${open.email}?subject=Re: ${encodeURIComponent(open.subject)}`}
            >
              Reply by email
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setPendingDelete(open)}
              iconLeft={<Trash2 className="h-3.5 w-3.5" />}
            >
              Delete
            </Button>
          </div>
        </Panel>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this message?"
        loading={remove.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && remove.mutate(pendingDelete.id)}
      />
    </div>
  );
}
