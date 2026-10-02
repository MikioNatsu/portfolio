import { useId, useRef, type KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { SPRING_SNAPPY } from '@/animations/variants';
import { cn } from '@/lib/utils';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
}

/**
 * Apple segmented control: a radio group whose selection thumb glides between
 * segments. Arrow keys / Home / End move the selection, as in native radios.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  fullWidth,
  size = 'md',
  className,
}: {
  options: ReadonlyArray<SegmentOption<T>>;
  value: T;
  onChange: (value: T) => void;
  /** Accessible name for the group. */
  label: string;
  fullWidth?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const thumbId = useId();
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const select = (index: number) => {
    const count = options.length;
    const next = options[(index + count) % count];
    if (!next) return;
    onChange(next.value);
    refs.current[(index + count) % count]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const keys: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowDown: index + 1,
      ArrowLeft: index - 1,
      ArrowUp: index - 1,
      Home: 0,
      End: options.length - 1,
    };
    const target = keys[event.key];
    if (target === undefined) return;
    event.preventDefault();
    select(target);
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        'relative inline-flex rounded-[9px] bg-sys-fill-3 p-0.5',
        fullWidth && 'flex w-full',
        className,
      )}
    >
      {options.map((option, index) => {
        const selected = option.value === value;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={cn(
              'relative z-0 inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-[7px] font-medium text-sys-label transition-colors duration-200',
              size === 'sm' ? 'h-7 px-2.5 text-[12px]' : 'h-8 px-3.5 text-[13px]',
              fullWidth && 'flex-1',
              !selected && 'hover:text-sys-label/80',
            )}
          >
            {selected && (
              <motion.span
                layoutId={thumbId}
                className="absolute inset-0 -z-10 rounded-[7px] bg-sys-thumb shadow-[0_3px_8px_rgba(0,0,0,0.12),0_0_0_0.5px_rgba(0,0,0,0.04)]"
                transition={SPRING_SNAPPY}
              />
            )}
            {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
