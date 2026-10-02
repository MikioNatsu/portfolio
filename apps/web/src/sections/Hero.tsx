import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowUpRight, Play } from 'lucide-react';
import { HeroArtwork } from '@/components/HeroArtwork';
import { MusicWidget } from '@/components/MusicWidget';
import { Button } from '@/components/ui/Button';
import { Pill, StatusDot } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import { Sparkle } from '@/components/layout/Logomark';
import { SakuraPetals } from '@/components/effects/Background';
import { useProfile, useProjects } from '@/hooks/useContent';
import { useIsDesktop, usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { staggerContainer, staggerItem } from '@/animations/variants';
import { cn, truncate } from '@/lib/utils';

/* -------------------------------------------------------------------------- */
/* Floating micro-UI                                                           */
/* -------------------------------------------------------------------------- */

function CurrentlyBuilding({ title, category }: { title: string; category: string }) {
  return (
    <div className="glass-strong w-[15.5rem] rounded-2xl p-3.5">
      <div className="flex items-center gap-2">
        <Sparkle size={9} className="text-accent-fuchsia" />
        <span className="text-2xs uppercase tracking-[0.2em] text-haze-400">
          Currently Building
        </span>
      </div>
      <p className="mt-2 font-display text-base text-haze-100">{title}</p>
      <p className="text-2xs text-haze-400">{category}</p>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.07]">
        <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-accent-purple via-accent-violet to-accent-pink" />
      </div>
    </div>
  );
}

