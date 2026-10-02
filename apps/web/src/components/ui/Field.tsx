import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';
import { cn } from '@/lib/utils';

const CONTROL =
  'w-full rounded-2xl border border-white/10 bg-ink-800/70 px-4 py-3 text-sm text-haze-100 placeholder:text-haze-400/70 transition-all duration-300 ease-cinematic focus:border-accent-violet/60 focus:bg-ink-800 focus:outline-none focus:ring-4 focus:ring-accent-violet/12 disabled:cursor-not-allowed disabled:opacity-50';

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
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor={id}
          className="text-xs font-medium uppercase tracking-[0.16em] text-haze-300"
        >
          {label}
          {required && <span className="ml-1 text-accent-pink">*</span>}
        </label>
        {hint && <span className="text-2xs text-haze-400">{hint}</span>}
      </div>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-rose-300">
          {error}
        </p>
      )}
    </div>
  );
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
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={cn(CONTROL, error && 'border-rose-400/60 focus:ring-rose-400/15', className)}
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
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={cn(
          CONTROL,
          'resize-y leading-relaxed',
          error && 'border-rose-400/60 focus:ring-rose-400/15',
          className,
        )}
        {...rest}
      />
    </FieldShell>
  );
});

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
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
      <select
        ref={ref}
        id={fieldId}
        required={required}
        aria-invalid={Boolean(error)}
        className={cn(CONTROL, 'appearance-none bg-ink-800 pr-10', className)}
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-ink-800">
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
});

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

/** Accessible toggle (admin panel). */
export function Switch({ checked, onChange, label, description, disabled }: SwitchProps) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-3">
      <div className="space-y-0.5">
        <label htmlFor={id} className="block text-sm font-medium text-haze-100">
          {label}
        </label>
        {description && <p className="text-xs text-haze-400">{description}</p>}
      </div>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        aria-label={label}
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
