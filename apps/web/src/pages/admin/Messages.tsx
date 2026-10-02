import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Mail, MailOpen, Reply, Trash2 } from 'lucide-react';
import type { ContactMessage } from '@natsu/types';
import { adminApi, ApiError } from '@/api/client';
import { EASE_IOS } from '@/animations/variants';
import { IconButton } from '@/components/admin/IconButton';
import { MessageRow } from '@/components/admin/MessageRow';
import { PageHeader } from '@/components/admin/PageHeader';
import { Pagination } from '@/components/admin/Pagination';
import { SearchField } from '@/components/admin/SearchField';
import { SegmentedControl } from '@/components/admin/SegmentedControl';
import { ConfirmDialog, Sheet } from '@/components/admin/Sheet';
import { ListSkeleton } from '@/components/admin/Skeleton';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useToast } from '@/hooks/useToast';
import { QUERY_KEYS } from '@/lib/constants';
import { patchPaginatedItem, restoreQueries, type QuerySnapshot } from '@/lib/query';
import { cn, formatDate, initials } from '@/lib/utils';

const PAGE_SIZE = 12;
const MESSAGES_KEY = ['admin', 'messages'] as const;

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'NEW', label: 'Unread' },
  { value: 'READ', label: 'Read' },
  { value: 'ARCHIVED', label: 'Archived' },
] as const;

type Filter = (typeof FILTERS)[number]['value'];

