import { motion } from 'framer-motion';
import { ArrowUpRight, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Sparkle } from '@/components/layout/Logomark';
import { SmartImage } from '@/components/ui/SmartImage';
import { Section } from '@/components/ui/Reveal';
import { useProfile } from '@/hooks/useContent';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { trackSocialClick } from '@/hooks/useAnalytics';
import { EASE_CINEMATIC, viewportOnce } from '@/animations/variants';

/** Cinematic closing CTA used on the home page and reused on /contact. */
export function ContactCTA({ compact = false }: { compact?: boolean }) {
  const { profile } = useProfile();
  const reduceMotion = usePrefersReducedMotion();

  return (
    <Section id="contact-cta" className="scroll-mt-28 pb-8">
      <div className="shell">
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 30 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.9, ease: EASE_CINEMATIC }}
          className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-ink-800/60 backdrop-blur-2xl sm:rounded-[2.5rem]"
        >
          {/* Background art */}
          <div className="absolute inset-0" aria-hidden="true">
            <SmartImage
              src={profile.heroImageUrl}
              alt=""
              label="Natsu"
              accent="#EC4899"
              aspect="aspect-auto h-full w-full"
              seed={29}
              className="h-full w-full opacity-[0.22]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/85 to-ink-950/40" />
            <div className="absolute inset-0 grid-bg opacity-20" />
            <div
              className="absolute -right-20 -top-24 h-80 w-80 rounded-full blur-[120px]"
              style={{
                background: 'radial-gradient(circle, rgba(236,72,153,0.45), transparent 70%)',
              }}
            />
          </div>

          <div className="relative grid gap-10 p-7 sm:p-10 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:p-14">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="h-1 w-1 rounded-full bg-accent-violet shadow-glow-sm" />
                <span className="label">Get in touch</span>
                <Sparkle size={9} className="text-accent-fuchsia/80" />
              </div>

              <h2 className="font-display text-[clamp(2.1rem,5.4vw,3.75rem)] font-semibold leading-[1.02] tracking-tight text-haze-100">
                Let&apos;s Create
                <br />
                <span className="text-aurora">Something Amazing</span>
                <br />
                Together
              </h2>

              <p className="max-w-md text-sm leading-relaxed text-haze-300 sm:text-base">
                Open to collaborations, freelance work and interesting frontend problems. If you
                have an idea that deserves a beautiful interface, I&apos;d love to hear it.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  to="/contact"
                  size="lg"
                  iconRight={
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  }
                >
                  Let&apos;s Talk
                </Button>
                <Button to="/projects" variant="outline" size="lg">
                  View My Work
                </Button>
              </div>
            </div>

            {!compact && (
              <div className="space-y-5">
                {profile.email && (
                  <a
                    href={`mailto:${profile.email}`}
                    className="group flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 transition-all duration-400 hover:-translate-y-0.5 hover:border-accent-violet/40"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent-violet/30 bg-accent-violet/12 text-accent-fuchsia">
                      <Mail className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-2xs uppercase tracking-[0.18em] text-haze-400">
                        Email
                      </span>
                      <span className="block truncate text-sm text-haze-100">{profile.email}</span>
                    </span>
                    <ArrowUpRight className="ml-auto h-4 w-4 text-haze-400 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                )}

                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
                  <p className="text-2xs uppercase tracking-[0.18em] text-haze-400">Find me on</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {profile.socialLinks.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label={link.label}
                        onClick={() => trackSocialClick(link.label, link.url)}
                        className="flex h-9 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 text-2xs uppercase tracking-[0.14em] text-haze-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-violet/45 hover:text-white"
                      >
                        <Icon name={link.icon} size={13} />
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>

                <p className="jp text-2xs text-haze-400/80">
                  「一緒に何かすごいものを作りましょう」
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </Section>
  );
}
