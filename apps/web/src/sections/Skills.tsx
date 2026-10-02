import { SectionHeading } from '@/components/ui/SectionHeading';
import { RevealGroup, RevealItem, Section } from '@/components/ui/Reveal';
import { SkillCard } from '@/components/SkillCard';
import { SkeletonGrid } from '@/components/ui/States';
import { useSkills } from '@/hooks/useContent';

export function Skills() {
  const { skills, isLoading } = useSkills();

  const categories = Array.from(new Set(skills.map((skill) => skill.category)));

  return (
    <Section id="skills" className="scroll-mt-28">
      <div className="shell">
        <SectionHeading
          label="Skills"
          jp="スキル"
          title="Tools I build with"
          description="A focused stack — deep on the frontend, comfortable across the API and the tooling around it."
          action={{ label: 'Always learning new things', to: '/about' }}
        />

        <div className="mt-10 sm:mt-12">
          {isLoading ? (
            <SkeletonGrid count={8} className="lg:grid-cols-5" />
          ) : (
            <>
              <RevealGroup
                stagger={0.06}
                className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5"
              >
                {skills.map((skill) => (
                  <RevealItem key={skill.id}>
                    <SkillCard skill={skill} />
                  </RevealItem>
                ))}
              </RevealGroup>

              {categories.length > 1 && (
                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/[0.06] pt-6">
                  {categories.map((category) => (
                    <span
                      key={category}
                      className="inline-flex items-center gap-2 text-2xs uppercase tracking-[0.18em] text-haze-400"
                    >
                      <span className="h-1 w-1 rounded-full bg-accent-violet/70" />
                      {category}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Section>
  );
}