/** Reading pane / sheet body for one message. */
function MessageDetail({
  message,
  onToggleRead,
  onDelete,
  showSubject = true,
}: {
  message: ContactMessage;
  onToggleRead: () => void;
  onDelete: () => void;
  /** Off inside the phone sheet, whose title already shows the subject. */
  showSubject?: boolean;
}) {
  const replyHref = `mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`;

  return (
    <article className="flex h-full flex-col">
      <header className="flex items-start gap-3 border-b border-sys-separator pb-4">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#A5A5AA] to-[#7C7C82] text-sm font-semibold text-white"
          aria-hidden="true"
        >
          {initials(message.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold text-sys-label">{message.name}</p>
          <a
            href={`mailto:${message.email}`}
            className="block truncate text-[13px] text-sys-accent hover:underline"
          >
            {message.email}
          </a>
          <time dateTime={message.createdAt} className="block text-[12px] text-sys-secondary">
            {formatDate(message.createdAt)}
          </time>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <IconButton
            label={message.read ? 'Mark as unread' : 'Mark as read'}
            icon={message.read ? Mail : MailOpen}
            onClick={onToggleRead}
          />
          <IconButton label="Delete message" icon={Trash2} tone="danger" onClick={onDelete} />
        </div>
      </header>

      {showSubject && (
        <h2 className="mt-5 text-xl font-semibold tracking-[-0.015em] text-sys-label">
          {message.subject}
        </h2>
      )}
      <p
        className={cn(
          'whitespace-pre-line text-[15px] leading-7 text-sys-label/90',
          showSubject ? 'mt-3' : 'mt-5',
        )}
      >
        {message.message}
      </p>

      <div className="mt-6">
        <Button href={replyHref} size="sm" iconLeft={<Reply className="h-4 w-4" />}>
          Reply by email
        </Button>
      </div>
    </article>
  );
}

export default function AdminMessages() {
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const wide = useMediaQuery('(min-width: 1024px)');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<Filter>('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ContactMessage | null>(null);
  const debouncedSearch = useDebouncedValue(search.trim());

  const messages = useQuery({
    queryKey: QUERY_KEYS.adminMessages({ page, status, search: debouncedSearch }),
    queryFn: () =>
      adminApi.listMessages({ page, pageSize: PAGE_SIZE, status, search: debouncedSearch }),
    placeholderData: keepPreviousData,
  });

  const items = messages.data?.items ?? [];
  // Prefer the live copy (read state changes) but keep showing a message that
  // dropped out of the current filter after being read.
  const current = selected ? (items.find((item) => item.id === selected.id) ?? selected) : null;

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['admin'] });

  const markRead = useMutation<
    ContactMessage,
    unknown,
    { message: ContactMessage; read: boolean },
    { snapshot: QuerySnapshot }
  >({
    mutationFn: ({ message, read }) => adminApi.markMessageRead(message.id, read),
    onMutate: async ({ message, read }) => {
      setSelected((open) => (open?.id === message.id ? { ...open, read } : open));
      return {
        snapshot: await patchPaginatedItem<ContactMessage>(queryClient, MESSAGES_KEY, message.id, {
          read,
        }),
      };
    },
    onError: (_error, _variables, context) => {
      restoreQueries(queryClient, context?.snapshot);
      toast({ tone: 'error', title: 'Couldn’t update the message' });
    },
    onSettled: invalidate,
  });

  const remove = useMutation({
    mutationFn: (message: ContactMessage) => adminApi.deleteMessage(message.id),
    onSuccess: (_result, message) => {
      setPendingDelete(null);
      setSelected((open) => (open?.id === message.id ? null : open));
      toast({ title: 'Message deleted' });
      invalidate();
    },
    onError: (caught) =>
      toast({
        tone: 'error',
        title: 'Couldn’t delete the message',
        description: caught instanceof ApiError ? caught.message : undefined,
      }),
  });

  const open = (message: ContactMessage) => {
    setSelected(message);
    if (!message.read) markRead.mutate({ message, read: true });
  };

  // Arriving from the dashboard with a specific message: open it once, then
  // clear the router state so closing it later can't re-trigger the request.
  const requestedId = (location.state as { messageId?: string } | null)?.messageId;
  const openRef = useRef(open);
  openRef.current = open;
  useEffect(() => {
    if (!requestedId || !messages.data) return;
    const match = messages.data.items.find((item) => item.id === requestedId);
    if (match) openRef.current(match);
    navigate(location.pathname, { replace: true, state: null });
  }, [requestedId, messages.data, navigate, location.pathname]);

  const filtersActive = Boolean(debouncedSearch || status);
  const refreshing = messages.isPlaceholderData && messages.isFetching;

  const detail = current ? (
    <MessageDetail
      message={current}
      showSubject={wide}
      onToggleRead={() => markRead.mutate({ message: current, read: !current.read })}
      onDelete={() => setPendingDelete(current)}
    />
  ) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages"
        description="Submissions from the public contact form, newest first."
      />

      <div className="sys-card overflow-hidden lg:grid lg:h-[calc(100dvh-13.5rem)] lg:min-h-[32rem] lg:grid-cols-[minmax(20rem,26rem)_1fr]">
        <section
          aria-label="Inbox"
          className="flex min-h-0 flex-col lg:border-r lg:border-sys-separator"
        >
          <div className="space-y-2.5 border-b border-sys-separator p-3">
            <SearchField
              label="Search messages"
              placeholder="Search name, email or subject"
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
            />
            <SegmentedControl
              label="Filter messages"
              options={FILTERS}
              value={status}
              onChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
              size="sm"
              fullWidth
            />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {messages.isLoading ? (
              <ListSkeleton rows={6} />
            ) : messages.isError ? (
              <ErrorState title="Couldn’t load messages" onRetry={() => messages.refetch()} />
            ) : items.length === 0 ? (
              <EmptyState
                title={filtersActive ? 'No matching messages' : 'Inbox is empty'}
                description={
                  filtersActive
                    ? 'Try a different search or filter.'
                    : 'When someone uses the contact form, their message lands here.'
                }
                icon={<Mail className="h-5 w-5" />}
              />
            ) : (
              <ul
                className={cn('space-y-0.5 p-2 transition-opacity', refreshing && 'opacity-60')}
                aria-busy={refreshing}
              >
                {items.map((message) => (
                  <li key={message.id}>
                    <MessageRow
                      message={message}
                      selected={wide && current?.id === message.id}
                      onSelect={() => open(message)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {messages.data && (
            <Pagination
              page={messages.data.page}
              totalPages={messages.data.totalPages}
              total={messages.data.total}
              noun={messages.data.total === 1 ? 'message' : 'messages'}
              onPageChange={setPage}
            />
          )}
        </section>

        {wide && (
          <section aria-label="Message" className="min-h-0 overflow-y-auto p-6 lg:p-8">
            <AnimatePresence mode="wait" initial={false}>
              {detail ? (
                <motion.div
                  key={current?.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease: EASE_IOS }}
                  className="mx-auto max-w-2xl"
                >
                  {detail}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex h-full items-center justify-center"
                >
                  <p className="text-[15px] font-medium text-sys-tertiary">No message selected</p>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        )}
      </div>

      {!wide && (
        <Sheet
          open={Boolean(current)}
          onClose={() => setSelected(null)}
          title={current?.subject ?? 'Message'}
          size="md"
        >
          {detail}
        </Sheet>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this message?"
        description={
          pendingDelete ? `From ${pendingDelete.name}. This can’t be undone.` : undefined
        }
        loading={remove.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && remove.mutate(pendingDelete)}
      />
    </div>
  );
}
