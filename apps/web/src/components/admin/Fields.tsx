import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { SPRING_SNAPPY } from '@/animations/variants';
import { Textarea } from '@/components/ui/Field';
import { cn, isHexColor, parseLines, splitTokens } from '@/lib/utils';

const LABEL = 'text-[13px] font-medium text-sys-secondary';
const HINT = 'text-xs text-sys-secondary';
const ERROR = 'text-xs font-medium text-sys-red-ink';
const FIELD_FRAME =
  'rounded-[10px] border border-sys-field-border bg-sys-field transition-[border-color,box-shadow] duration-200';
const FIELD_FOCUS_WITHIN =
  'focus-within:border-sys-accent focus-within:ring-4 focus-within:ring-sys-accent/20';
const FIELD_FOCUS =
  'focus:border-sys-accent focus:outline-none focus:ring-4 focus:ring-sys-accent/20';

/** Swatch + hex input. The swatch opens the native colour picker. */
export function ColorField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
}) {
  const id = useId();
  const valid = isHexColor(value);

  return (
    <div className="space-y-2">
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      <div className="flex items-center gap-2.5">
        <span
          className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.12)] transition-colors duration-300"
          style={{ backgroundColor: valid ? value : 'transparent' }}
        >
          <input
            type="color"
            aria-label={`${label} picker`}
            value={valid ? value.toLowerCase() : '#a855f7'}
            onChange={(event) => onChange(event.target.value.toUpperCase())}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </span>
        <input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value.trim())}
          spellCheck={false}
          aria-invalid={!valid}
          aria-describedby={`${id}-message`}
          className={cn(
            FIELD_FRAME,
            FIELD_FOCUS,
            'w-full px-3 py-2 font-mono text-base uppercase text-sys-label sm:text-sm',
            !valid && 'border-sys-red',
          )}
        />
      </div>
      <p id={`${id}-message`} className={valid ? HINT : ERROR}>
        {valid ? hint : 'Use a six-digit hex colour, e.g. #A855F7.'}
      </p>
    </div>
  );
}

/**
 * Token field for short string lists (technologies, keywords). Enter or a
 * comma adds; Backspace on an empty field removes the last token; pasting a
 * comma-separated list adds every entry. Duplicates are ignored.
 */
export function TagInput({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  hint?: string;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState('');

  const add = (raw: string) => {
    const next = [...value];
    for (const token of splitTokens(raw)) {
      if (!next.some((existing) => existing.toLowerCase() === token.toLowerCase()))
        next.push(token);
    }
    if (next.length !== value.length) onChange(next);
    setDraft('');
  };

  const remove = (index: number) => onChange(value.filter((_, position) => position !== index));

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      add(draft);
    } else if (event.key === 'Backspace' && !draft && value.length > 0) {
      remove(value.length - 1);
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      <div
        className={cn(
          FIELD_FRAME,
          FIELD_FOCUS_WITHIN,
          'flex min-h-[38px] flex-wrap items-center gap-1.5 p-1.5',
        )}
        onClick={() => inputRef.current?.focus()}
      >
        <AnimatePresence initial={false}>
          {value.map((token, index) => (
            <motion.span
              key={token}
              layout
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.12 } }}
              transition={SPRING_SNAPPY}
              className="inline-flex items-center gap-1 rounded-full bg-sys-accent/[0.12] py-0.5 pl-2.5 pr-1 text-[13px] font-medium text-sys-accent"
            >
              {token}
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  remove(index);
                }}
                aria-label={`Remove ${token}`}
                className="flex h-4 w-4 items-center justify-center rounded-full transition-colors hover:bg-sys-accent/20"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
        <input
          ref={inputRef}
          id={id}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => draft.trim() && add(draft)}
          onPaste={(event) => {
            const text = event.clipboardData.getData('text');
            if (text.includes(',')) {
              event.preventDefault();
              add(text);
            }
          }}
          placeholder={value.length === 0 ? placeholder : 'Add…'}
          aria-describedby={hint ? `${id}-hint` : undefined}
          className="min-w-[7rem] flex-1 bg-transparent px-1.5 py-0.5 text-base text-sys-label placeholder:text-sys-tertiary focus:outline-none sm:text-sm"
        />
      </div>
      {hint && (
        <p id={`${id}-hint`} className={HINT}>
          {hint}
        </p>
      )}
    </div>
  );
}

/**
 * One-entry-per-line list editor. The raw text is kept locally so spaces and
 * blank lines survive while typing; the parent only ever sees clean entries.
 */
export function LinesInput({
  label,
  value,
  onChange,
  placeholder,
  hint,
  rows = 5,
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  hint?: string;
  rows?: number;
}) {
  const [text, setText] = useState(() => value.join('\n'));

  // Adopt external changes (loading a record, discarding edits).
  useEffect(() => {
    setText((current) =>
      JSON.stringify(parseLines(current)) === JSON.stringify(value) ? current : value.join('\n'),
    );
  }, [value]);

  return (
    <Textarea
      label={label}
      hint={hint}
      rows={rows}
      value={text}
      placeholder={placeholder}
      onChange={(event) => {
        setText(event.target.value);
        onChange(parseLines(event.target.value));
      }}
    />
  );
}
