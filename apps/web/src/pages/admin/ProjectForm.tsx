import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import type { Project, ProjectStatus } from '@natsu/types';
import { adminApi, ApiError } from '@/api/client';
import { InlineAlert, Panel } from '@/components/admin/Card';
import { ColorField, LinesInput, TagInput } from '@/components/admin/Fields';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { PageHeader } from '@/components/admin/PageHeader';
import { SaveBar } from '@/components/admin/SaveBar';
import { ConfirmDialog } from '@/components/admin/Sheet';
import { PageSkeleton } from '@/components/admin/Skeleton';
import { ProjectStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Select, Switch, Textarea } from '@/components/ui/Field';
import { ErrorState } from '@/components/ui/States';
import { useToast } from '@/hooks/useToast';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { PROJECT_CATEGORIES } from '@/lib/constants';
import { isHexColor, slugify } from '@/lib/utils';

const FORM_ID = 'project-form';

interface FormValues {
  title: string;
  slug: string;
  category: string;
  summary: string;
  description: string;
  content: string;
  problem: string;
  solution: string;
  features: string[];
  architecture: string;
  challenges: string;
  implementation: string;
  results: string;
  role: string;
  year: string;
  status: ProjectStatus;
  featured: boolean;
  order: string;
  githubUrl: string;
  liveUrl: string;
  coverImage: string | null;
  accentColor: string;
  technologies: string[];
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

const EMPTY: FormValues = {
  title: '',
  slug: '',
  category: PROJECT_CATEGORIES[0],
  summary: '',
  description: '',
  content: '',
  problem: '',
  solution: '',
  features: [],
  architecture: '',
  challenges: '',
  implementation: '',
  results: '',
  role: '',
  year: String(new Date().getFullYear()),
  status: 'DRAFT',
  featured: false,
  order: '0',
  githubUrl: '',
  liveUrl: '',
  coverImage: null,
  accentColor: '#A855F7',
  technologies: [],
};

function toForm(project: Project): FormValues {
  return {
    title: project.title,
    slug: project.slug,
    category: project.category,
    summary: project.summary,
    description: project.description,
    content: project.content ?? '',
    problem: project.problem ?? '',
    solution: project.solution ?? '',
    features: project.features ?? [],
    architecture: project.architecture ?? '',
    challenges: project.challenges ?? '',
    implementation: project.implementation ?? '',
    results: project.results ?? '',
    role: project.role ?? '',
    year: project.year ? String(project.year) : '',
    status: project.status,
    featured: project.featured,
    order: String(project.order),
    githubUrl: project.githubUrl ?? '',
    liveUrl: project.liveUrl ?? '',
    coverImage: project.coverImage,
    accentColor: project.accentColor ?? '#A855F7',
    technologies: project.technologies.map((technology) => technology.name),
  };
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.title.trim()) errors.title = 'A title is required.';
  if (!slugify(values.slug)) errors.slug = 'A slug is required.';
  if (!values.category.trim()) errors.category = 'Pick a category.';
  if (!values.summary.trim()) errors.summary = 'A short summary is required.';
  if (!values.description.trim()) errors.description = 'A description is required.';
  if (values.githubUrl && !/^https?:\/\//.test(values.githubUrl))
    errors.githubUrl = 'Must start with http:// or https://';
  if (values.liveUrl && !/^https?:\/\//.test(values.liveUrl))
    errors.liveUrl = 'Must start with http:// or https://';
  if (!isHexColor(values.accentColor)) errors.accentColor = 'Use a six-digit hex colour.';
  return errors;
}

function toPayload(values: FormValues): Record<string, unknown> {
  return {
    title: values.title.trim(),
    slug: slugify(values.slug),
    category: values.category.trim(),
    summary: values.summary.trim(),
    description: values.description.trim(),
    content: values.content.trim() || null,
    problem: values.problem.trim() || null,
    solution: values.solution.trim() || null,
    features: values.features.filter(Boolean),
    architecture: values.architecture.trim() || null,
    challenges: values.challenges.trim() || null,
    implementation: values.implementation.trim() || null,
    results: values.results.trim() || null,
    role: values.role.trim() || null,
    year: values.year ? Number(values.year) : null,
    status: values.status,
    featured: values.featured,
    order: Number(values.order) || 0,
    githubUrl: values.githubUrl.trim() || null,
    liveUrl: values.liveUrl.trim() || null,
    coverImage: values.coverImage,
    accentColor: values.accentColor,
    technologies: values.technologies.filter(Boolean),
  };
}

export default function AdminProjectForm({ mode }: { mode: 'create' | 'edit' }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const [values, setValues] = useState<FormValues>(EMPTY);
  const [slugTouched, setSlugTouched] = useState(mode === 'edit');
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitCount, setSubmitCount] = useState(0);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const { dirty, saved, markSaved } = useUnsavedChanges(values);

  const existing = useQuery({
    queryKey: ['admin', 'project', id],
    queryFn: () => adminApi.getProject(id as string),
    enabled: mode === 'edit' && Boolean(id),
  });

  // Seed the form once. Saving updates it from the response, so a later
  // refetch can't clobber edits typed after the save.
  const seeded = useRef(false);
  useEffect(() => {
    if (!existing.data || seeded.current) return;
    seeded.current = true;
    const next = toForm(existing.data);
    setValues(next);
    markSaved(next);
  }, [existing.data, markSaved]);

  // After a failed submit, take the user straight to the first problem.
  useEffect(() => {
    if (submitCount === 0) return;
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [submitCount]);

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const onTitleChange = (title: string) => {
    setValues((current) => ({
      ...current,
      title,
      slug: slugTouched ? current.slug : slugify(title),
    }));
    setErrors((current) => ({ ...current, title: undefined, slug: undefined }));
  };

  const categoryOptions = useMemo(() => {
    const list = Array.from(new Set([...PROJECT_CATEGORIES, values.category].filter(Boolean)));
    return list.map((category) => ({ value: category, label: category }));
  }, [values.category]);

  const save = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      mode === 'edit'
        ? adminApi.updateProject(id as string, payload)
        : adminApi.createProject(payload),
    onSuccess: (project) => {
      void queryClient.invalidateQueries({ queryKey: ['admin'] });
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
      if (mode === 'edit') {
        const next = toForm(project);
        setValues(next);
        markSaved(next);
        toast({ title: 'Changes saved' });
      } else {
        markSaved(values);
        toast({ title: `Created “${project.title}”` });
        navigate('/admin/projects');
      }
    },
    onError: (error) =>
      setFormError(error instanceof ApiError ? error.message : 'Couldn’t save the project.'),
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setSubmitCount((count) => count + 1);
      return;
    }
    save.mutate(toPayload(values));
  };

