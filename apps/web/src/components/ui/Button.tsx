import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Action } from './Action';
import { useSkin, type Skin } from './skin';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'subtle';
type Size = 'sm' | 'md' | 'lg' | 'icon';

interface SkinClasses {
  base: string;
  variants: Record<Variant, string>;
  sizes: Record<Size, string>;
}

const SKINS: Record<Skin, SkinClasses> = {
  cinematic: {
    base: 'group relative inline-flex select-none items-center justify-center rounded-full font-medium tracking-wide transition-all duration-300 ease-cinematic disabled:pointer-events-none disabled:opacity-50',
    variants: {
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
    },
    sizes: {
      sm: 'h-9 gap-2 px-4 text-xs',
      md: 'h-11 gap-2.5 px-5 text-sm',
      lg: 'h-13 gap-3 px-7 text-sm sm:text-[0.95rem]',
      icon: 'h-10 w-10 justify-center',
    },
  },
  /* Apple-style button roles: filled, gray, tinted, plain and destructive. */
  system: {
    base: 'group relative inline-flex select-none items-center justify-center whitespace-nowrap rounded-full font-medium transition-[background-color,color,box-shadow,transform,filter,opacity] duration-200 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40',
    variants: {
      primary:
        'bg-sys-accent-fill text-white shadow-[0_1px_2px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.12)] hover:brightness-110',
      secondary: 'bg-sys-fill-3 text-sys-label hover:bg-sys-fill-2',
      subtle: 'bg-sys-fill-3 text-sys-label hover:bg-sys-fill-2',
      outline: 'bg-sys-accent/[0.12] text-sys-accent hover:bg-sys-accent/[0.18]',
      ghost: 'text-sys-accent hover:bg-sys-accent/10',
      danger: 'bg-sys-red/[0.12] text-sys-red-ink hover:bg-sys-red/[0.18]',
    },
    sizes: {
      sm: 'h-8 gap-1.5 px-3.5 text-[13px]',
      md: 'h-9 gap-2 px-4 text-sm',
      lg: 'h-11 gap-2 px-5 text-[15px]',
      icon: 'h-9 w-9 justify-center',
    },
  },
};

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
  const skin = SKINS[useSkin()];
  const classes = cn(
    skin.base,
    skin.variants[variant],
    skin.sizes[size],
    fullWidth && 'w-full',
    className,
  );

  return (
    <Action ref={ref} className={classes} disabled={disabled || loading} {...rest}>
      {loading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : iconLeft}
      {children}
      {!loading && iconRight}
    </Action>
  );
});
