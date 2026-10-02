import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { SocialLink } from '@natsu/types';
import { adminApi, ApiError } from '@/api/client';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Select, Switch } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { useToast } from '@/hooks/useToast';
import { QUERY_KEYS, SOCIAL_ICON_NAMES } from '@/lib/constants';
import { InlineAlert, Panel } from '../Card';
import { IconButton } from '../IconButton';
import { ConfirmDialog, Sheet } from '../Sheet';

const FORM_ID = 'social-link-form';

interface Draft {
  label: string;
  url: string;
  icon: string;
  handle: string;
  published: boolean;
}

const EMPTY: Draft = { label: '', url: '', icon: 'github', handle: '', published: true };

const ICON_OPTIONS = SOCIAL_ICON_NAMES.map((icon) => ({
  value: icon,
  label: icon.charAt(0).toUpperCase() + icon.slice(1),
}));

/** Social links are saved individually, independent of the profile form. */
export function SocialLinksPanel({ links }: { links: SocialLink[] }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SocialLink | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<SocialLink | null>(null);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminProfile });
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile });
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.socialLinks });
  };

  const save = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      editing ? adminApi.updateSocialLink(editing.id, payload) : adminApi.createSocialLink(payload),
    onSuccess: (link) => {
      toast({ title: editing ? 'Link updated' : `Added ${link.label}` });
      setOpen(false);
      invalidate();
    },
    onError: (caught) =>
      setError(caught instanceof ApiError ? caught.message : 'Couldn’t save this link.'),
  });

  const remove = useMutation({
    mutationFn: (link: SocialLink) => adminApi.deleteSocialLink(link.id),
    onSuccess: (_result, link) => {
      setPendingDelete(null);
      toast({ title: `Removed ${link.label}` });
      invalidate();
    },
    onError: () => toast({ tone: 'error', title: 'Couldn’t remove the link' }),
  });

  const openSheet = (link: SocialLink | null) => {
    setEditing(link);
    setDraft(
      link
        ? {
            label: link.label,
            url: link.url,
            icon: link.icon,
            handle: link.handle ?? '',
            published: link.published,
          }
        : EMPTY,
    );
    setError(null);
    setOpen(true);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // The sheet is portaled, but React events still bubble through the React
    // tree — without this the surrounding profile form would submit too.
    event.stopPropagation();
    if (!draft.label.trim()) return setError('A label is required.');
    if (!/^https?:\/\/\S{3,}$/i.test(draft.url.trim()))
      return setError('The URL must start with http:// or https://');
    setError(null);
    save.mutate({
      label: draft.label.trim(),
      url: draft.url.trim(),
      icon: draft.icon,
      handle: draft.handle.trim() || null,
      published: draft.published,
    });
  };

  return (
    <>
      <Panel
        title="Social links"
        padded={false}
        actions={
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => openSheet(null)}
            iconLeft={<Plus className="h-4 w-4" />}
          >
            Add
          </Button>
        }
      >
        {links.length === 0 ? (
          <p className="px-5 pb-5 text-[13px] text-sys-secondary">No social links yet.</p>
        ) : (
          <ul className="pb-1.5">
            {links.map((link) => (
              <li
                key={link.id}
                className="relative flex items-center gap-3 px-4 py-2.5 after:absolute after:bottom-0 after:left-[3.25rem] after:right-0 after:h-px after:bg-sys-separator last:after:hidden"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[7px] bg-sys-fill-3 text-sys-label">
                  <Icon name={link.icon} size={14} strokeWidth={2} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-sys-label">{link.label}</span>
                  <span className="block truncate text-[12px] text-sys-secondary">{link.url}</span>
                </span>
                {!link.published && <Badge tone="warning">Hidden</Badge>}
                <IconButton
                  label={`Edit ${link.label}`}
                  icon={Pencil}
                  onClick={() => openSheet(link)}
                />
                <IconButton
                  label={`Remove ${link.label}`}
                  icon={Trash2}
                  tone="danger"
                  onClick={() => setPendingDelete(link)}
                />
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? `Edit ${editing.label}` : 'New social link'}
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" form={FORM_ID} loading={save.isPending}>
              {editing ? 'Save' : 'Add link'}
            </Button>
          </>
        }
      >
        <form id={FORM_ID} onSubmit={onSubmit} noValidate className="space-y-5">
          {error && <InlineAlert>{error}</InlineAlert>}
          <Input
            label="Label"
            required
            value={draft.label}
            onChange={(event) => setDraft({ ...draft, label: event.target.value })}
            placeholder="GitHub"
          />
          <Input
            label="URL"
            type="url"
            inputMode="url"
            required
            value={draft.url}
            onChange={(event) => setDraft({ ...draft, url: event.target.value })}
            placeholder="https://github.com/…"
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Select
              label="Icon"
              value={draft.icon}
              onChange={(event) => setDraft({ ...draft, icon: event.target.value })}
              options={ICON_OPTIONS}
            />
            <Input
              label="Handle"
              value={draft.handle}
              onChange={(event) => setDraft({ ...draft, handle: event.target.value })}
              placeholder="@natsu"
            />
          </div>
          <Switch
            checked={draft.published}
            onChange={(published) => setDraft({ ...draft, published })}
            label="Published"
            description="Hidden links stay saved but never reach the public site."
          />
        </form>
      </Sheet>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Remove ${pendingDelete?.label ?? 'link'}?`}
        confirmLabel="Remove"
        loading={remove.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && remove.mutate(pendingDelete)}
      />
    </>
  );
}
