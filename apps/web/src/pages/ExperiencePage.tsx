import { ExperienceSection } from '@/sections/Experience';
import { Skills } from '@/sections/Skills';
import { ContactCTA } from '@/sections/ContactCTA';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Section } from '@/components/ui/Reveal';
import { usePageMeta } from '@/hooks/usePageMeta';
import { breadcrumbSchema } from '@/lib/seo';
import { SITE_NAME } from '@/lib/constants';

export default function ExperiencePage() {
  usePageMeta({
    title: `Experience — ${SITE_NAME}`,
    description:
      'Projects founded, built and shipped — an overview of the work behind the portfolio.',
    jsonLd: breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Experience', path: '/experience' },
    ]),
  });

  return (
    <>
      <Section className="pb-0 pt-6 sm:pt-8">
        <div className="shell">
          <SectionHeading
            label="Experience"
            jp="経験"
            title="The work behind the work"
            description="Every entry below is a project I built — with the role, the stack and what it actually does."
          />
        </div>
      </Section>

      <ExperienceSection showHeading={false} />
      <Skills />
      <ContactCTA compact />
    </>
  );
}
