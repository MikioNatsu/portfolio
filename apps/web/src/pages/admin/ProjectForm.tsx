import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CircleAlert, Save } from 'lucide-react';
import type { ProjectStatus } from '@natsu/types';
import { adminApi, ApiError } from '@/api/client';
import { PROJECT_CATEGORIES } from '@/lib/constants';
import { slugify } from '@/lib/utils';
import { AdminPageHeader, Panel } from '@/components/admin/AdminUI';
import { ImageUploader, StringListInput } from '@/components/admin/ImageUploader';
import { Button } from '@/components/ui/Button';
import { Input, Select, Switch, Textarea } from '@/components/ui/Field';
import { ErrorState, LoadingState } from '@/components/ui/States';

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

export default function AdminProjectForm({ mode }: { mode: 'create' | 'edit' }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [values, setValues] = useState<FormValues>(EMPTY);
  const [slugTouched, setSlugTouched] = useState(mode === 'edit');
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const existing = useQuery({
    queryKey: ['admin', 'project', id],
    queryFn: () => adminApi.getProject(id as string),
    enabled: mode === 'edit' && Boolean(id),
  });

  useEffect(() => {
    if (!existing.data) return;
    const project = existing.data;
    setValues({
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
    });
  }, [existing.data]);

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
    setErrors((current) => ({ ...current, title: undefined }));
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
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin'] });
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
      navigate('/admin/projects');
    },
    onError: (error) =>
      setFormError(error instanceof ApiError ? error.message : 'Could not save the project.'),
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const nextErrors: Partial<Record<keyof FormValues, string>> = {};
    if (!values.title.trim()) nextErrors.title = 'A title is required.';
    if (!values.slug.trim()) nextErrors.slug = 'A slug is required.';
    if (!values.category.trim()) nextErrors.category = 'Pick a category.';
    if (!values.summary.trim()) nextErrors.summary = 'A short summary is required.';
    if (!values.description.trim()) nextErrors.description = 'A description is required.';
    if (values.githubUrl && !/^https?:\/\//.test(values.githubUrl))
      nextErrors.githubUrl = 'Must start with http:// or https://';
    if (values.liveUrl && !/^https?:\/\//.test(values.liveUrl))
      nextErrors.liveUrl = 'Must start with http:// or https://';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    save.mutate({
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
    });
  };

  if (mode === 'edit' && existing.isLoading) return <LoadingState label="Loading project" />;

  if (mode === 'edit' && existing.isError) {
    return (
      <ErrorState
        title="Project not found"
        description="It may have been deleted. Return to the list and try again."
        onRetry={() => navigate('/admin/projects')}
      />
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <AdminPageHeader
        title={mode === 'create' ? 'New project' : `Edit ${values.title || 'project'}`}
        description="Everything here is content-managed — no code changes required to update the site."
        actions={
          <>
            <Button
              to="/admin/projects"
              variant="ghost"
              size="sm"
              type="button"
              iconLeft={<ArrowLeft className="h-3.5 w-3.5" />}
            >
              Back
            </Button>
            <Button
              type="submit"
              size="sm"
              loading={save.isPending}
              iconLeft={<Save className="h-3.5 w-3.5" />}
            >
              {mode === 'create' ? 'Create project' : 'Save changes'}
            </Button>
          </>
        }
      />

      {formError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-2xl border border-rose-400/30 bg-rose-500/[0.08] px-4 py-3 text-sm text-rose-200"
        >
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
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

          <Panel title="Case study" description="Only sections you fill in are rendered.">
            <div className="space-y-5">
              <Textarea
                label="Content"
                rows={3}
                value={values.content}
                onChange={(event) => set('content', event.target.value)}
                hint="Optional introduction"
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
              <StringListInput
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
                hint="Leave empty or write “N/A — no metrics published”. Never invent numbers."
              />
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Publishing">
            <div className="space-y-5">
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

              <div className="space-y-2">
                <label
                  htmlFor="accentColor"
                  className="text-xs font-medium uppercase tracking-[0.16em] text-haze-300"
                >
                  Accent colour
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="accentColor"
                    type="color"
                    value={values.accentColor}
                    onChange={(event) => set('accentColor', event.target.value)}
                    className="h-10 w-14 cursor-pointer rounded-xl border border-white/10 bg-ink-800"
                  />
                  <Input
                    label=""
                    value={values.accentColor}
                    onChange={(event) => set('accentColor', event.target.value)}
                    containerClassName="flex-1"
                  />
                </div>
                <p className="text-2xs text-haze-400">
                  Drives the card glow, spotlight and placeholder artwork.
                </p>
              </div>
            </div>
          </Panel>

          <Panel title="Stack & links">
            <div className="space-y-5">
              <StringListInput
                label="Technologies"
                multiline={false}
                value={values.technologies}
                onChange={(next) => set('technologies', next)}
                placeholder="React"
                hint="Press Enter to add. Unknown names are created automatically."
              />

              <Input
                label="GitHub URL"
                type="url"
                value={values.githubUrl}
                onChange={(event) => set('githubUrl', event.target.value)}
                error={errors.githubUrl}
                placeholder="https://github.com/…"
              />
              <Input
                label="Live URL"
                type="url"
                value={values.liveUrl}
                onChange={(event) => set('liveUrl', event.target.value)}
                error={errors.liveUrl}
                placeholder="https://…"
              />
            </div>
          </Panel>

          {mode === 'edit' && (
            <p className="px-1 text-2xs text-haze-400">
              Gallery images and ordering can be managed from the public project page once uploaded.{' '}
              <Link to="/admin/projects" className="text-haze-300 underline">
                Back to list
              </Link>
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
