import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Sparkles, Trash2 } from 'lucide-react';
import type { Skill } from '@natsu/types';
import { adminApi, ApiError } from '@/api/client';
import { InlineAlert, Panel } from '@/components/admin/Card';
import { ColorField } from '@/components/admin/Fields';
import { GlyphTile } from '@/components/admin/GlyphTile';
import { IconButton } from '@/components/admin/IconButton';
import { PageHeader } from '@/components/admin/PageHeader';
import { ConfirmDialog, Sheet } from '@/components/admin/Sheet';
import { ListSkeleton } from '@/components/admin/Skeleton';
import { SortableList } from '@/components/admin/SortableList';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Select, Switch, Textarea } from '@/components/ui/Field';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { useCreateIntent } from '@/hooks/useCreateIntent';
import { useReorderableList } from '@/hooks/useReorderableList';
import { useToast } from '@/hooks/useToast';
import { QUERY_KEYS, SKILL_CATEGORIES } from '@/lib/constants';
import { isHexColor, slugify } from '@/lib/utils';

const FORM_ID = 'skill-form';

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

function toForm(skill: Skill): FormValues {
  return {
    name: skill.name,
    slug: skill.slug,
    category: skill.category,
    icon: skill.icon ?? '',
    color: skill.color ?? '#A855F7',
    level: skill.level ? String(skill.level) : '',
    description: skill.description ?? '',
    published: skill.published,
  };
}

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof ApiError ? error.message : fallback;

