import { motion } from 'framer-motion';
import { ArrowUpRight, MapPin } from 'lucide-react';
import type { Experience as ExperienceModel } from '@natsu/types';
import { SmartImage } from '@/components/ui/SmartImage';
import { TechGlyph } from '@/components/ui/Icon';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { EASE_CINEMATIC, viewportOnce } from '@/animations/variants';
import { cn, formatDateRange } from '@/lib/utils';

/** One entry of the glowing vertical timeline. */
export function TimelineItem({
  item,
  index,
  isLast,
}: {
  item: ExperienceModel;
  index: number;
  isLast: boolean;
}) {
  const reduceMotion = usePrefersReducedMotion();
  const range = formatDateRange(item.startDate, item.endDate, item.current);

  return (
    <li className="relative pl-10 sm:pl-14">
      {/* Rail */}
      {!isLast && (
        <span
          aria-hidden="true"
          className="absolute left-[0.3rem] top-3 h-full w-px bg-gradient-to-b from-accent-violet/60 via-accent-violet/25 to-transparent sm:left-[0.55rem]"
        />
      )}

      {/* Node */}
      <span
        aria-hidden="true"
        className="absolute left-0 top-1.5 flex h-3 w-3 items-center justify-center sm:left-[0.3rem]"
      >
        <span
          className={cn(
            'h-3 w-3 rounded-full border',
            item.current
              ? 'border-accent-fuchsia bg-accent-violet shadow-[0_0_16px_2px_rgba(168,85,247,0.7)]'
              : 'border-white/25 bg-ink-700',
          )}
        />
        {item.current && (
          <span className="absolute h-3 w-3 animate-pulse-ring rounded-full bg-accent-violet/70" />
        )}
      </span>

      <motion.article
        initial={reduceMotion ? undefined : { opacity: 0, y: 24 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={viewportOnce}
        transition={{ duration: 0.7, delay: index * 0.06, ease: EASE_CINEMATIC }}
        className={cn(
          'group/timeline relative overflow-hidden rounded-3xl border border-white/[0.07] bg-ink-800/50 p-5 backdrop-blur-xl transition-all duration-500 ease-cinematic sm:p-6',
          'hover:border-accent-violet/30 hover:shadow-card',
        )}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-8 top-0 h-px opacity-0 transition-opacity duration-500 group-hover/timeline:opacity-100"
          style={{ background: 'linear-gradient(90deg, transparent, #A855F7, transparent)' }}
        />

        <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-start">
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-accent-violet/25 bg-accent-violet/10 px-3 py-1 text-2xs uppercase tracking-[0.16em] text-accent-fuchsia">
                {range}
              </span>
              {item.location && (
                <span className="inline-flex items-center gap-1.5 text-2xs uppercase tracking-[0.14em] text-haze-400">
                  <MapPin className="h-3 w-3" />
                  {item.location}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <h3 className="font-display text-xl font-semibold text-haze-100 sm:text-2xl">
                {item.organization}
              </h3>
              <p className="text-sm text-accent-fuchsia/85">{item.role}</p>
            </div>

            <p className="max-w-2xl text-sm leading-relaxed text-haze-300">{item.description}</p>

            {item.technologies.length > 0 && (
              <ul className="flex flex-wrap gap-2 pt-1">
                {item.technologies.map((technology) => (
                  <li
                    key={technology.id}
                    className="flex items-center gap-1.5"
                    title={technology.name}
                  >
                    <TechGlyph
                      name={technology.name}
                      slug={technology.slug}
                      color={technology.color}
                      size={22}
                    />
                    <span className="text-2xs text-haze-400">{technology.name}</span>
                  </li>
                ))}
              </ul>
            )}

            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 pt-1 text-2xs uppercase tracking-[0.16em] text-haze-400 transition-colors hover:text-white"
              >
                Visit
                <ArrowUpRight className="h-3 w-3" />
              </a>
            )}
          </div>

          <div className="w-full sm:w-40 lg:w-52">
            <SmartImage
              src={item.imageUrl}
              alt={`${item.organization} preview`}
              label={item.organization}
              accent="#7C3AED"
              aspect="aspect-[16/10] sm:aspect-[4/3]"
              seed={index + 17}
              className="rounded-2xl border border-white/[0.07] transition-transform duration-700 ease-cinematic group-hover/timeline:scale-[1.03]"
            />
          </div>
        </div>
      </motion.article>
    </li>
  );
}
