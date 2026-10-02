import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react';
import type { Skill } from '@natsu/types';
import { adminApi, ApiError } from '@/api/client';
import { SKILL_CATEGORIES } from '@/lib/constants';
import { slugify } from '@/lib/utils';
import { AdminModal, AdminPageHeader, ConfirmDialog, Panel } from '@/components/admin/AdminUI';
import { Button } from '@/components/ui/Button';
import { Input, Select, Switch, Textarea } from '@/components/ui/Field';
import { Badge } from '@/components/ui/Badge';
import { TechGlyph } from '@/components/ui/Icon';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';

interface FormValues {
  name: string;
  slug: string;
  category: string;
  icon: string;
  color: string;
  level: string;
  description: string;
  published: boolean;
}

const EMPTY: FormValues = {
  name: '',
  slug: '',
  category: SKILL_CATEGORIES[0],
  icon: '',
  color: '#A855F7',
  level: '',
  description: '',
  published: true,
};

export default function AdminSkills() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Skill | null>(null);

  const list = useQuery({ queryKey: ['admin', 'skills'], queryFn: () => adminApi.listSkills() });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin'] });
    void queryClient.invalidateQueries({ queryKey: ['skills'] });
  };

  const save = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      editing ? adminApi.updateSkill(editing.id, payload) : adminApi.createSkill(payload),
    onSuccess: () => {
      invalidate();
      close();
    },
    onError: (caught) => setError(caught instanceof ApiError ? caught.message : 'Could not save.'),
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminApi.deleteSkill(id),
    onSuccess: () => {
      setPendingDelete(null);
      invalidate();
    },
  });

  const reorder = useMutation({
    mutationFn: (ids: string[]) => adminApi.reorderSkills(ids),
    onSuccess: invalidate,
  });

  const close = () => {
    setOpen(false);
    setEditing(null);
    setValues(EMPTY);
    setError(null);
  };

  const openCreate = () => {
    setValues(EMPTY);
    setEditing(null);
    setOpen(true);
  };

  const openEdit = (skill: Skill) => {
    setValues({
      name: skill.name,
      slug: skill.slug,
      category: skill.category,
      icon: skill.icon ?? '',
      color: skill.color ?? '#A855F7',
      level: skill.level ? String(skill.level) : '',
      description: skill.description ?? '',
      published: skill.published,
    });
    setEditing(skill);
    setOpen(true);
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
    if (!values.name.trim()) {
      setError('A name is required.');
      return;
    }

    save.mutate({
      name: values.name.trim(),
      slug: slugify(values.slug || values.name),
      category: values.category,
      icon: values.icon.trim() || null,
      color: values.color,
      level: values.level ? Number(values.level) : null,
      description: values.description.trim() || null,
      published: values.published,
    });
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Skills"
        description="The futuristic cards in the skills grid. Order controls display sequence."
        actions={
          <Button size="sm" onClick={openCreate} iconLeft={<Plus className="h-3.5 w-3.5" />}>
            New skill
          </Button>
        }
      />

      <Panel className="p-0">
        {list.isLoading ? (
          <LoadingState label="Loading skills" />
        ) : list.isError || !list.data ? (
          <ErrorState title="Could not load skills" onRetry={() => list.refetch()} />
        ) : list.data.length === 0 ? (
          <EmptyState title="No skills yet" description="Add the technologies you work with." />
        ) : (
          <ul className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-3">
            {list.data.map((skill, index) => (
              <li
                key={skill.id}
                className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-3.5"
              >
                <TechGlyph name={skill.name} slug={skill.slug} color={skill.color} size={34} />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-haze-100">{skill.name}</p>
                  <p className="truncate text-2xs uppercase tracking-[0.14em] text-haze-400">
                    {skill.category}
                  </p>
                </div>

                {!skill.published && <Badge tone="warning">Hidden</Badge>}

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="Move up"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 text-haze-400 hover:text-white disabled:opacity-30"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    aria-label="Move down"
                    disabled={index === list.data!.length - 1}
                    onClick={() => move(index, 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 text-haze-400 hover:text-white disabled:opacity-30"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Edit ${skill.name}`}
                    onClick={() => openEdit(skill)}
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 text-haze-400 hover:border-accent-violet/40 hover:text-white"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${skill.name}`}
                    onClick={() => setPendingDelete(skill)}
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 text-haze-400 hover:border-rose-400/50 hover:text-rose-200"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <AdminModal
        open={open}
        onClose={close}
        title={editing ? `Edit ${editing.name}` : 'New skill'}
        footer={
          <>
            <Button variant="ghost" size="sm" type="button" onClick={close}>
              Cancel
            </Button>
            <Button size="sm" type="submit" form="skill-form" loading={save.isPending}>
              {editing ? 'Save changes' : 'Create skill'}
            </Button>
          </>
        }
      >
        <form id="skill-form" onSubmit={onSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Name"
              required
              value={values.name}
              onChange={(event) =>
                setValues({
                  ...values,
                  name: event.target.value,
                  slug: editing ? values.slug : slugify(event.target.value),
                })
              }
              placeholder="React"
            />
            <Input
              label="Slug"
              value={values.slug}
              onChange={(event) => setValues({ ...values, slug: event.target.value })}
              hint="Used for the generated icon shape"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Select
              label="Category"
              value={values.category}
              onChange={(event) => setValues({ ...values, category: event.target.value })}
              options={SKILL_CATEGORIES.map((category) => ({ value: category, label: category }))}
            />
            <Input
              label="Level (optional)"
              type="number"
              min={0}
              max={100}
              value={values.level}
              onChange={(event) => setValues({ ...values, level: event.target.value })}
              hint="Left empty by default — no progress bars are shown"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Icon name"
              value={values.icon}
              onChange={(event) => setValues({ ...values, icon: event.target.value })}
              hint="e.g. react, typescript, git"
            />
            <div className="space-y-2">
              <label
                htmlFor="skill-color"
                className="text-xs font-medium uppercase tracking-[0.16em] text-haze-300"
              >
                Colour
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="skill-color"
                  type="color"
                  value={values.color}
                  onChange={(event) => setValues({ ...values, color: event.target.value })}
                  className="h-11 w-14 cursor-pointer rounded-xl border border-white/10 bg-ink-800"
                />
                <Input
                  label=""
                  value={values.color}
                  onChange={(event) => setValues({ ...values, color: event.target.value })}
                  containerClassName="flex-1"
                />
              </div>
            </div>
          </div>

          <Textarea
            label="Description"
            rows={2}
            value={values.description}
            onChange={(event) => setValues({ ...values, description: event.target.value })}
          />

          <Switch
            checked={values.published}
            onChange={(checked) => setValues({ ...values, published: checked })}
            label="Published"
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
        title={`Delete ${pendingDelete?.name ?? 'skill'}?`}
        loading={remove.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && remove.mutate(pendingDelete.id)}
      />
    </div>
  );
}
