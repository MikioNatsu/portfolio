import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSkin, type Skin } from './skin';

interface FieldClasses {
  label: string;
  required: string;
  hint: string;
  error: string;
  control: string;
  invalid: string;
  select: string;
}

const FIELD_SKINS: Record<Skin, FieldClasses> = {
  cinematic: {
    label: 'text-xs font-medium uppercase tracking-[0.16em] text-haze-300',
    required: 'ml-1 text-accent-pink',
    hint: 'text-2xs text-haze-400',
    error: 'text-xs text-rose-300',
    control:
      'w-full rounded-2xl border border-white/10 bg-ink-800/70 px-4 py-3 text-sm text-haze-100 placeholder:text-haze-400/70 transition-all duration-300 ease-cinematic focus:border-accent-violet/60 focus:bg-ink-800 focus:outline-none focus:ring-4 focus:ring-accent-violet/12 disabled:cursor-not-allowed disabled:opacity-50',
    invalid: 'border-rose-400/60 focus:ring-rose-400/15',
    select: 'appearance-none bg-ink-800 pr-10',
  },
  system: {
    label: 'text-[13px] font-medium text-sys-secondary',
    required: 'ml-0.5 text-sys-tertiary',
    hint: 'text-xs text-sys-secondary',
    error: 'text-xs font-medium text-sys-red-ink',
    // 16px on small screens stops iOS Safari from zooming into focused fields.
    control:
      'w-full rounded-[10px] border border-sys-field-border bg-sys-field px-3 py-2 text-base text-sys-label placeholder:text-sys-tertiary transition-[border-color,box-shadow,background-color] duration-200 ease-out focus:border-sys-accent focus:outline-none focus:ring-4 focus:ring-sys-accent/20 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm',
    invalid: 'border-sys-red focus:border-sys-red focus:ring-sys-red/20',
    select: 'appearance-none pr-9',
  },
};

function useFieldClasses(): FieldClasses {
  return FIELD_SKINS[useSkin()];
}

interface FieldShellProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

function FieldShell({ id, label, hint, error, required, children, className }: FieldShellProps) {
  const classes = useFieldClasses();
  const showHeader = Boolean(label || hint);

  return (
    <div className={cn('space-y-2', className)}>
      {showHeader && (
        <div className="flex items-baseline justify-between gap-3">
          {label ? (
            <label htmlFor={id} className={classes.label}>
              {label}
              {required && (
                <span className={classes.required} aria-hidden="true">
                  *
                </span>
              )}
            </label>
          ) : (
            <span />
          )}
          {hint && (
            <span id={`${id}-hint`} className={classes.hint}>
              {hint}
            </span>
          )}
        </div>
      )}
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className={classes.error}>
          {error}
        </p>
      )}
    </div>
  );
}

/** `aria-describedby` for a control: its error (when shown) and hint. */
function describedBy(id: string, hint?: string, error?: string): string | undefined {
  const ids = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean);
  return ids.length > 0 ? ids.join(' ') : undefined;
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, className, containerClassName, id, required, ...rest },
  ref,
) {
  const classes = useFieldClasses();
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <FieldShell
      id={fieldId}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={containerClassName}
    >
      <input
        ref={ref}
        id={fieldId}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(fieldId, hint, error)}
        className={cn(classes.control, error && classes.invalid, className)}
        {...rest}
      />
    </FieldShell>
  );
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, className, containerClassName, id, required, rows = 5, ...rest },
  ref,
) {
  const classes = useFieldClasses();
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <FieldShell
      id={fieldId}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={containerClassName}
    >
      <textarea
        ref={ref}
        id={fieldId}
        rows={rows}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(fieldId, hint, error)}
        className={cn(
          classes.control,
          'resize-y leading-relaxed',
          error && classes.invalid,
          className,
        )}
        {...rest}
      />
    </FieldShell>
  );
});

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  hint?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
  containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, options, className, containerClassName, id, required, ...rest },
  ref,
) {
  const skin = useSkin();
  const classes = FIELD_SKINS[skin];
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  const select = (
    <select
      ref={ref}
      id={fieldId}
      required={required}
      aria-invalid={Boolean(error)}
      aria-describedby={describedBy(fieldId, hint, error)}
      className={cn(classes.control, classes.select, error && classes.invalid, className)}
      {...rest}
    >
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          className={skin === 'cinematic' ? 'bg-ink-800' : undefined}
        >
          {option.label}
        </option>
      ))}
    </select>
  );

  return (
    <FieldShell
      id={fieldId}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={containerClassName}
    >
      {skin === 'system' ? (
        // macOS-style pop-up button: the up/down chevron signals a menu.
        <div className="relative">
          {select}
          <ChevronsUpDown
            className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-sys-secondary"
            aria-hidden="true"
          />
        </div>
      ) : (
        select
      )}
    </FieldShell>
  );
});

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

/** Accessible toggle. */
export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
  className,
}: SwitchProps) {
  const skin = useSkin();
  const id = useId();
  const descriptionId = description ? `${id}-description` : undefined;

  if (skin === 'system') {
    return (
      <div
        className={cn(
          'flex items-center justify-between gap-4 rounded-xl bg-sys-fill-4 px-4 py-3',
          disabled && 'opacity-50',
          className,
        )}
      >
        <div className="min-w-0 space-y-0.5">
          <label htmlFor={id} className="block text-sm font-medium text-sys-label">
            {label}
          </label>
          {description && (
            <p id={descriptionId} className="text-xs text-sys-secondary">
              {description}
            </p>
          )}
        </div>
        <button
          type="button"
          id={id}
          role="switch"
          aria-checked={checked}
          aria-describedby={descriptionId}
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className={cn(
            'relative h-[26px] w-[44px] shrink-0 rounded-full transition-colors duration-300 ease-out disabled:cursor-not-allowed',
            checked ? 'bg-sys-accent-fill' : 'bg-sys-fill',
          )}
        >
          <span
            className={cn(
              'absolute left-[2px] top-[2px] h-[22px] w-[22px] rounded-full bg-white shadow-[0_2px_5px_rgba(0,0,0,0.18),0_0_0_0.5px_rgba(0,0,0,0.04)] transition-transform duration-300 ease-springy',
              checked ? 'translate-x-[18px]' : 'translate-x-0',
            )}
          />
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-3',
        className,
      )}
    >
      <div className="space-y-0.5">
        <label htmlFor={id} className="block text-sm font-medium text-haze-100">
          {label}
        </label>
        {description && (
          <p id={descriptionId} className="text-xs text-haze-400">
            {description}
          </p>
        )}
      </div>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        aria-describedby={descriptionId}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative mt-0.5 h-6 w-11 shrink-0 rounded-full border transition-colors duration-300',
          checked
            ? 'border-accent-violet/60 bg-accent-purple/50'
            : 'border-white/10 bg-white/[0.06]',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white shadow transition-all duration-300 ease-cinematic',
            checked ? 'left-[1.4rem]' : 'left-0.5',
          )}
          style={{ height: '1.125rem', width: '1.125rem' }}
        />
      </button>
    </div>
  );
}
