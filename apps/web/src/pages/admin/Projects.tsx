import { useState } from 'react';
import { Link } from 'react-router-dom';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Eye, EyeOff, FolderKanban, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import type { Project, ProjectStatus } from '@natsu/types';
import { adminApi, ApiError } from '@/api/client';
import { EASE_IOS } from '@/animations/variants';
import { Panel } from '@/components/admin/Card';
import { IconButton } from '@/components/admin/IconButton';
import { PageHeader } from '@/components/admin/PageHeader';
import { Pagination } from '@/components/admin/Pagination';
import { SearchField } from '@/components/admin/SearchField';
import { SegmentedControl } from '@/components/admin/SegmentedControl';
import { ConfirmDialog } from '@/components/admin/Sheet';
import { ListSkeleton } from '@/components/admin/Skeleton';
import { ProjectStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SmartImage } from '@/components/ui/SmartImage';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useToast } from '@/hooks/useToast';
import { QUERY_KEYS } from '@/lib/constants';
import { patchPaginatedItem, restoreQueries, type QuerySnapshot } from '@/lib/query';
import { cn, formatRelative } from '@/lib/utils';

const PAGE_SIZE = 10;
const PROJECTS_KEY = ['admin', 'projects'] as const;

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'PUBLISHED', label: 'Live' },
  { value: 'DRAFT', label: 'Drafts' },
  { value: 'ARCHIVED', label: 'Archived' },
] as const;

type Filter = (typeof FILTERS)[number]['value'];

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof ApiError ? error.message : fallback;

