import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react';
import type { Experience } from '@natsu/types';
import { adminApi, ApiError } from '@/api/client';
import { AdminModal, AdminPageHeader, ConfirmDialog, Panel } from '@/components/admin/AdminUI';
import { StringListInput } from '@/components/admin/ImageUploader';
import { Button } from '@/components/ui/Button';
import { Input, Switch, Textarea } from '@/components/ui/Field';
import { Badge } from '@/components/ui/Badge';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { formatDateRange } from '@/lib/utils';

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

export default function AdminExperience() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Experience | null>(null);
  const [creating, setCreating] = useState(false);
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Experience | null>(null);

  const list = useQuery({
    queryKey: ['admin', 'experience'],
    queryFn: () => adminApi.listExperience(),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin'] });
    void queryClient.invalidateQueries({ queryKey: ['experience'] });
  };

  const save = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      editing ? adminApi.updateExperience(editing.id, payload) : adminApi.createExperience(payload),
    onSuccess: () => {
      invalidate();
      closeModal();
    },
    onError: (caught) =>
      setError(caught instanceof ApiError ? caught.message : 'Could not save this entry.'),
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminApi.deleteExperience(id),
    onSuccess: () => {
      setPendingDelete(null);
      invalidate();
    },
  });

  const reorder = useMutation({
    mutationFn: (ids: string[]) => adminApi.reorderExperience(ids),
    onSuccess: invalidate,
  });

  const closeModal = () => {
    setEditing(null);
    setCreating(false);
    setValues(EMPTY);
    setError(null);
  };

  const openCreate = () => {
    setValues(EMPTY);
    setEditing(null);
    setCreating(true);
  };

  const openEdit = (item: Experience) => {
    setValues({
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
    });
    setEditing(item);
    setCreating(true);
  };

  const move = (index: number, direction: -1 | 1) => {
    if (!list.data) return;
    const next = [...list.data];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    const current = next[index];
    const swap = next[target];
    if (!current || !swap) return;
    next[index] = swap;
    next[target] = current;
    reorder.mutate(next.map((item) => item.id));
  };

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
      <AdminPageHeader
        title="Experience"
        description="Timeline entries shown on the home page and the experience page."
        actions={
          <Button size="sm" onClick={openCreate} iconLeft={<Plus className="h-3.5 w-3.5" />}>
            New entry
          </Button>
        }
      />

      <Panel className="p-0">
        {list.isLoading ? (
          <LoadingState label="Loading experience" />
        ) : list.isError || !list.data ? (
          <ErrorState
            title="Could not load experience"
            onRetry={() => list.refetch()}
            description="The API did not respond."
          />
        ) : list.data.length === 0 ? (
          <EmptyState
            title="No experience entries"
            description="Add the projects and roles you want to show."
            action={
              <Button size="sm" onClick={openCreate}>
                Add entry
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-white/[0.05]">
            {list.data.map((item, index) => (
              <li key={item.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                <div className="flex flex-1 flex-col gap-1.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="font-display text-lg text-haze-100">{item.organization}</h3>
                    <Badge tone={item.current ? 'accent' : 'neutral'}>
                      {formatDateRange(item.startDate, item.endDate, item.current)}
                    </Badge>
                    {!item.published && <Badge tone="warning">Hidden</Badge>}
                  </div>
                  <p className="text-xs text-accent-fuchsia/80">{item.role}</p>
                  <p className="line-clamp-2 max-w-3xl text-sm text-haze-400">{item.description}</p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    aria-label="Move up"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-haze-400 transition-colors hover:text-white disabled:opacity-30"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Move down"
                    disabled={index === list.data!.length - 1}
                    onClick={() => move(index, 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-haze-400 transition-colors hover:text-white disabled:opacity-30"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Edit ${item.organization}`}
                    onClick={() => openEdit(item)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-haze-400 transition-colors hover:border-accent-violet/40 hover:text-white"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${item.organization}`}
                    onClick={() => setPendingDelete(item)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-haze-400 transition-colors hover:border-rose-400/50 hover:text-rose-200"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <AdminModal
        open={creating}
        onClose={closeModal}
        title={editing ? `Edit ${editing.organization}` : 'New experience entry'}
        description="Dates are shown as years on the public timeline."
        footer={
          <>
            <Button variant="ghost" size="sm" type="button" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              form="experience-form"
              loading={save.isPending}
            >
              {editing ? 'Save changes' : 'Create entry'}
            </Button>
          </>
        }
      >
        <form id="experience-form" onSubmit={onSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Organization"
              required
              value={values.organization}
              onChange={(event) => setValues({ ...values, organization: event.target.value })}
              placeholder="Tensei.uz"
            />
            <Input
              label="Role"
              required
              value={values.role}
              onChange={(event) => setValues({ ...values, role: event.target.value })}
              placeholder="Founder & Frontend Developer"
            />
          </div>

          <Textarea
            label="Description"
            required
            rows={3}
            value={values.description}
            onChange={(event) => setValues({ ...values, description: event.target.value })}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Start date"
              type="month"
              required
              value={values.startDate}
              onChange={(event) => setValues({ ...values, startDate: event.target.value })}
            />
            <Input
              label="End date"
              type="month"
              value={values.endDate}
              onChange={(event) => setValues({ ...values, endDate: event.target.value })}
              disabled={values.current}
              hint={values.current ? 'Currently ongoing' : undefined}
            />
          </div>

          <Switch
            checked={values.current}
            onChange={(checked) => setValues({ ...values, current: checked })}
            label="Current position"
            description="Renders as “2024 — Present” and highlights the timeline node."
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Location"
              value={values.location}
              onChange={(event) => setValues({ ...values, location: event.target.value })}
              placeholder="Remote"
            />
            <Input
              label="Link"
              type="url"
              value={values.url}
              onChange={(event) => setValues({ ...values, url: event.target.value })}
              placeholder="https://…"
            />
          </div>

          <Input
            label="Preview image URL"
            value={values.imageUrl}
            onChange={(event) => setValues({ ...values, imageUrl: event.target.value })}
            placeholder="Leave empty for generated artwork"
          />

          <StringListInput
            label="Technologies"
            multiline={false}
            value={values.technologies}
            onChange={(next) => setValues({ ...values, technologies: next })}
            placeholder="React"
            hint="Press Enter to add."
          />

          <Switch
            checked={values.published}
            onChange={(checked) => setValues({ ...values, published: checked })}
            label="Published"
            description="Hidden entries never reach the public site."
          />

          {error && (
            <p role="alert" className="text-sm text-rose-300">
              {error}
            </p>
          )}
        </form>
      </AdminModal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Delete ${pendingDelete?.organization ?? 'entry'}?`}
        loading={remove.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && remove.mutate(pendingDelete.id)}
      />
    </div>
  );
}