  const leave = () => (dirty ? setConfirmLeave(true) : navigate('/admin/projects'));

  if (mode === 'edit' && existing.isLoading) return <PageSkeleton />;

  if (mode === 'edit' && existing.isError) {
    return (
      <Panel>
        <ErrorState
          title="Project not found"
          description="It may have been deleted. Return to the list and try again."
          onRetry={() => navigate('/admin/projects')}
        />
      </Panel>
    );
  }

  const title = mode === 'create' ? 'New project' : saved.title || 'Edit project';

  return (
    <form ref={formRef} id={FORM_ID} onSubmit={onSubmit} noValidate className="space-y-6">
      <PageHeader
        eyebrow={
          <button
            type="button"
            onClick={leave}
            className="-ml-1 inline-flex items-center gap-0.5 text-sys-accent transition-opacity hover:opacity-75"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Projects
          </button>
        }
        title={title}
        description="Everything here is content-managed — no code changes required to update the site."
        actions={
          <>
            {mode === 'edit' && <ProjectStatusBadge status={saved.status} />}
            <Button
              type="submit"
              size="sm"
              loading={save.isPending}
              disabled={mode === 'edit' && !dirty}
            >
              {mode === 'create' ? 'Create project' : 'Save'}
            </Button>
          </>
        }
      />

      {formError && <InlineAlert>{formError}</InlineAlert>}

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <div className="min-w-0 space-y-5">
          <Panel title="Basics">
            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  label="Title"
                  required
                  value={values.title}
                  onChange={(event) => onTitleChange(event.target.value)}
                  error={errors.title}
                  placeholder="Tensei.uz"
                />
                <Input
                  label="Slug"
                  required
                  value={values.slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    set('slug', event.target.value);
                  }}
                  error={errors.slug}
                  hint="Used in the URL"
                  placeholder="tensei-uz"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                <Select
                  label="Category"
                  required
                  value={values.category}
                  onChange={(event) => set('category', event.target.value)}
                  error={errors.category}
                  options={categoryOptions}
                />
                <Input
                  label="Role"
                  value={values.role}
                  onChange={(event) => set('role', event.target.value)}
                  placeholder="Founder & Frontend Developer"
                />
                <Input
                  label="Year"
                  type="number"
                  inputMode="numeric"
                  min={2000}
                  max={2100}
                  value={values.year}
                  onChange={(event) => set('year', event.target.value)}
                />
              </div>

