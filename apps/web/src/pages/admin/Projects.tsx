import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff, Pencil, Plus, Search, Star, StarOff, Trash2 } from 'lucide-react';
import type { Project } from '@natsu/types';
import { adminApi } from '@/api/client';
import { PROJECT_STATUS_LABELS, QUERY_KEYS } from '@/lib/constants';
import { AdminPageHeader, ConfirmDialog, Panel, Table, Td, Th } from '@/components/admin/AdminUI';
import { Button } from '@/components/ui/Button';
import { ProjectStatusBadge } from '@/components/ui/Badge';
import { SmartImage } from '@/components/ui/SmartImage';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { formatRelative } from '@/lib/utils';

const PAGE_SIZE = 10;

export default function AdminProjects() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [pendingDelete, setPendingDelete] = useState<Project | null>(null);

  const projects = useQuery({
    queryKey: QUERY_KEYS.adminProjects({ page, search, status }),
    queryFn: () => adminApi.listProjects({ page, pageSize: PAGE_SIZE, search, status }),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin'] });
  };

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      adminApi.updateProject(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminApi.deleteProject(id),
    onSuccess: () => {
      setPendingDelete(null);
      invalidate();
    },
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Projects"
        description="Create, publish and order the case studies shown on the public site."
        actions={
          <Button to="/admin/projects/new" size="sm" iconLeft={<Plus className="h-3.5 w-3.5" />}>
            New project
          </Button>
        }
      />

      <Panel>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-haze-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search projects…"
              aria-label="Search projects"
              className="w-full rounded-2xl border border-white/10 bg-ink-800/70 py-3 pl-11 pr-4 text-sm text-haze-100 placeholder:text-haze-400/70 focus:border-accent-violet/60 focus:outline-none focus:ring-4 focus:ring-accent-violet/12"
            />
          </div>

          <div className="flex gap-2">
            {['', 'PUBLISHED', 'DRAFT', 'ARCHIVED'].map((option) => (
              <button
                key={option || 'all'}
                type="button"
                onClick={() => {
                  setStatus(option);
                  setPage(1);
                }}
                className={
                  status === option
                    ? 'rounded-full border border-accent-violet/45 bg-accent-violet/12 px-3.5 py-2 text-xs text-white'
                    : 'rounded-full border border-white/10 px-3.5 py-2 text-xs text-haze-400 transition-colors hover:text-haze-100'
                }
              >
                {option
                  ? PROJECT_STATUS_LABELS[option as keyof typeof PROJECT_STATUS_LABELS]
                  : 'All'}
              </button>
            ))}
          </div>
        </div>
      </Panel>

      <Panel className="p-0">
        {projects.isLoading ? (
          <LoadingState label="Loading projects" />
        ) : projects.isError || !projects.data ? (
          <ErrorState
            title="Could not load projects"
            description="The API did not respond with project data."
            onRetry={() => projects.refetch()}
          />
        ) : projects.data.items.length === 0 ? (
          <EmptyState
            title="No projects found"
            description="Adjust the filters, or create your first project."
            action={
              <Button to="/admin/projects/new" size="sm">
                Create project
              </Button>
            }
          />
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <Th>Project</Th>
                  <Th>Category</Th>
                  <Th>Status</Th>
                  <Th>Featured</Th>
                  <Th>Updated</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {projects.data.items.map((project) => (
                  <tr key={project.id} className="transition-colors hover:bg-white/[0.02]">
                    <Td>
                      <div className="flex items-center gap-3">
                        <SmartImage
                          src={project.coverImage}
                          alt=""
                          label={project.title}
                          accent={project.accentColor}
                          aspect="aspect-square"
                          className="h-11 w-11 shrink-0 rounded-xl border border-white/10"
                          seed={3}
                        />
                        <span className="min-w-0">
                          <Link
                            to={`/projects/${project.slug}`}
                            className="block truncate text-sm text-haze-100 hover:text-white"
                          >
                            {project.title}
                          </Link>
                          <span className="block truncate text-2xs text-haze-400">
                            /{project.slug}
                          </span>
                        </span>
                      </div>
                    </Td>
                    <Td className="text-xs text-haze-300">{project.category}</Td>
                    <Td>
                      <ProjectStatusBadge status={project.status} />
                    </Td>
                    <Td>
                      <button
                        type="button"
                        aria-label={project.featured ? 'Unfeature project' : 'Feature project'}
                        onClick={() =>
                          update.mutate({
                            id: project.id,
                            payload: { featured: !project.featured },
                          })
                        }
                        className="inline-flex items-center gap-1.5 text-xs text-haze-400 transition-colors hover:text-accent-fuchsia"
                      >
                        {project.featured ? (
                          <Star className="h-3.5 w-3.5 fill-accent-fuchsia text-accent-fuchsia" />
                        ) : (
                          <StarOff className="h-3.5 w-3.5" />
                        )}
                        {project.featured ? 'Featured' : 'Not featured'}
                      </button>
                    </Td>
                    <Td className="whitespace-nowrap text-xs text-haze-400">
                      {formatRelative(project.updatedAt)}
                    </Td>
                    <Td>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          aria-label={
                            project.status === 'PUBLISHED' ? 'Unpublish project' : 'Publish project'
                          }
                          onClick={() =>
                            update.mutate({
                              id: project.id,
                              payload: {
                                status: project.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED',
                              },
                            })
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-haze-400 transition-colors hover:border-accent-violet/40 hover:text-white"
                        >
                          {project.status === 'PUBLISHED' ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <Link
                          to={`/admin/projects/${project.id}/edit`}
                          aria-label={`Edit ${project.title}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-haze-400 transition-colors hover:border-accent-violet/40 hover:text-white"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          type="button"
                          aria-label={`Delete ${project.title}`}
                          onClick={() => setPendingDelete(project)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-haze-400 transition-colors hover:border-rose-400/50 hover:text-rose-200"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {projects.data.totalPages > 1 && (
              <div className="flex items-center justify-between gap-4 border-t border-white/[0.06] px-5 py-4">
                <p className="text-2xs uppercase tracking-[0.16em] text-haze-400">
                  Page {projects.data.page} of {projects.data.totalPages} · {projects.data.total}{' '}
                  total
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="subtle"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((value) => Math.max(1, value - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="subtle"
                    size="sm"
                    disabled={page >= projects.data.totalPages}
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

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Delete ${pendingDelete?.title ?? 'project'}?`}
        description="The case study and its gallery will be removed permanently."
        loading={remove.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && remove.mutate(pendingDelete.id)}
      />
    </div>
  );
}
