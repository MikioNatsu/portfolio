import { Clock, Mail, MapPin } from 'lucide-react';
import { ContactForm } from '@/components/ContactForm';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Section } from '@/components/ui/Reveal';
import { Icon } from '@/components/ui/Icon';
import { StatusDot } from '@/components/ui/Badge';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useProfile } from '@/hooks/useContent';
import { trackSocialClick } from '@/hooks/useAnalytics';
import { breadcrumbSchema } from '@/lib/seo';
import { SITE_NAME } from '@/lib/constants';

export default function ContactPage() {
  const { profile } = useProfile();

  usePageMeta({
    title: `Contact — ${SITE_NAME}`,
    description:
      'Open to collaborations, freelance work and interesting frontend problems. Send a message and I will reply.',
    jsonLd: breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Contact', path: '/contact' },
    ]),
  });

  return (
    <Section className="pt-6 sm:pt-8">
      <div className="shell">
        <SectionHeading
          label="Contact"
          jp="お問い合わせ"
          title="Let's talk about your idea"
          description="Fill in the form and it lands straight in my inbox. No newsletters, no CRM — just a message."
        />

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14">
          <div className="rounded-[2rem] border border-white/[0.07] bg-ink-800/55 p-6 backdrop-blur-2xl sm:p-8">
            <ContactForm />
          </div>

          <aside className="space-y-5">
            {profile.email && (
              <a
                href={`mailto:${profile.email}`}
                className="group flex items-center gap-4 rounded-3xl border border-white/[0.07] bg-white/[0.02] p-5 transition-all duration-400 hover:-translate-y-1 hover:border-accent-violet/35"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent-violet/30 bg-accent-violet/12 text-accent-fuchsia">
                  <Mail className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-2xs uppercase tracking-[0.18em] text-haze-400">
                    Email
                  </span>
                  <span className="block truncate text-sm text-haze-100">{profile.email}</span>
                </span>
              </a>
            )}

            {profile.location && (
              <div className="flex items-center gap-4 rounded-3xl border border-white/[0.07] bg-white/[0.02] p-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-haze-300">
                  <MapPin className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-2xs uppercase tracking-[0.18em] text-haze-400">
                    Based in
                  </span>
                  <span className="block text-sm text-haze-100">{profile.location}</span>
                </span>
              </div>
            )}

            <div className="flex items-center gap-4 rounded-3xl border border-white/[0.07] bg-white/[0.02] p-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-haze-300">
                <Clock className="h-4 w-4" />
              </span>
              <span className="space-y-1">
                <span className="block text-2xs uppercase tracking-[0.18em] text-haze-400">
                  Availability
                </span>
                {profile.availableForWork ? (
                  <StatusDot label={profile.availabilityLabel ?? 'Available for collaboration'} />
                ) : (
                  <span className="text-sm text-haze-300">Currently unavailable</span>
                )}
              </span>
            </div>

            <div className="rounded-3xl border border-white/[0.07] bg-white/[0.02] p-5">
              <p className="label">Elsewhere</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.socialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={link.label}
                    onClick={() => trackSocialClick(link.label, link.url)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-haze-400 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-violet/50 hover:text-white"
                  >
                    <Icon name={link.icon} size={16} />
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </Section>
  );
}
