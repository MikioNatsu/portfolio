import { motion } from 'framer-motion';
import { ArrowUpRight, Quote } from 'lucide-react';
import { SmartImage } from '@/components/ui/SmartImage';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Sparkle } from '@/components/layout/Logomark';
import { Section, RevealGroup, RevealItem } from '@/components/ui/Reveal';
import { useProfile } from '@/hooks/useContent';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { EASE_CINEMATIC, viewportOnce } from '@/animations/variants';

interface AboutSectionProps {
  /** `/about` shows the long biography and the full stat set. */
  detailed?: boolean;
}

export function About({ detailed = false }: AboutSectionProps) {
  const { profile } = useProfile();
  const reduceMotion = usePrefersReducedMotion();
  const isDesktop = useIsDesktop();

  const stats = detailed ? profile.stats : profile.stats.slice(0, 3);

  return (
    <Section id="about" className="scroll-mt-28">
      <div className="shell">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-16">
          {/* ---------------- Portrait ---------------- */}
          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, scale: 0.95, x: -24 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, scale: 1, x: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.95, ease: EASE_CINEMATIC }}
            className="relative mx-auto w-full max-w-md lg:max-w-none"
          >
            <div
              className="pointer-events-none absolute -inset-8 rounded-[3rem] blur-3xl"
              style={{
                background:
                  'radial-gradient(circle at 40% 30%, rgba(168,85,247,0.35), transparent 65%)',
              }}
              aria-hidden="true"
            />

            <div className="relative">
              <SmartImage
                src={profile.avatarUrl}
                alt={`${profile.name} portrait`}
                label={profile.name}
                accent="#A855F7"
                aspect="aspect-[4/5]"
                seed={11}
                sizes="(max-width: 1024px) 90vw, 42vw"
                className="rounded-[2rem] border border-white/[0.09] shadow-[0_50px_120px_-50px_rgba(0,0,0,1)]"
              />

              {/* Decorative frame corners */}
              <span
                aria-hidden="true"
                className="absolute -left-3 -top-3 h-16 w-16 rounded-tl-[2rem] border-l border-t border-accent-violet/40"
              />
              <span
                aria-hidden="true"
                className="absolute -bottom-3 -right-3 h-16 w-16 rounded-br-[2rem] border-b border-r border-accent-pink/40"
              />

              {!reduceMotion && isDesktop && (
                <div className="absolute -right-6 top-8 animate-float-soft">
                  <div className="glass-strong flex items-center gap-2 rounded-2xl px-3 py-2">
                    <Sparkle size={10} className="text-accent-fuchsia" />
                    <span className="text-2xs uppercase tracking-[0.16em] text-haze-300">
                      {profile.location || 'Somewhere online'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* ---------------- Copy ---------------- */}
          <div className="space-y-7">
            <RevealGroup className="space-y-5">
              <RevealItem>
                <div className="flex items-center gap-3">
                  <span className="h-1 w-1 rounded-full bg-accent-violet shadow-glow-sm" />
                  <span className="label">About Me</span>
                  <span className="jp text-2xs text-accent-fuchsia/60">私について</span>
                </div>
              </RevealItem>

              <RevealItem>
                <h2 className="font-display text-section-title font-semibold text-haze-100">
                  {profile.headline || 'Frontend Developer who loves Anime'}
                </h2>
              </RevealItem>

              <RevealItem>
                <p className="max-w-xl text-sm leading-relaxed text-haze-300 sm:text-base">
                  {profile.bio}
                </p>
              </RevealItem>

              {detailed && profile.longBio && (
                <RevealItem>
                  <p className="max-w-xl text-sm leading-relaxed text-haze-400">
                    {profile.longBio}
                  </p>
                </RevealItem>
              )}
            </RevealGroup>

            {stats.length > 0 && (
              <RevealGroup
                stagger={0.08}
                className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4"
              >
                {stats.map((stat) => (
                  <RevealItem key={stat.id}>
                    <div className="group/stat relative h-full overflow-hidden rounded-2xl border border-white/[0.07] bg-ink-800/55 p-4 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-accent-violet/30">
                      <span className="text-accent-fuchsia/80">
                        <Icon name={stat.icon ?? 'sparkles'} size={16} />
                      </span>
                      <p className="mt-3 font-display text-2xl leading-none text-haze-100 sm:text-3xl">
                        {stat.value}
                        <span className="text-accent-violet">{stat.suffix}</span>
                      </p>
                      <p className="mt-1.5 text-2xs uppercase tracking-[0.14em] text-haze-400">
                        {stat.label}
                      </p>
                    </div>
                  </RevealItem>
                ))}
              </RevealGroup>
            )}

            {detailed && profile.longBio && (
              <div className="relative rounded-2xl border-l-2 border-accent-violet/50 bg-white/[0.02] py-4 pl-5 pr-4">
                <Quote className="absolute -left-2.5 -top-2 h-5 w-5 text-accent-violet" />
                <p className="font-display text-base italic leading-relaxed text-haze-200">
                  {profile.tagline || 'アニメで広がる、もっと特別な世界。'}
                </p>
              </div>
            )}

            <RevealGroup className="flex flex-wrap gap-3 pt-1">
              <RevealItem>
                <Button
                  to="/contact"
                  variant="secondary"
                  iconRight={<ArrowUpRight className="h-3.5 w-3.5" />}
                >
                  {detailed ? "Let's work together" : 'More About Me'}
                </Button>
              </RevealItem>
              {!detailed && (
                <RevealItem>
                  <Button to="/about" variant="ghost">
                    Read the full story
                  </Button>
                </RevealItem>
              )}
            </RevealGroup>
          </div>
        </div>
      </div>
    </Section>
  );
}
