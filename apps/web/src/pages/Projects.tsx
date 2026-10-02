import { useMemo, useState } from 'react';
import { Section } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ProjectCard } from '@/components/ProjectCard';
import { EmptyState, SkeletonGrid } from '@/components/ui/States';
import { RevealGroup, RevealItem } from '@/components/ui/Reveal';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useProjects } from '@/hooks/useContent';
import { breadcrumbSchema } from '@/lib/seo';
import { SITE_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';

const SPANS = [
  'lg:col-span-5',
  'lg:col-span-7',
  'lg:col-span-7',
  'lg:col-span-5',
  'lg:col-span-6',
  'lg:col-span-6',
];

export default function ProjectsPage() {
  const { projects, isLoading } = useProjects();
  const [filter, setFilter] = useState<string>('All');

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(projects.map((project) => project.category)))],
    [projects],
  );

  const visible = useMemo(
    () => (filter === 'All' ? projects : projects.filter((project) => project.category === filter)),
    [projects, filter],
  );

  usePageMeta({
    title: `Projects — ${SITE_NAME}`,
    description:
      'Anime platforms, Telegram bots, AI assistants and manga readers — selected work by Natsu.',
    jsonLd: breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Projects', path: '/projects' },
    ]),
  });

  return (
    <Section className="pt-6 sm:pt-8">
      <div className="shell">
        <SectionHeading
          label="Projects"
          jp="プロジェクト"
          title="Everything I've shipped"
          description="Product-focused builds — each one a case study in design, architecture and delivery."
        />

        {categories.length > 2 && (
          <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Filter projects">
            {categories.map((category) => {
              const active = filter === category;
              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(category)}
                  className={cn(
                    'rounded-full border px-4 py-2 text-xs transition-all duration-300',
                    active
                      ? 'border-accent-violet/50 bg-accent-violet/15 text-white'
                      : 'border-white/10 bg-white/[0.03] text-haze-400 hover:border-white/20 hover:text-haze-100',
                  )}
                >
                  {category}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-10">
          {isLoading ? (
            <SkeletonGrid count={4} className="lg:grid-cols-2" />
          ) : visible.length === 0 ? (
            <EmptyState
              title="Nothing here yet"
              description="Projects published from the admin panel will show up in this list."
            />
          ) : (
            <RevealGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-12">
              {visible.map((project, index) => (
                <RevealItem
                  key={project.id}
                  className={cn('sm:col-span-1', SPANS[index % SPANS.length])}
                >
                  <ProjectCard project={project} index={index} />
                </RevealItem>
              ))}
            </RevealGroup>
          )}
        </div>
      </div>
    </Section>
  );
}
