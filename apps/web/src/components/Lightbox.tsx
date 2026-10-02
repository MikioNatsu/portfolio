import { useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useLockBodyScroll } from '@/hooks/useScroll';
import { cn } from '@/lib/utils';

export interface LightboxImage {
  url: string;
  alt?: string | null;
  caption?: string | null;
}

interface LightboxProps {
  images: LightboxImage[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

/** Fullscreen gallery viewer with keyboard and pointer navigation. */
export function Lightbox({ images, index, onClose, onNavigate }: LightboxProps) {
  const open = index !== null;
  useLockBodyScroll(open);

  const go = useCallback(
    (direction: 1 | -1) => {
      if (index === null || images.length === 0) return;
      const next = (index + direction + images.length) % images.length;
      onNavigate(next);
    },
    [index, images.length, onNavigate],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') go(1);
      if (event.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, go]);

  const current = index !== null ? images[index] : null;

  return (
    <AnimatePresence>
      {open && current && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-modal="true"
          aria-label={current.alt ?? 'Image viewer'}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-ink-950/95 backdrop-blur-xl"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close viewer"
            className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-haze-200 transition-colors hover:border-accent-violet/50 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous image"
                className="absolute left-3 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-haze-200 transition-colors hover:border-accent-violet/50 hover:text-white sm:left-6"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next image"
                className="absolute right-3 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-haze-200 transition-colors hover:border-accent-violet/50 hover:text-white sm:right-6"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          <motion.figure
            key={current.url}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mx-4 max-h-[86vh] w-full max-w-5xl"
          >
            <img
              src={current.url}
              alt={current.alt ?? 'Project screenshot'}
              className="mx-auto max-h-[76vh] w-auto max-w-full rounded-2xl border border-white/10 object-contain"
            />
            <figcaption className="mt-4 flex items-center justify-between gap-4 text-xs text-haze-400">
              <span>{current.caption ?? current.alt ?? ''}</span>
              <span className={cn('tabular-nums', images.length <= 1 && 'hidden')}>
                {(index ?? 0) + 1} / {images.length}
              </span>
            </figcaption>
          </motion.figure>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
