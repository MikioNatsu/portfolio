import { useRef } from 'react';
import { CircleX, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

/** iOS search field: grey capsule, magnifier, clear button while typing. */
export function SearchField({
  value,
  onChange,
  placeholder = 'Search',
  label,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Accessible name. */
  label: string;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={cn('relative', className)}>
      <Search
        className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-sys-secondary"
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && value) {
            event.preventDefault();
            onChange('');
          }
        }}
        placeholder={placeholder}
        aria-label={label}
        className="h-9 w-full rounded-[10px] bg-sys-fill-3 pl-8 pr-8 text-base text-sys-label placeholder:text-sys-secondary transition-shadow duration-200 focus:outline-none focus:ring-4 focus:ring-sys-accent/20 sm:text-sm"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange('');
            inputRef.current?.focus();
          }}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full text-sys-tertiary transition-colors hover:text-sys-secondary"
        >
          <CircleX className="h-4 w-4 fill-current stroke-sys-surface" />
        </button>
      )}
    </div>
  );
}
