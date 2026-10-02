import { SectionHeading } from '@/components/ui/SectionHeading';
import { Section } from '@/components/ui/Reveal';
import { TimelineItem } from '@/components/TimelineItem';
import { EmptyState, LoadingState } from '@/components/ui/States';
import { useExperience } from '@/hooks/useContent';

interface ExperienceSectionProps {
  limit?: number;
  showHeading?: boolean;
}

export function ExperienceSection({ limit, showHeading = true }: ExperienceSectionProps) {
  const { experience, isLoading } = useExperience();
  const items = limit ? experience.slice(0, limit) : experience;

  return (
    <Section id="experience" className="scroll-mt-28">
      <div className="shell">
        {showHeading && (
          <SectionHeading
            label="Experience"
            jp="経験"
            title="Things I've built"
            description="Projects I founded, designed and shipped — with the role I held on each."
          />
        )}

        <div className="mt-10 sm:mt-12">
          {isLoading ? (
            <LoadingState label="Loading experience" />
          ) : items.length === 0 ? (
            <EmptyState
              title="No experience published yet"
              description="Timeline entries added in the admin panel will appear here."
            />
          ) : (
            <ol className="space-y-6 sm:space-y-7">
              {items.map((item, index) => (
                <TimelineItem
                  key={item.id}
                  item={item}
                  index={index}
                  isLast={index === items.length - 1}
                />
              ))}
            </ol>
          )}
        </div>
      </div>
    </Section>
  );
}
