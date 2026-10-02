import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Route, Trash2 } from 'lucide-react';
import type { Experience } from '@natsu/types';
import { adminApi, ApiError } from '@/api/client';
import { InlineAlert, Panel } from '@/components/admin/Card';
import { TagInput } from '@/components/admin/Fields';
import { IconButton } from '@/components/admin/IconButton';
import { PageHeader } from '@/components/admin/PageHeader';
import { ConfirmDialog, Sheet } from '@/components/admin/Sheet';
import { ListSkeleton } from '@/components/admin/Skeleton';
import { SortableList } from '@/components/admin/SortableList';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Switch, Textarea } from '@/components/ui/Field';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { useCreateIntent } from '@/hooks/useCreateIntent';
import { useReorderableList } from '@/hooks/useReorderableList';
import { useToast } from '@/hooks/useToast';
import { QUERY_KEYS } from '@/lib/constants';
import { formatDateRange } from '@/lib/utils';

const FORM_ID = 'experience-form';

interface FormValues {
  organization: string;
  role: string;
  description: string;
  startDate: string;
  endDate: string;
  current: boolean;
  location: string;
  url: string;
  imageUrl: string;
  technologies: string[];
  published: boolean;
}

const EMPTY: FormValues = {
  organization: '',
  role: '',
  description: '',
  startDate: `${new Date().getFullYear()}-01`,
  endDate: '',
  current: true,
  location: '',
  url: '',
  imageUrl: '',
  technologies: [],
  published: true,
};

/** "2024-01" → ISO date the API can store. */
function toIso(value: string): string | null {
  if (!value) return null;
  const [year, month] = value.split('-');
  if (!year) return null;
  return new Date(Date.UTC(Number(year), Number(month ?? 1) - 1, 1)).toISOString();
}

