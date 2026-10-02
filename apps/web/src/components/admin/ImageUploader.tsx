import { useRef, useState } from 'react';
import { ImagePlus, Link2, LoaderCircle, Trash2, Upload } from 'lucide-react';
import { adminApi, ApiError } from '@/api/client';
import { SmartImage } from '@/components/ui/SmartImage';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
  aspect?: string;
  className?: string;
}

/**
 * Single-image field supporting both an upload (Cloudinary or local disk,
 * whichever the API is configured with) and a direct URL — so the CMS works
 * even before storage credentials exist.
 */
export function ImageUploader({
  label,
  value,
  onChange,
  folder = 'general',
  aspect = 'aspect-[16/10]',
  className,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrl, setShowUrl] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const result = await adminApi.upload(file, folder);
      onChange(result.url);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Upload failed.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs font-medium uppercase tracking-[0.16em] text-haze-300">
          {label}
        </span>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="inline-flex items-center gap-1 text-2xs uppercase tracking-[0.14em] text-rose-300 hover:text-rose-200"
          >
            <Trash2 className="h-3 w-3" />
            Remove
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
        <SmartImage
          src={value}
          alt={label}
          label={label}
          accent="#A855F7"
          aspect={aspect}
          className="bg-ink-900/60"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif,image/svg+xml"
          className="hidden"
          onChange={(event) => void onFile(event.target.files?.[0])}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          iconLeft={
            uploading ? (
              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="h-3.5 w-3.5" />
            )
          }
        >
          {uploading ? 'Uploading' : 'Upload'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowUrl((open) => !open)}
          iconLeft={<Link2 className="h-3.5 w-3.5" />}
        >
          Use URL
        </Button>
      </div>

      {showUrl && (
        <div className="flex items-end gap-2">
          <Input
            label="Image URL"
            placeholder="https://…"
            value={urlDraft}
            onChange={(event) => setUrlDraft(event.target.value)}
            containerClassName="flex-1"
          />
          <Button
            type="button"
            size="sm"
            onClick={() => {
              onChange(urlDraft.trim() || null);
              setUrlDraft('');
              setShowUrl(false);
            }}
            iconLeft={<ImagePlus className="h-3.5 w-3.5" />}
          >
            Apply
          </Button>
        </div>
      )}

      {error && (
        <p role="alert" className="text-xs text-rose-300">
          {error}
        </p>
      )}
    </div>
  );
}

interface StringListInputProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  hint?: string;
  /** Renders each entry with its own button instead of a textarea. */
  multiline?: boolean;
  rows?: number;
}

/**
 * List editor for simple string arrays (features, tech names, keywords).
 * Stored as one entry per line — quick to edit, impossible to get wrong.
 */
export function StringListInput({
  label,
  value,
  onChange,
  placeholder,
  hint,
  multiline = true,
}: StringListInputProps) {
  const [draft, setDraft] = useState('');

  const remove = (index: number) => onChange(value.filter((_, position) => position !== index));

  if (!multiline) {
    const add = () => {
      const next = draft.trim();
      if (!next) return;
      onChange([...value, next]);
      setDraft('');
    };

    return (
      <div className="space-y-2">
        <span className="text-xs font-medium uppercase tracking-[0.16em] text-haze-300">
          {label}
        </span>
        <div className="flex items-end gap-2">
          <Input
            label=""
            placeholder={placeholder}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                add();
              }
            }}
            containerClassName="flex-1"
          />
          <Button type="button" size="sm" onClick={add}>
            Add
          </Button>
        </div>
        {value.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {value.map((entry, index) => (
              <span
                key={`${entry}-${index}`}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-haze-200"
              >
                {entry}
                <button
                  type="button"
                  onClick={() => remove(index)}
                  aria-label={`Remove ${entry}`}
                  className="text-haze-400 transition-colors hover:text-rose-300"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        {hint && <p className="text-2xs text-haze-400">{hint}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block space-y-2">
        <span className="text-xs font-medium uppercase tracking-[0.16em] text-haze-300">
          {label}
        </span>
        <textarea
          rows={5}
          value={value.join('\n')}
          placeholder={placeholder}
          onChange={(event) =>
            onChange(
              event.target.value
                .split('\n')
                .map((line) => line.trim())
                .filter((line, index, all) => line.length > 0 || index === all.length - 1),
            )
          }
          className="w-full resize-y rounded-2xl border border-white/10 bg-ink-800/70 px-4 py-3 text-sm text-haze-100 placeholder:text-haze-400/70 transition-colors focus:border-accent-violet/60 focus:outline-none focus:ring-4 focus:ring-accent-violet/12"
        />
      </label>
      {hint && <p className="text-2xs text-haze-400">{hint}</p>}
    </div>
  );
}
