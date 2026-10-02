import { SectionHeading } from '@/components/ui/SectionHeading';
import { Section, RevealGroup, RevealItem } from '@/components/ui/Reveal';
import { ProjectCard } from '@/components/ProjectCard';
import { SkeletonGrid } from '@/components/ui/States';
import { useProjects } from '@/hooks/useContent';
import { cn } from '@/lib/utils';

/**
 * Alternating column spans create the editorial rhythm on wide screens.
 * Written as complete class strings so Tailwind's scanner emits them.
 */
const SPANS = ['lg:col-span-5', 'lg:col-span-7', 'lg:col-span-7', 'lg:col-span-5'];
const SIZES: Array<'default' | 'large'> = ['default', 'large', 'large', 'default'];

interface FeaturedProjectsProps {
  limit?: number;
  showHeading?: boolean;
}

export function FeaturedProjects({ limit = 4, showHeading = true }: FeaturedProjectsProps) {
  const { projects, isLoading } = useProjects({ featured: true, limit });

  return (
    <Section id="projects" className="scroll-mt-28">
      <div className="shell">
        {showHeading && (
          <SectionHeading
            label="Featured Projects"
            jp="プロジェクト"
            title="Selected work"
            description="Anime platforms, Telegram bots and AI products — built end to end, from the first sketch to the shipped interface."
            action={{ label: 'See all projects', to: '/projects' }}
          />
        )}

        <div className="mt-10 sm:mt-12">
          {isLoading ? (
            <SkeletonGrid count={4} className="lg:grid-cols-4" />
          ) : (
            <RevealGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-12">
              {projects.map((project, index) => (
                <RevealItem
                  key={project.id}
                  className={cn('sm:col-span-1', SPANS[index % SPANS.length])}
                >
                  <ProjectCard project={project} index={index} size={SIZES[index % SIZES.length]} />
                </RevealItem>
              ))}
            </RevealGroup>
          )}
        </div>
      </div>
    </Section>
  );
}
