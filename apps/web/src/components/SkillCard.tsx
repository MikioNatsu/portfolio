import type { Skill } from '@natsu/types';
import { TechGlyph } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

export function SkillCard({ skill, className }: { skill: Skill; className?: string }) {
  const accent = skill.color ?? '#A855F7';

  return (
    <div
      className={cn(
        'group/skill relative overflow-hidden rounded-2xl border border-white/[0.07] bg-ink-800/55 p-4 backdrop-blur-xl transition-all duration-500 ease-cinematic',
        'hover:-translate-y-1.5 hover:border-white/[0.16] hover:shadow-card',
        className,
      )}
      style={{ ['--accent' as string]: accent }}
    >
      {/* Rotating conic gradient revealed on hover */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-[40%] opacity-0 transition-opacity duration-700 group-hover/skill:opacity-100"
      >
        <span
          className="absolute inset-0 animate-spin-slower"
          style={{
            background: `conic-gradient(from 0deg, transparent 0deg, ${accent}22 60deg, transparent 140deg)`,
          }}
        />
      </span>

      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/skill:opacity-100"
        style={{
          background: `radial-gradient(140px circle at 50% 0%, ${accent}26, transparent 70%)`,
        }}
      />

      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <span className="transition-transform duration-500 ease-cinematic group-hover/skill:scale-110">
            <TechGlyph name={skill.name} slug={skill.slug} color={accent} size={40} />
          </span>
          <span className="rounded-full border border-white/[0.07] bg-white/[0.03] px-2 py-0.5 text-2xs uppercase tracking-[0.14em] text-haze-400">
            {skill.category}
          </span>
        </div>

        <div className="space-y-1">
          <h3 className="font-display text-base text-haze-100">{skill.name}</h3>
          {skill.description && (
            <p className="line-clamp-2 text-xs leading-relaxed text-haze-400">
              {skill.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
