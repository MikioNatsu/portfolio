import { cn } from '@/lib/utils';

/** Four-point sparkle used across the brand mark and decorative accents. */
export function Sparkle({ className, size = 14 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={cn('shrink-0', className)}
      aria-hidden="true"
    >
      <path
        d="M12 0c.9 6.6 4.5 10.2 12 12-7.5 1.8-11.1 5.4-12 12-.9-6.6-4.5-10.2-12-12C7.5 10.2 11.1 6.6 12 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

interface LogomarkProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  withSparkle?: boolean;
}

/** Wordmark: editorial serif "Natsu" with a neon sparkle. */
export function Logomark({ className, size = 'md', withSparkle = true }: LogomarkProps) {
  const scale = {
    sm: 'text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
  } as const;

  return (
    <span className={cn('inline-flex items-center gap-2 select-none', className)}>
      {withSparkle && (
        <Sparkle
          size={size === 'lg' ? 14 : 11}
          className="text-accent-fuchsia drop-shadow-[0_0_10px_rgba(240,171,252,0.8)]"
        />
      )}
      <span
        className={cn(
          'font-display font-semibold italic tracking-tight text-haze-100',
          scale[size],
        )}
      >
        Natsu
      </span>
    </span>
  );
}
