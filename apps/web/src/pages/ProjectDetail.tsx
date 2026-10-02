import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, Github, Globe, Info } from 'lucide-react';
import { SmartImage } from '@/components/ui/SmartImage';
import { Button } from '@/components/ui/Button';
import { ProjectStatusBadge } from '@/components/ui/Badge';
import { TechGlyph } from '@/components/ui/Icon';
import { Lightbox } from '@/components/Lightbox';
import { Section } from '@/components/ui/Reveal';
import { EmptyState } from '@/components/ui/States';
import { ContactCTA } from '@/sections/ContactCTA';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useProject, useProjects } from '@/hooks/useContent';
import { useProjectViewTracking } from '@/hooks/useAnalytics';
import { EASE_CINEMATIC } from '@/animations/variants';
import { breadcrumbSchema, creativeWorkSchema } from '@/lib/seo';
import { SITE_NAME } from '@/lib/constants';

interface CaseSection {
  title: string;
  body: string;
}

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { project, isLoading } = useProject(slug);
  const { projects } = useProjects();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useProjectViewTracking(project?.id, project?.slug);

  const gallery = useMemo(() => {
    if (!project) return [];
    return project.images.map((image) => ({
      url: image.url,
      alt: image.alt ?? `${project.title} screenshot`,
      caption: image.caption,
    }));
  }, [project]);

  const neighbours = useMemo(() => {
    if (!project) return { previous: null, next: null };
    const index = projects.findIndex((item) => item.slug === project.slug);
    if (index === -1) return { previous: null, next: null };
    return {
      previous: index > 0 ? projects[index - 1] : null,
      next: index < projects.length - 1 ? projects[index + 1] : null,
    };
  }, [project, projects]);

  const sections: CaseSection[] = useMemo(() => {
    if (!project) return [];
    return [
      { title: 'Overview', body: project.description },
      { title: 'Problem', body: project.problem ?? '' },
      { title: 'Solution', body: project.solution ?? '' },
      { title: 'Architecture', body: project.architecture ?? '' },
      { title: 'Challenges', body: project.challenges ?? '' },
      { title: 'Implementation', body: project.implementation ?? '' },
      { title: 'Results', body: project.results ?? '' },
    ].filter((section) => Boolean(section.body));
  }, [project]);

  usePageMeta({
    title: project ? `${project.title} — ${SITE_NAME}` : `Project — ${SITE_NAME}`,
    description: project?.summary,
    image: project?.coverImage,
    type: 'article',
    jsonLd: project
      ? [
          creativeWorkSchema(project),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Projects', path: '/projects' },
            { name: project.title, path: `/projects/${project.slug}` },
          ]),
        ]
      : undefined,
  });

  if (!isLoading && !project) {
    return (
      <Section className="pt-6">
        <div className="shell">
          <EmptyState
            title="Project not found"
            description="This case study may have been unpublished or the link is incorrect."
            action={
              <Button
                to="/projects"
                variant="secondary"
                size="sm"
                iconLeft={<ArrowLeft className="h-3.5 w-3.5" />}
              >
                Back to projects
              </Button>
            }
          />
        </div>
      </Section>
    );
  }

  if (!project) {
    return (
      <Section className="pt-6">
        <div className="shell">
          <div className="h-[60vh] animate-shimmer rounded-3xl border border-white/[0.06] bg-white/[0.02]" />
        </div>
      </Section>
    );
  }

  return (
    <>
      <Section className="pt-4 sm:pt-6">
        <div className="shell">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-2xs uppercase tracking-[0.2em] text-haze-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All projects
          </Link>

          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-14">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE_CINEMATIC }}
              className="space-y-6"
            >
              <div className="flex flex-wrap items-center gap-3">
                <ProjectStatusBadge status={project.status} />
                <span className="text-2xs uppercase tracking-[0.18em] text-accent-fuchsia/80">
                  {project.category}
                </span>
                {project.year && (
                  <span className="text-2xs uppercase tracking-[0.18em] text-haze-400">
                    {project.year}
                  </span>
                )}
              </div>

              <h1 className="font-display text-[clamp(2.4rem,6vw,4.5rem)] font-bold leading-[0.95] tracking-tight text-haze-100">
                {project.title}
              </h1>

              <p className="max-w-2xl text-base leading-relaxed text-haze-300 sm:text-lg">
                {project.summary}
              </p>

              <div className="flex flex-wrap gap-3 pt-1">
                {project.liveUrl && (
                  <Button
                    href={project.liveUrl}
                    iconRight={<ArrowUpRight className="h-3.5 w-3.5" />}
                  >
                    Live demo
                  </Button>
                )}
                {project.githubUrl && (
                  <Button
                    href={project.githubUrl}
                    variant="secondary"
                    iconLeft={<Github className="h-3.5 w-3.5" />}
                  >
                    Source code
                  </Button>
                )}
                {!project.liveUrl && !project.githubUrl && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-2xs uppercase tracking-[0.16em] text-haze-400">
                    <Info className="h-3.5 w-3.5" />
                    Private project — links unavailable
                  </span>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.1, ease: EASE_CINEMATIC }}
              className="relative"
            >
              <SmartImage
                src={project.coverImage}
                alt={`${project.title} cover`}
                label={project.title}
                accent={project.accentColor}
                aspect="aspect-[16/11]"
                priority
                sizes="(max-width: 1024px) 92vw, 44vw"
                className="rounded-[1.75rem] border border-white/[0.08] shadow-[0_50px_120px_-60px_rgba(0,0,0,1)]"
                seed={5}
              />
            </motion.div>
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <div className="shell">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-14">
            <div className="space-y-10">
              {sections.map((section, index) => (
                <motion.section
                  key={section.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.6, delay: index * 0.03, ease: EASE_CINEMATIC }}
                  className="space-y-3"
                >
                  <h2 className="flex items-center gap-3 font-display text-2xl font-semibold text-haze-100">
                    <span className="h-1 w-1 rounded-full bg-accent-violet shadow-glow-sm" />
                    {section.title}
                  </h2>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-haze-300 sm:text-[0.95rem]">
                    {section.body}
                  </p>
                </motion.section>
              ))}

              {project.features.length > 0 && (
                <section className="space-y-4">
                  <h2 className="flex items-center gap-3 font-display text-2xl font-semibold text-haze-100">
                    <span className="h-1 w-1 rounded-full bg-accent-violet shadow-glow-sm" />
                    Features
                  </h2>
                  <ul className="grid gap-2.5 sm:grid-cols-2">
                    {project.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2.5 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-haze-300"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-fuchsia" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {gallery.length > 0 && (
                <section className="space-y-4">
                  <h2 className="flex items-center gap-3 font-display text-2xl font-semibold text-haze-100">
                    <span className="h-1 w-1 rounded-full bg-accent-violet shadow-glow-sm" />
                    Gallery
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {gallery.map((image, index) => (
                      <button
                        key={image.url}
                        type="button"
                        onClick={() => setLightboxIndex(index)}
                        className="group/gallery overflow-hidden rounded-2xl border border-white/[0.07] transition-transform duration-500 hover:-translate-y-1 focus-visible:outline-none"
                        aria-label={`Open ${image.alt} in fullscreen`}
                      >
                        <SmartImage
                          src={image.url}
                          alt={image.alt ?? ''}
                          label={project.title}
                          accent={project.accentColor}
                          aspect="aspect-[16/10]"
                          className="transition-transform duration-700 group-hover/gallery:scale-[1.04]"
                          seed={index + 23}
                        />
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* ---------------- Sidebar ---------------- */}
            <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-3xl border border-white/[0.07] bg-ink-800/55 p-5 backdrop-blur-xl">
                <p className="label">Tech stack</p>
                <ul className="mt-4 space-y-3">
                  {project.technologies.map((technology) => (
                    <li key={technology.id} className="flex items-center gap-3">
                      <TechGlyph
                        name={technology.name}
                        slug={technology.slug}
                        color={technology.color}
                        size={28}
                      />
                      <span className="text-sm text-haze-200">{technology.name}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <dl className="space-y-3 rounded-3xl border border-white/[0.07] bg-ink-800/55 p-5 backdrop-blur-xl">
                <p className="label">Details</p>
                {project.role && (
                  <div className="flex items-baseline justify-between gap-4 border-b border-white/[0.05] pb-3">
                    <dt className="text-xs uppercase tracking-[0.14em] text-haze-400">Role</dt>
                    <dd className="text-right text-sm text-haze-200">{project.role}</dd>
                  </div>
                )}
                <div className="flex items-baseline justify-between gap-4 border-b border-white/[0.05] pb-3">
                  <dt className="text-xs uppercase tracking-[0.14em] text-haze-400">Category</dt>
                  <dd className="text-right text-sm text-haze-200">{project.category}</dd>
                </div>
                {project.year && (
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-xs uppercase tracking-[0.14em] text-haze-400">Year</dt>
                    <dd className="text-right text-sm text-haze-200">{project.year}</dd>
                  </div>
                )}
              </dl>

              {(project.liveUrl || project.githubUrl) && (
                <div className="flex flex-col gap-2.5 rounded-3xl border border-white/[0.07] bg-ink-800/55 p-5 backdrop-blur-xl">
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-2 text-sm text-haze-200 transition-colors hover:text-white"
                    >
                      <Globe className="h-3.5 w-3.5 text-accent-fuchsia" />
                      {project.liveUrl.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-2 text-sm text-haze-200 transition-colors hover:text-white"
                    >
                      <Github className="h-3.5 w-3.5 text-accent-fuchsia" />
                      Repository
                    </a>
                  )}
                </div>
              )}
            </aside>
          </div>

          {/* ---------------- Prev / next ---------------- */}
          {(neighbours.previous || neighbours.next) && (
            <nav
              aria-label="Project navigation"
              className="mt-16 grid gap-4 border-t border-white/[0.06] pt-8 sm:grid-cols-2"
            >
              {neighbours.previous ? (
                <Link
                  to={`/projects/${neighbours.previous.slug}`}
                  className="group rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 transition-all duration-400 hover:-translate-y-1 hover:border-accent-violet/35"
                >
                  <span className="text-2xs uppercase tracking-[0.18em] text-haze-400">
                    Previous
                  </span>
                  <p className="mt-1.5 font-display text-lg text-haze-100">
                    {neighbours.previous.title}
                  </p>
                </Link>
              ) : (
                <span className="hidden sm:block" />
              )}

              {neighbours.next && (
                <Link
                  to={`/projects/${neighbours.next.slug}`}
                  className="group rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 text-right transition-all duration-400 hover:-translate-y-1 hover:border-accent-violet/35"
                >
                  <span className="text-2xs uppercase tracking-[0.18em] text-haze-400">Next</span>
                  <p className="mt-1.5 font-display text-lg text-haze-100">
                    {neighbours.next.title}
                  </p>
                </Link>
              )}
            </nav>
          )}
        </div>
      </Section>

      <Lightbox
        images={gallery}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />

      <ContactCTA compact />
    </>
  );
}