export default function AdminSkills() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Skill | null>(null);

  const list = useQuery({ queryKey: QUERY_KEYS.adminSkills, queryFn: () => adminApi.listSkills() });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin'] });
    void queryClient.invalidateQueries({ queryKey: ['skills'] });
  };

  const { ordered, setOrdered, commit } = useReorderableList({
    queryKey: QUERY_KEYS.adminSkills,
    items: list.data,
    persist: (ids) => adminApi.reorderSkills(ids),
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
      editing ? adminApi.updateSkill(editing.id, payload) : adminApi.createSkill(payload),
    onSuccess: (skill) => {
      toast({ title: editing ? 'Skill updated' : `Added “${skill.name}”` });
      invalidate();
      closeSheet();
    },
    onError: (caught) => setError(errorMessage(caught, 'Couldn’t save this skill.')),
  });

  const remove = useMutation({
    mutationFn: (skill: Skill) => adminApi.deleteSkill(skill.id),
    onSuccess: (_result, skill) => {
      setPendingDelete(null);
      toast({ title: `Deleted “${skill.name}”` });
      invalidate();
    },
    onError: (caught) =>
      toast({
        tone: 'error',
        title: 'Couldn’t delete skill',
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

  const openEdit = (skill: Skill) => {
    setValues(toForm(skill));
    setEditing(skill);
    setError(null);
    setSheetOpen(true);
  };

  useCreateIntent(openCreate);

  const update = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!values.name.trim()) {
      setError('A name is required.');
      return;
    }
    if (!isHexColor(values.color)) {
      setError('Use a six-digit hex colour, e.g. #A855F7.');
      return;
    }
    const level = values.level ? Number(values.level) : null;
    if (level !== null && (Number.isNaN(level) || level < 0 || level > 100)) {
      setError('Level must be between 0 and 100.');
      return;
    }

    save.mutate({
      name: values.name.trim(),
      slug: slugify(values.slug || values.name),
      category: values.category,
      icon: values.icon.trim() || null,
      color: values.color,
      level,
      description: values.description.trim() || null,
      published: values.published,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Skills"
        description="Cards in the public skills grid. Drag to set the display order."
        actions={
          <Button size="sm" onClick={openCreate} iconLeft={<Plus className="h-4 w-4" />}>
            New skill
          </Button>
        }
      />

      <Panel padded={false}>
        {list.isLoading ? (
          <ListSkeleton rows={6} />
        ) : list.isError ? (
          <ErrorState title="Couldn’t load skills" onRetry={() => list.refetch()} />
        ) : ordered.length === 0 ? (
          <EmptyState
            title="No skills yet"
            description="Add the technologies you work with."
            icon={<Sparkles className="h-5 w-5" />}
            action={
              <Button size="sm" onClick={openCreate}>
                Add skill
              </Button>
            }
          />
        ) : (
          <SortableList
            items={ordered}
            getKey={(skill) => skill.id}
            getLabel={(skill) => skill.name}
            onChange={setOrdered}
            onCommit={commit}
            itemClassName="after:absolute after:bottom-0 after:left-[5.25rem] after:right-0 after:h-px after:bg-sys-separator last:after:hidden"
            renderItem={(skill, handle) => (
              <div className="flex items-center gap-2 py-2.5 pl-3 pr-3 sm:pr-4">
                {handle}
                <GlyphTile name={skill.name} slug={skill.slug} color={skill.color} size={38} />
                <div className="ml-1 min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-sys-label">{skill.name}</p>
                  <p className="truncate text-[12px] text-sys-secondary">{skill.category}</p>
                </div>
                {!skill.published && <Badge tone="warning">Hidden</Badge>}
                <div className="flex shrink-0 items-center gap-0.5">
                  <IconButton
                    label={`Edit ${skill.name}`}
                    icon={Pencil}
                    onClick={() => openEdit(skill)}
                  />
                  <IconButton
                    label={`Delete ${skill.name}`}
                    icon={Trash2}
                    tone="danger"
                    onClick={() => setPendingDelete(skill)}
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
        title={editing ? `Edit ${editing.name}` : 'New skill'}
        footer={
          <>
            <Button variant="ghost" size="sm" type="button" onClick={closeSheet}>
              Cancel
            </Button>
            <Button size="sm" type="submit" form={FORM_ID} loading={save.isPending}>
              {editing ? 'Save' : 'Add skill'}
            </Button>
          </>
        }
      >
        <form id={FORM_ID} onSubmit={onSubmit} noValidate className="space-y-5">
          {error && <InlineAlert>{error}</InlineAlert>}

          <div className="flex items-center gap-4 rounded-xl bg-sys-fill-4 p-3.5">
            <GlyphTile
              name={values.name || '?'}
              slug={values.slug || slugify(values.name)}
              color={isHexColor(values.color) ? values.color : null}
              size={48}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-sys-label">
                {values.name || 'Skill name'}
              </p>
              <p className="text-[12px] text-sys-secondary">Live preview of the generated glyph</p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Name"
              required
              value={values.name}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  name: event.target.value,
                  slug: editing ? current.slug : slugify(event.target.value),
                }))
              }
              placeholder="React"
            />
            <Input
              label="Slug"
              value={values.slug}
              onChange={(event) => update('slug', event.target.value)}
              hint="Picks the glyph shape"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Select
              label="Category"
              value={values.category}
              onChange={(event) => update('category', event.target.value)}
              options={SKILL_CATEGORIES.map((category) => ({ value: category, label: category }))}
            />
            <Input
              label="Level"
              type="number"
              inputMode="numeric"
              min={0}
              max={100}
              value={values.level}
              onChange={(event) => update('level', event.target.value)}
              hint="Optional · not shown publicly"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Icon name"
              value={values.icon}
              onChange={(event) => update('icon', event.target.value)}
              hint="e.g. react, git"
            />
            <ColorField
              label="Colour"
              value={values.color}
              onChange={(color) => update('color', color)}
            />
          </div>

          <Textarea
            label="Description"
            rows={2}
            value={values.description}
            onChange={(event) => update('description', event.target.value)}
          />

          <Switch
            checked={values.published}
            onChange={(checked) => update('published', checked)}
            label="Published"
            description="Hidden skills never reach the public site."
          />
        </form>
      </Sheet>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Delete “${pendingDelete?.name ?? 'skill'}”?`}
        loading={remove.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && remove.mutate(pendingDelete)}
      />
    </div>
  );
}
