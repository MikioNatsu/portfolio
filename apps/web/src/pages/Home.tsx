import { Hero } from '@/sections/Hero';
import { FeaturedProjects } from '@/sections/FeaturedProjects';
import { About } from '@/sections/About';
import { Skills } from '@/sections/Skills';
import { ExperienceSection } from '@/sections/Experience';
import { ContactCTA } from '@/sections/ContactCTA';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useProfile, useSettings } from '@/hooks/useContent';
import { personSchema, websiteSchema } from '@/lib/seo';

export default function Home() {
  const { profile } = useProfile();
  const { settings } = useSettings();

  usePageMeta({
    title: settings.siteTitle,
    description: settings.siteDescription,
    keywords: settings.seoKeywords,
    image: settings.ogImageUrl ?? profile.avatarUrl,
    jsonLd: [personSchema(profile), websiteSchema(settings)],
  });

  return (
    <>
      <Hero />
      <FeaturedProjects />
      <About />
      <Skills />
      <ExperienceSection limit={4} />
      <ContactCTA />
    </>
  );
}