export default function AdminProjects() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<Filter>('');
  const [pendingDelete, setPendingDelete] = useState<Project | null>(null);
  const debouncedSearch = useDebouncedValue(search.trim());

  const projects = useQuery({
    queryKey: QUERY_KEYS.adminProjects({ page, search: debouncedSearch, status }),
    queryFn: () =>
      adminApi.listProjects({ page, pageSize: PAGE_SIZE, search: debouncedSearch, status }),
    placeholderData: keepPreviousData,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin'] });
    void queryClient.invalidateQueries({ queryKey: ['projects'] });
  };

  const update = useMutation<
    Project,
    unknown,
    { project: Project; patch: Partial<Project> },
    { snapshot: QuerySnapshot }
  >({
    mutationFn: ({ project, patch }) => adminApi.updateProject(project.id, patch),
    onMutate: async ({ project, patch }) => ({
      snapshot: await patchPaginatedItem<Project>(queryClient, PROJECTS_KEY, project.id, patch),
    }),
    onError: (error, _variables, context) => {
      restoreQueries(queryClient, context?.snapshot);
      toast({
        tone: 'error',
        title: 'Couldn’t update project',
        description: errorMessage(error, 'Please try again.'),
      });
    },
    onSettled: invalidate,
  });

  const remove = useMutation({
    mutationFn: (project: Project) => adminApi.deleteProject(project.id),
    onSuccess: (_result, project) => {
      setPendingDelete(null);
      toast({ title: `Deleted “${project.title}”` });
      invalidate();
    },
    onError: (error) =>
      toast({
        tone: 'error',
        title: 'Couldn’t delete project',
        description: errorMessage(error, 'Please try again.'),
      }),
  });

  const togglePublished = (project: Project) => {
    const next: ProjectStatus = project.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    update.mutate({ project, patch: { status: next } });
  };

  const data = projects.data;
  const refreshing = projects.isPlaceholderData && projects.isFetching;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Create, publish and order the case studies shown on the public site."
        actions={
          <Button to="/admin/projects/new" size="sm" iconLeft={<Plus className="h-4 w-4" />}>
            New project
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchField
          label="Search projects"
          placeholder="Search projects"
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          className="sm:max-w-xs sm:flex-1"
        />
        <SegmentedControl
          label="Filter by status"
          options={FILTERS}
          value={status}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
          className="self-start sm:self-auto"
        />
      </div>

      <Panel padded={false}>
        {projects.isLoading ? (
          <ListSkeleton rows={4} />
        ) : projects.isError || !data ? (
          <ErrorState
            title="Couldn’t load projects"
            description="The API didn’t respond with project data."
            onRetry={() => projects.refetch()}
          />
        ) : data.items.length === 0 ? (
          <EmptyState
            title={debouncedSearch || status ? 'No matching projects' : 'No projects yet'}
            description={
              debouncedSearch || status
                ? 'Try a different search or filter.'
                : 'Create your first case study to show it on the site.'
            }
            icon={<FolderKanban className="h-5 w-5" />}
            action={
              !debouncedSearch && !status ? (
                <Button to="/admin/projects/new" size="sm">
                  Create project
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div
              className="hidden grid-cols-[minmax(0,1fr)_6.5rem_7rem_9.5rem] gap-4 border-b border-sys-separator px-4 py-2.5 text-[12px] font-medium text-sys-secondary md:grid"
              aria-hidden="true"
            >
              <span>Project</span>
              <span>Status</span>
              <span>Updated</span>
              <span className="text-right">Actions</span>
            </div>

            <ul
              className={cn('transition-opacity duration-200', refreshing && 'opacity-60')}
              aria-busy={refreshing}
            >
              <AnimatePresence initial={false}>
                {data.items.map((project) => (
                  <motion.li
                    key={project.id}
                    layout="position"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: EASE_IOS }}
                    className="relative overflow-hidden after:absolute after:bottom-0 after:left-4 after:right-0 after:h-px after:bg-sys-separator last:after:hidden md:after:left-[4.25rem]"
                  >
                    <div className="flex flex-col gap-3 px-4 py-3 md:grid md:grid-cols-[minmax(0,1fr)_6.5rem_7rem_9.5rem] md:items-center md:gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <SmartImage
                          src={project.coverImage}
                          alt=""
                          label={project.title}
                          accent={project.accentColor}
                          aspect="aspect-square"
                          className="h-11 w-11 shrink-0 rounded-[10px]"
                          seed={3}
                        />
                        <span className="min-w-0">
                          <Link
                            to={`/admin/projects/${project.id}/edit`}
                            className="block truncate text-sm font-medium text-sys-label hover:text-sys-accent"
                          >
                            {project.title}
                          </Link>
                          <span className="flex min-w-0 items-center gap-1.5 text-[12px] text-sys-secondary">
                            <span className="truncate">{project.category}</span>
                            {project.status === 'PUBLISHED' && (
                              <a
                                href={`/projects/${project.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex shrink-0 items-center gap-0.5 text-sys-accent hover:underline"
                              >
                                /{project.slug}
                                <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                                <span className="sr-only">(opens the live page in a new tab)</span>
                              </a>
                            )}
                          </span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3 md:contents">
                        <span className="flex items-center gap-2">
                          <ProjectStatusBadge status={project.status} />
                          <span className="text-[12px] text-sys-secondary md:hidden">
                            · {formatRelative(project.updatedAt)}
                          </span>
                        </span>
                        <time
                          dateTime={project.updatedAt}
                          className="hidden text-[13px] text-sys-secondary md:block"
                        >
                          {formatRelative(project.updatedAt)}
                        </time>

                        <div className="flex items-center justify-end gap-0.5">
                          <IconButton
                            label="Feature on home page"
                            icon={Star}
                            active={project.featured}
                            onClick={() =>
                              update.mutate({ project, patch: { featured: !project.featured } })
                            }
                            className={
                              project.featured ? 'text-sys-yellow hover:text-sys-yellow' : undefined
                            }
                            aria-pressed={project.featured}
                          />
                          <IconButton
                            label={project.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                            icon={project.status === 'PUBLISHED' ? EyeOff : Eye}
                            onClick={() => togglePublished(project)}
                          />
                          <IconButton
                            label={`Edit ${project.title}`}
                            icon={Pencil}
                            to={`/admin/projects/${project.id}/edit`}
                          />
                          <IconButton
                            label={`Delete ${project.title}`}
                            icon={Trash2}
                            tone="danger"
                            onClick={() => setPendingDelete(project)}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>

            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              total={data.total}
              noun={data.total === 1 ? 'project' : 'projects'}
              onPageChange={setPage}
            />
          </>
        )}
      </Panel>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Delete “${pendingDelete?.title ?? 'project'}”?`}
        description="The case study and its gallery will be removed permanently."
        loading={remove.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && remove.mutate(pendingDelete)}
      />
    </div>
  );
}
