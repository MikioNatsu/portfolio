import { Link } from 'react-router-dom';
import { ArrowUpRight, Github, Globe } from 'lucide-react';
import type { ProjectSummary } from '@natsu/types';
import { SmartImage } from '@/components/ui/SmartImage';
import { ProjectStatusBadge } from '@/components/ui/Badge';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: ProjectSummary;
  index: number;
  size?: 'default' | 'large' | 'compact';
  className?: string;
}

/**
 * One case-study card.
 *
 * The card is **not** wrapped in a link: it contains external links
 * (GitHub / live demo), and an anchor may not be nested inside another anchor.
 * Instead the "Case study" link carries a stretched `::after` overlay that
 * makes the whole card clickable, while the external links sit above it on
 * `z-10`. Valid HTML, one link per destination, and the card is still fully
 * clickable.
 */
export function ProjectCard({ project, index, size = 'default', className }: ProjectCardProps) {
  const aspect =
    size === 'large' ? 'aspect-[16/11]' : size === 'compact' ? 'aspect-[16/10]' : 'aspect-[4/3]';

  return (
    <SpotlightCard
      accent={project.accentColor ?? '#A855F7'}
      className={cn('h-full', className)}
      as="article"
    >
      <div className="flex h-full flex-col">
        <div className="relative overflow-hidden">
          <SmartImage
            src={project.coverImage}
            alt={`${project.title} cover`}
            label={project.title}
            accent={project.accentColor}
            aspect={aspect}
            seed={index + 3}
            className="transition-transform duration-[900ms] ease-cinematic group-hover/spot:scale-[1.06]"
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/10 to-transparent" />

          <div className="absolute left-4 top-4 flex items-center gap-2">
            <ProjectStatusBadge status={project.status} />
          </div>

          <span
            className="absolute right-4 top-4 font-display text-3xl font-semibold text-white/15"
            aria-hidden="true"
          >
            {String(index + 1).padStart(2, '0')}
          </span>

          <div className="absolute inset-x-4 bottom-3 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-2xs uppercase tracking-[0.18em] text-accent-fuchsia/80">
                {project.category}
              </p>
              <h3 className="truncate font-display text-xl font-semibold text-white sm:text-2xl">
                {project.title}
              </h3>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 p-5">
          <p className="line-clamp-3 text-sm leading-relaxed text-haze-300">{project.summary}</p>

          {project.technologies.length > 0 && (
            <ul className="flex flex-wrap gap-1.5">
              {project.technologies.slice(0, 4).map((technology) => (
                <li
                  key={technology.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.03] px-2.5 py-1 text-2xs text-haze-400"
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: technology.color ?? '#A855F7' }}
                  />
                  {technology.name}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-auto flex items-center justify-between border-t border-white/[0.06] pt-4">
            {/* Sits above the stretched overlay so these stay independently clickable */}
            <div className="relative z-10 flex items-center gap-3">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={`${project.title} source code`}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-haze-400 transition-colors hover:border-accent-violet/50 hover:text-white"
                >
                  <Github className="h-3.5 w-3.5" />
                </a>
              )}
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={`${project.title} live site`}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-haze-400 transition-colors hover:border-accent-violet/50 hover:text-white"
                >
                  <Globe className="h-3.5 w-3.5" />
                </a>
              )}
            </div>

            <Link
              to={`/projects/${project.slug}`}
              className="inline-flex items-center gap-1.5 text-2xs uppercase tracking-[0.16em] text-haze-400 transition-colors duration-300 after:absolute after:inset-0 after:content-[''] group-hover/spot:text-white focus-visible:outline-none"
            >
              {/* Gives the link the project name as its accessible name and anchor text */}
              <span className="sr-only">{project.title}: </span>
              Case study
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/spot:-translate-y-0.5 group-hover/spot:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
}
