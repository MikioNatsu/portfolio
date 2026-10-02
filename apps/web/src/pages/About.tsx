import { About } from '@/sections/About';
import { Skills } from '@/sections/Skills';
import { ExperienceSection } from '@/sections/Experience';
import { ContactCTA } from '@/sections/ContactCTA';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Section } from '@/components/ui/Reveal';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useProfile } from '@/hooks/useContent';
import { breadcrumbSchema, personSchema } from '@/lib/seo';
import { SITE_NAME } from '@/lib/constants';

export default function AboutPage() {
  const { profile } = useProfile();

  usePageMeta({
    title: `About — ${SITE_NAME} · ${profile.role}`,
    description: profile.bio,
    type: 'profile',
    image: profile.avatarUrl,
    jsonLd: [
      personSchema(profile),
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
      ]),
    ],
  });

  return (
    <>
      <Section className="pb-0 pt-6 sm:pt-8">
        <div className="shell">
          <SectionHeading
            label="Profile"
            jp="プロフィール"
            title={
              <>
                The person behind
                <br />
                the interface
              </>
            }
            description="Frontend developer, anime creator, and someone who cares far too much about easing curves."
          />
        </div>
      </Section>

      <About detailed />
      <Skills />
      <ExperienceSection />
      <ContactCTA />
    </>
  );
}
