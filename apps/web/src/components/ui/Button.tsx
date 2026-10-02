import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import { cn, isExternalUrl } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'subtle';
type Size = 'sm' | 'md' | 'lg' | 'icon';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-accent-purple via-accent-violet to-accent-pink text-white shadow-[0_16px_40px_-16px_rgba(168,85,247,0.9)] hover:shadow-[0_22px_60px_-18px_rgba(236,72,153,0.85)] hover:brightness-110',
  secondary:
    'glass text-haze-100 hover:border-accent-violet/45 hover:bg-white/[0.07] hover:shadow-glow-sm',
  outline:
    'border border-accent-violet/35 bg-transparent text-haze-100 hover:border-accent-violet/70 hover:bg-accent-violet/10',
  ghost: 'text-haze-200 hover:bg-white/[0.06] hover:text-white',
  subtle: 'bg-white/[0.05] text-haze-200 hover:bg-white/[0.09] hover:text-white',
  danger:
    'border border-rose-500/40 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20 hover:border-rose-400/60',
};

const SIZES: Record<Size, string> = {
  sm: 'h-9 gap-2 px-4 text-xs',
  md: 'h-11 gap-2.5 px-5 text-sm',
  lg: 'h-13 gap-3 px-7 text-sm sm:text-[0.95rem]',
  icon: 'h-10 w-10 justify-center',
};

const BASE =
  'group relative inline-flex select-none items-center justify-center rounded-full font-medium tracking-wide transition-all duration-300 ease-cinematic disabled:pointer-events-none disabled:opacity-50';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  to?: string;
  href?: string;
  loading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

/**
 * The single button primitive for the whole app.
 * Renders a `<button>`, a react-router `<Link>` or an `<a>` depending on props —
 * so an action never loses its button semantics or accessibility.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    to,
    href,
    loading = false,
    iconLeft,
    iconRight,
    fullWidth,
    className,
    children,
    disabled,
    ...rest
  },
  ref,
) {
  const classes = cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && 'w-full', className);

  const content = (
    <>
      {loading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : iconLeft}
      {children}
      {!loading && iconRight}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} aria-disabled={disabled}>
        {content}
      </Link>
    );
  }

  if (href) {
    const external = isExternalUrl(href);
    return (
      <a
        href={href}
        className={classes}
        {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
      >
        {content}
      </a>
    );
  }

  return (
    <button ref={ref} className={classes} disabled={disabled || loading} {...rest}>
      {content}
    </button>
  );
});