              <Textarea
                label="Summary"
                required
                rows={2}
                value={values.summary}
                onChange={(event) => set('summary', event.target.value)}
                error={errors.summary}
                hint="Shown on the project card"
                placeholder="Anime discovery, streaming and community experience focused on Uzbek users."
              />

              <Textarea
                label="Description"
                required
                rows={4}
                value={values.description}
                onChange={(event) => set('description', event.target.value)}
                error={errors.description}
              />
            </div>
          </Panel>

          <Panel title="Case study" description="Only the sections you fill in are shown.">
            <div className="space-y-5">
              <Textarea
                label="Introduction"
                rows={3}
                value={values.content}
                onChange={(event) => set('content', event.target.value)}
                hint="Optional"
              />
              <Textarea
                label="Problem"
                rows={3}
                value={values.problem}
                onChange={(event) => set('problem', event.target.value)}
              />
              <Textarea
                label="Solution"
                rows={3}
                value={values.solution}
                onChange={(event) => set('solution', event.target.value)}
              />
              <LinesInput
                label="Features"
                value={values.features}
                onChange={(next) => set('features', next)}
                hint="One feature per line"
                placeholder={'Anime search\nWatch progress\nCommunity feed'}
              />
              <Textarea
                label="Architecture"
                rows={3}
                value={values.architecture}
                onChange={(event) => set('architecture', event.target.value)}
              />
              <Textarea
                label="Challenges"
                rows={3}
                value={values.challenges}
                onChange={(event) => set('challenges', event.target.value)}
              />
              <Textarea
                label="Implementation"
                rows={3}
                value={values.implementation}
                onChange={(event) => set('implementation', event.target.value)}
              />
              <Textarea
                label="Results"
                rows={2}
                value={values.results}
                onChange={(event) => set('results', event.target.value)}
                hint="Leave empty or write “N/A”. Never invent numbers."
              />
            </div>
          </Panel>
        </div>

        <div className="min-w-0 space-y-5">
          <Panel title="Publishing">
            <div className="space-y-4">
              <Select
                label="Status"
                value={values.status}
                onChange={(event) => set('status', event.target.value as ProjectStatus)}
                options={[
                  { value: 'DRAFT', label: 'Draft — hidden from the site' },
                  { value: 'PUBLISHED', label: 'Published — visible' },
                  { value: 'ARCHIVED', label: 'Archived — hidden, kept' },
                ]}
              />
              <Switch
                checked={values.featured}
                onChange={(checked) => set('featured', checked)}
                label="Featured"
                description="Show on the home page and in the featured grid."
              />
              <Input
                label="Order"
                type="number"
                inputMode="numeric"
                value={values.order}
                onChange={(event) => set('order', event.target.value)}
                hint="Lower numbers appear first"
              />
            </div>
          </Panel>

          <Panel title="Media">
            <div className="space-y-5">
              <ImageUploader
                label="Cover image"
                value={values.coverImage}
                onChange={(url) => set('coverImage', url)}
                folder="projects"
              />
              <ColorField
                label="Accent colour"
                value={values.accentColor}
                onChange={(color) => set('accentColor', color)}
                hint="Drives the card glow, spotlight and placeholder artwork."
              />
            </div>
          </Panel>

          <Panel title="Stack & links">
            <div className="space-y-5">
              <TagInput
                label="Technologies"
                value={values.technologies}
                onChange={(next) => set('technologies', next)}
                placeholder="React, TypeScript…"
                hint="Press Enter or comma to add. New names are created automatically."
              />
              <Input
                label="GitHub URL"
                type="url"
                inputMode="url"
                value={values.githubUrl}
                onChange={(event) => set('githubUrl', event.target.value)}
                error={errors.githubUrl}
                placeholder="https://github.com/…"
              />
              <Input
                label="Live URL"
                type="url"
                inputMode="url"
                value={values.liveUrl}
                onChange={(event) => set('liveUrl', event.target.value)}
                error={errors.liveUrl}
                placeholder="https://…"
              />
            </div>
          </Panel>
        </div>
      </div>

      <SaveBar
        formId={FORM_ID}
        dirty={dirty}
        saving={save.isPending}
        onDiscard={() => {
          setValues(saved);
          setErrors({});
        }}
        saveLabel={mode === 'create' ? 'Create' : 'Save'}
      />

      <ConfirmDialog
        open={confirmLeave}
        title="Discard unsaved changes?"
        description="Your edits to this project haven’t been saved."
        confirmLabel="Discard"
        onCancel={() => setConfirmLeave(false)}
        onConfirm={() => {
          setConfirmLeave(false);
          markSaved(values);
          navigate('/admin/projects');
        }}
      />
    </form>
  );
}