function StatusCard({ statuses }: { statuses: string[] }) {
  return (
    <div className="glass-strong rounded-2xl px-3.5 py-3">
      <p className="text-2xs uppercase tracking-[0.2em] text-haze-400">Status</p>
      <ul className="mt-2 space-y-1.5">
        {statuses.map((status, index) => (
          <li key={status} className="flex items-center gap-2 text-xs text-haze-200">
            <span
              className={cn(
                'h-1 w-1 rounded-full',
                index === 0
                  ? 'bg-emerald-300'
                  : index === 1
                    ? 'bg-accent-violet'
                    : 'bg-accent-blue',
              )}
            />
            {status}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Hero                                                                        */
/* -------------------------------------------------------------------------- */

export function Hero() {
  const { profile } = useProfile();
  const { projects } = useProjects({ featured: true, limit: 1 });
  const isDesktop = useIsDesktop();
  const reduceMotion = usePrefersReducedMotion();

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 90, damping: 22 });
  const springY = useSpring(pointerY, { stiffness: 90, damping: 22 });
  const artworkX = useTransform(springX, [-0.5, 0.5], [-16, 16]);
  const artworkY = useTransform(springY, [-0.5, 0.5], [-12, 12]);

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDesktop || reduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const resetPointer = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  const headlineProject = projects[0];

  return (
    <section
      id="hero"
      onPointerMove={onPointerMove}
      onPointerLeave={resetPointer}
      className="relative overflow-hidden pb-16 pt-4 sm:pb-20 lg:pb-24 lg:pt-6"
    >
      <SakuraPetals count={isDesktop ? 14 : 8} className="z-0" />

      <div className="shell relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.02fr)] lg:gap-8 xl:gap-14">
          {/* ---------------- Text column ---------------- */}
          <motion.div
            variants={staggerContainer(0.1, 0.1)}
            initial="hidden"
            animate="visible"
            className="relative max-w-xl space-y-7 lg:max-w-none"
          >
            <motion.div variants={staggerItem} className="flex items-center gap-3">
              <span className="h-px w-10 bg-gradient-to-r from-transparent to-accent-violet/70" />
              <p className="jp text-2xs text-haze-300 sm:text-xs">
                {profile.tagline || 'アニメで広がる、もっと特別な世界。'}
              </p>
            </motion.div>

            <motion.div variants={staggerItem} className="relative">
              <h1 className="relative font-display text-display font-bold leading-[0.86] tracking-[-0.04em]">
                <span className="text-sheen drop-shadow-[0_0_60px_rgba(168,85,247,0.45)]">
                  {(profile.name || 'Natsu').toUpperCase()}
                </span>
              </h1>
              <div className="mt-2 flex items-center gap-2" aria-hidden="true">
                <Sparkle size={10} className="text-accent-fuchsia/80" />
                <span className="h-px w-24 bg-gradient-to-r from-accent-fuchsia/60 to-transparent" />
              </div>
            </motion.div>

            <motion.div variants={staggerItem} className="space-y-3">
              <h2 className="font-display text-2xl font-medium leading-tight text-haze-100 sm:text-3xl">
                Frontend Developer
                <span className="mx-2 text-accent-violet">&amp;</span>
                Anime Creator
              </h2>
              <p className="max-w-md text-sm leading-relaxed text-haze-300 sm:text-[0.95rem]">
                {profile.bio}
              </p>
            </motion.div>

            <motion.ul variants={staggerItem} className="flex flex-wrap gap-2">
              {profile.techPills.map((pill) => (
                <li key={pill}>
                  <Pill>
                    {pill}
                    <Sparkle size={7} className="text-accent-fuchsia/70" />
                  </Pill>
                </li>
              ))}
            </motion.ul>

            <motion.div variants={staggerItem} className="flex flex-wrap items-center gap-3">
              <Button
                to="/projects"
                size="lg"
                iconRight={
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                }
              >
                View My Work
              </Button>
              <Button
                to="/about"
                variant="secondary"
                size="lg"
                iconLeft={<Play className="h-3.5 w-3.5" />}
              >
                Watch Intro
              </Button>
            </motion.div>

            <motion.div
              variants={staggerItem}
              className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-1"
            >
              {profile.availableForWork && profile.availabilityLabel && (
                <StatusDot label={profile.availabilityLabel} />
              )}

              {profile.stats.length > 0 && (
                <div className="flex items-center gap-5">
                  {profile.stats.slice(0, 2).map((stat) => (
                    <div key={stat.id} className="flex items-baseline gap-1.5">
                      <span className="font-display text-xl text-haze-100">
                        {stat.value}
                        {stat.suffix}
                      </span>
                      <span className="text-2xs uppercase tracking-[0.14em] text-haze-400">
                        {stat.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>

          {/* ---------------- Artwork column ---------------- */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            className="relative order-last mx-auto w-full max-w-[34rem] lg:order-none lg:max-w-none"
          >
            <motion.div style={{ x: artworkX, y: artworkY }} className="relative">
              <HeroArtwork
                imageUrl={profile.heroImageUrl}
                alt={`${profile.name} artwork`}
                name={profile.name}
              />

              {/* Widgets — desktop/tablet only, positioned around the artwork */}
              {headlineProject && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute left-0 top-[8%] hidden animate-float-soft sm:block lg:-left-6"
                >
                  <CurrentlyBuilding
                    title={headlineProject.title}
                    category={headlineProject.category}
                  />
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 1.05, ease: [0.22, 1, 0.36, 1] }}
                className="absolute right-0 top-[26%] hidden animate-float lg:-right-4 xl:block"
              >
                <StatusCard statuses={['Building', 'Creating', 'Exploring']} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="absolute bottom-[6%] left-0 z-30 hidden animate-float-slow sm:block lg:-left-8"
              >
                <MusicWidget
                  title={profile.musicTrackTitle}
                  artist={profile.musicTrackArtist}
                  src={profile.musicAudioUrl}
                  cover={profile.musicCoverUrl}
                />
              </motion.div>

              {/* Vertical Japanese annotation */}
              <div className="absolute -right-2 top-[52%] hidden lg:block" aria-hidden="true">
                <p className="writing-vertical jp text-xs text-haze-400/80">世界を少し美しく</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* ---------------- Below-fold strip ---------------- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.3 }}
          className="mt-14 flex flex-col gap-6 border-t border-white/[0.06] pt-8 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2.5">
              {profile.socialLinks.slice(0, 4).map((link) => (
                <span
                  key={link.id}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-ink-700 text-haze-300 shadow-[0_0_0_3px_rgba(7,7,17,1)]"
                >
                  <Icon name={link.icon} size={13} />
                </span>
              ))}
            </div>
            <p className="text-xs text-haze-400">
              {truncate(profile.headline ?? 'Building anime-flavoured web experiences.', 62)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {headlineProject?.technologies.slice(0, 4).map((technology) => (
              <span
                key={technology.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1 text-2xs uppercase tracking-[0.14em] text-haze-400"
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: technology.color ?? '#A855F7' }}
                />
                {technology.name}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
