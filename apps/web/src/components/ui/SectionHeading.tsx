import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Reveal } from './Reveal';

interface SectionHeadingProps {
  label: string;
  title: ReactNode;
  jp?: string;
  description?: string;
  action?: { label: string; to: string };
  align?: 'left' | 'center';
  className?: string;
}

/** The recurring editorial section header: eyebrow label + serif title. */
export function SectionHeading({
  label,
  title,
  jp,
  description,
  action,
  align = 'left',
  className,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        'flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between',
        align === 'center' && 'sm:flex-col sm:items-center sm:text-center',
        className,
      )}
    >
      <div className={cn('max-w-2xl space-y-4', align === 'center' && 'mx-auto text-center')}>
        <div className={cn('flex items-center gap-3', align === 'center' && 'justify-center')}>
          <span className="h-1 w-1 rounded-full bg-accent-violet shadow-glow-sm" />
          <span className="label">{label}</span>
          {jp && <span className="jp text-2xs text-accent-fuchsia/60">{jp}</span>}
        </div>

        <h2 className="font-display text-section-title font-semibold text-haze-100">{title}</h2>

        {description && (
          <p className="max-w-xl text-sm leading-relaxed text-haze-300 sm:text-base">
            {description}
          </p>
        )}
      </div>

      {action && (
        <Link
          to={action.to}
          className="group inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-haze-300 transition-all duration-300 hover:border-accent-violet/45 hover:text-white sm:self-auto"
        >
          {action.label}
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      )}
    </Reveal>
  );
}
