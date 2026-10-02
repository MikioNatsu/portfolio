import { useId, useRef, useState, type DragEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ImageUp, Link2, LoaderCircle, Trash2 } from 'lucide-react';
import { adminApi, ApiError } from '@/api/client';
import { EASE_IOS } from '@/animations/variants';
import { SmartImage } from '@/components/ui/SmartImage';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { cn } from '@/lib/utils';

const ACCEPT = 'image/png,image/jpeg,image/webp,image/avif,image/svg+xml';

interface ImageUploaderProps {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
  aspect?: string;
  className?: string;
}

/**
 * Single-image field: drop a file, pick one, or paste a URL. Uploads go to
 * Cloudinary or local disk — whichever the API is configured with — so the
 * CMS works before storage credentials exist.
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
  const labelId = useId();
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrl, setShowUrl] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');

  const upload = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('That file is not an image.');
      return;
    }
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

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    void upload(event.dataTransfer.files?.[0]);
  };

  const applyUrl = () => {
    const url = urlDraft.trim();
    if (url && !/^(https?:\/\/|\/)/i.test(url)) {
      setError('Use an absolute https:// URL or a /path on this site.');
      return;
    }
    setError(null);
    onChange(url || null);
    setUrlDraft('');
    setShowUrl(false);
  };

  return (
    <div className={cn('space-y-2.5', className)} role="group" aria-labelledby={labelId}>
      <div className="flex items-baseline justify-between gap-3">
        <span id={labelId} className="text-[13px] font-medium text-sys-secondary">
          {label}
        </span>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="inline-flex items-center gap-1 text-[13px] font-medium text-sys-red-ink transition-opacity hover:opacity-75"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            Remove
          </button>
        )}
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'relative overflow-hidden rounded-xl shadow-[inset_0_0_0_1px_var(--sys-separator)] transition-[box-shadow,transform] duration-300 ease-ios',
          dragging && 'scale-[0.99] shadow-[inset_0_0_0_2px_rgb(var(--sys-accent))]',
        )}
      >
        <SmartImage src={value} alt={label} label={label} accent="#A855F7" aspect={aspect} />
        <AnimatePresence>
          {(uploading || dragging) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="sys-material absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm font-medium text-sys-label"
            >
              {uploading ? (
                <>
                  <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
                  Uploading…
                </>
              ) : (
                <>
                  <ImageUp className="h-5 w-5" aria-hidden="true" />
                  Drop to upload
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          tabIndex={-1}
          onChange={(event) => void upload(event.target.files?.[0])}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          iconLeft={<ImageUp className="h-3.5 w-3.5" />}
        >
          {value ? 'Replace…' : 'Choose image…'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-expanded={showUrl}
          onClick={() => setShowUrl((open) => !open)}
          iconLeft={<Link2 className="h-3.5 w-3.5" />}
        >
          Use URL
        </Button>
      </div>

      <AnimatePresence initial={false}>
        {showUrl && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE_IOS }}
            className="overflow-hidden"
          >
            <div className="flex items-end gap-2 pt-0.5">
              <Input
                label="Image URL"
                placeholder="https://…"
                value={urlDraft}
                onChange={(event) => setUrlDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    applyUrl();
                  }
                }}
                containerClassName="flex-1"
              />
              <Button type="button" size="md" onClick={applyUrl}>
                Apply
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p role="alert" className="text-xs font-medium text-sys-red-ink">
          {error}
        </p>
      )}
    </div>
  );
}