/** ISO date → "2024-01" for `<input type="month">`. */
function toMonth(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function toForm(item: Experience): FormValues {
  return {
    organization: item.organization,
    role: item.role,
    description: item.description,
    startDate: toMonth(item.startDate),
    endDate: toMonth(item.endDate),
    current: item.current,
    location: item.location ?? '',
    url: item.url ?? '',
    imageUrl: item.imageUrl ?? '',
    technologies: item.technologies.map((technology) => technology.name),
    published: item.published,
  };
}

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof ApiError ? error.message : fallback;

export default function AdminExperience() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Experience | null>(null);
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Experience | null>(null);

  const list = useQuery({
    queryKey: QUERY_KEYS.adminExperience,
    queryFn: () => adminApi.listExperience(),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin'] });
    void queryClient.invalidateQueries({ queryKey: ['experience'] });
  };

  const { ordered, setOrdered, commit } = useReorderableList({
    queryKey: QUERY_KEYS.adminExperience,
    items: list.data,
    persist: (ids) => adminApi.reorderExperience(ids),
    onError: (caught) =>
      toast({
        tone: 'error',
        title: 'Couldn’t save the new order',
        description: errorMessage(caught, 'The previous order was restored.'),
      }),
    onSettled: invalidate,
  });

  const save = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      editing ? adminApi.updateExperience(editing.id, payload) : adminApi.createExperience(payload),
    onSuccess: (item) => {
      toast({ title: editing ? 'Entry updated' : `Added “${item.organization}”` });
      invalidate();
      closeSheet();
    },
    onError: (caught) => setError(errorMessage(caught, 'Couldn’t save this entry.')),
  });

  const remove = useMutation({
    mutationFn: (item: Experience) => adminApi.deleteExperience(item.id),
    onSuccess: (_result, item) => {
      setPendingDelete(null);
      toast({ title: `Deleted “${item.organization}”` });
      invalidate();
    },
    onError: (caught) =>
      toast({
        tone: 'error',
        title: 'Couldn’t delete entry',
        description: errorMessage(caught, 'Please try again.'),
      }),
  });

  const closeSheet = () => {
    setSheetOpen(false);
    setError(null);
  };

  const openCreate = () => {
    setValues(EMPTY);
    setEditing(null);
    setError(null);
    setSheetOpen(true);
  };

  const openEdit = (item: Experience) => {
    setValues(toForm(item));
    setEditing(item);
    setError(null);
    setSheetOpen(true);
  };

  useCreateIntent(openCreate);

  const update = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!values.organization.trim() || !values.role.trim() || !values.description.trim()) {
      setError('Organization, role and description are required.');
      return;
    }
    if (!values.startDate) {
      setError('A start date is required.');
      return;
    }
    if (!values.current && values.endDate && values.endDate < values.startDate) {
      setError('The end date can’t be before the start date.');
      return;
    }
    if (values.url && !/^https?:\/\//.test(values.url)) {
      setError('The link must start with http:// or https://');
      return;
    }

    save.mutate({
      organization: values.organization.trim(),
      role: values.role.trim(),
      description: values.description.trim(),
      startDate: toIso(values.startDate),
      endDate: values.current ? null : toIso(values.endDate),
      current: values.current,
      location: values.location.trim() || null,
      url: values.url.trim() || null,
      imageUrl: values.imageUrl.trim() || null,
      technologies: values.technologies.filter(Boolean),
      published: values.published,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Experience"
        description="Timeline entries on the home and experience pages. Drag to reorder."
        actions={
          <Button size="sm" onClick={openCreate} iconLeft={<Plus className="h-4 w-4" />}>
            New entry
          </Button>
        }
      />

      <Panel padded={false}>
        {list.isLoading ? (
          <ListSkeleton rows={4} />
        ) : list.isError ? (
          <ErrorState
            title="Couldn’t load experience"
            description="The API didn’t respond."
            onRetry={() => list.refetch()}
          />
        ) : ordered.length === 0 ? (
          <EmptyState
            title="No experience yet"
            description="Add the roles and projects you want on your timeline."
            icon={<Route className="h-5 w-5" />}
            action={
              <Button size="sm" onClick={openCreate}>
                Add entry
              </Button>
            }
          />
        ) : (
          <SortableList
            items={ordered}
            getKey={(item) => item.id}
            getLabel={(item) => item.organization}
            onChange={setOrdered}
            onCommit={commit}
            itemClassName="after:absolute after:bottom-0 after:left-12 after:right-0 after:h-px after:bg-sys-separator last:after:hidden"
            renderItem={(item, handle) => (
              <div className="flex items-start gap-2 py-3.5 pl-3 pr-3 sm:items-center sm:pr-4">
                <span className="pt-0.5 sm:pt-0">{handle}</span>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <h3 className="text-[15px] font-semibold text-sys-label">
                      {item.organization}
                    </h3>
                    <Badge tone={item.current ? 'accent' : 'neutral'}>
                      {formatDateRange(item.startDate, item.endDate, item.current)}
                    </Badge>
                    {!item.published && <Badge tone="warning">Hidden</Badge>}
                  </div>
                  <p className="text-[13px] font-medium text-sys-secondary">{item.role}</p>
                  <p className="line-clamp-2 max-w-3xl text-[13px] leading-5 text-sys-secondary sm:line-clamp-1">
                    {item.description}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  <IconButton
                    label={`Edit ${item.organization}`}
                    icon={Pencil}
                    onClick={() => openEdit(item)}
                  />
                  <IconButton
                    label={`Delete ${item.organization}`}
                    icon={Trash2}
                    tone="danger"
                    onClick={() => setPendingDelete(item)}
                  />
                </div>
              </div>
            )}
          />
        )}
      </Panel>

      <Sheet
        open={sheetOpen}
        onClose={closeSheet}
        title={editing ? `Edit ${editing.organization}` : 'New experience entry'}
        description="Dates appear as years on the public timeline."
        footer={
          <>
            <Button variant="ghost" size="sm" type="button" onClick={closeSheet}>
              Cancel
            </Button>
            <Button size="sm" type="submit" form={FORM_ID} loading={save.isPending}>
              {editing ? 'Save' : 'Add entry'}
            </Button>
          </>
        }
      >
        <form id={FORM_ID} onSubmit={onSubmit} noValidate className="space-y-5">
          {error && <InlineAlert>{error}</InlineAlert>}

          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Organization"
              required
              value={values.organization}
              onChange={(event) => update('organization', event.target.value)}
              placeholder="Tensei.uz"
            />
            <Input
              label="Role"
              required
              value={values.role}
              onChange={(event) => update('role', event.target.value)}
              placeholder="Founder & Frontend Developer"
            />
          </div>

          <Textarea
            label="Description"
            required
            rows={3}
            value={values.description}
            onChange={(event) => update('description', event.target.value)}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Start date"
              type="month"
              required
              value={values.startDate}
              onChange={(event) => update('startDate', event.target.value)}
            />
            <Input
              label="End date"
              type="month"
              value={values.current ? '' : values.endDate}
              onChange={(event) => update('endDate', event.target.value)}
              disabled={values.current}
              hint={values.current ? 'Ongoing' : undefined}
            />
          </div>

          <Switch
            checked={values.current}
            onChange={(checked) => update('current', checked)}
            label="Current position"
            description="Shown as “2024 — Present” with a highlighted timeline node."
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Location"
              value={values.location}
              onChange={(event) => update('location', event.target.value)}
              placeholder="Remote"
            />
            <Input
              label="Link"
              type="url"
              inputMode="url"
              value={values.url}
              onChange={(event) => update('url', event.target.value)}
              placeholder="https://…"
            />
          </div>

          <Input
            label="Preview image URL"
            value={values.imageUrl}
            onChange={(event) => update('imageUrl', event.target.value)}
            placeholder="Leave empty for generated artwork"
          />

          <TagInput
            label="Technologies"
            value={values.technologies}
            onChange={(next) => update('technologies', next)}
            placeholder="React, TypeScript…"
            hint="Press Enter or comma to add."
          />

          <Switch
            checked={values.published}
            onChange={(checked) => update('published', checked)}
            label="Published"
            description="Hidden entries never reach the public site."
          />
        </form>
      </Sheet>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Delete “${pendingDelete?.organization ?? 'entry'}”?`}
        loading={remove.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && remove.mutate(pendingDelete)}
      />
    </div>
  );
}
