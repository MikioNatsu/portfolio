import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CircleCheck, CircleX, Info } from 'lucide-react';
import { SPRING_SOFT } from '@/animations/variants';
import {
  ToastContext,
  createToastRecord,
  type ToastApi,
  type ToastOptions,
  type ToastRecord,
} from '@/hooks/useToast';
import { cn } from '@/lib/utils';

const MAX_VISIBLE = 3;

const TONE_ICON = {
  success: { icon: CircleCheck, className: 'text-sys-green' },
  error: { icon: CircleX, className: 'text-sys-red' },
  info: { icon: Info, className: 'text-sys-blue' },
} as const;

function ToastBanner({
  toast,
  onDismiss,
}: {
  toast: ToastRecord;
  onDismiss: (id: number) => void;
}) {
  const [paused, setPaused] = useState(false);
  const { icon: Icon, className } = TONE_ICON[toast.tone];

  useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(() => onDismiss(toast.id), toast.duration);
    return () => window.clearTimeout(timer);
  }, [paused, toast.id, toast.duration, onDismiss]);

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -28, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.94, transition: { duration: 0.2 } }}
      transition={SPRING_SOFT}
      role={toast.tone === 'error' ? 'alert' : 'status'}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      className="pointer-events-auto"
    >
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        title="Dismiss"
        className={cn(
          'sys-material flex max-w-[min(26rem,calc(100vw-2rem))] items-center gap-3 text-left text-sys-label shadow-sys-pop',
          toast.description ? 'rounded-[18px] px-4 py-3' : 'rounded-full py-2.5 pl-3 pr-5',
        )}
      >
        <Icon className={cn('h-5 w-5 shrink-0', className)} aria-hidden="true" />
        <span className="min-w-0">
          <span className="block text-sm font-semibold">{toast.title}</span>
          {toast.description && (
            <span className="block text-[13px] leading-5 text-sys-secondary">
              {toast.description}
            </span>
          )}
        </span>
      </button>
    </motion.li>
  );
}

/**
 * Provides `useToast()` and renders notifications as a stack of banners that
 * drop in from the top centre — the iOS HUD idiom. Hover pauses dismissal.
 */
export function Toaster({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback((options: ToastOptions) => {
    const id = nextId.current++;
    setToasts((current) => [...current, createToastRecord(id, options)].slice(-MAX_VISIBLE));
    return id;
  }, []);

  const api = useMemo<ToastApi>(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {createPortal(
        <ol
          aria-live="polite"
          className="pointer-events-none fixed inset-x-0 top-3 z-[200] flex flex-col items-center gap-2 px-4 sm:top-4"
        >
          <AnimatePresence initial={false}>
            {toasts.map((item) => (
              <ToastBanner key={item.id} toast={item} onDismiss={dismiss} />
            ))}
          </AnimatePresence>
        </ol>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}
