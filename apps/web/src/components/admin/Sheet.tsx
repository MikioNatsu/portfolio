import { Fragment, useId, useRef, type PointerEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useDragControls, type PanInfo } from 'framer-motion';
import { X } from 'lucide-react';
import { EASE_IOS, SPRING_SNAPPY, SPRING_SOFT } from '@/animations/variants';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useLockBodyScroll } from '@/hooks/useScroll';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { IconButton } from './IconButton';

const WIDTHS = { sm: 'sm:max-w-md', md: 'sm:max-w-2xl', lg: 'sm:max-w-4xl' } as const;

/** Dismiss distance / speed for the drag-down gesture on phones. */
const DISMISS_OFFSET = 120;
const DISMISS_VELOCITY = 600;

/** Dimmed, lightly blurred backdrop behind modal layers. */
export function Scrim({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <motion.div
      className={cn('fixed inset-0 z-[130] bg-[var(--sys-scrim)] backdrop-blur-[2px]', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      onClick={onClick}
      aria-hidden="true"
    />
  );
}

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: keyof typeof WIDTHS;
}

/**
 * Modal sheet. A centred card on larger screens; on phones it rises from the
 * bottom edge and can be flicked or dragged down to dismiss.
 */
export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: SheetProps) {
  const compact = useMediaQuery('(max-width: 639px)');
  const panelRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();
  const titleId = useId();
  const descriptionId = useId();

  useLockBodyScroll(open);
  useFocusTrap(panelRef, open, { onEscape: onClose });

  const startDrag = (event: PointerEvent<HTMLElement>) => {
    if (!compact || (event.target as HTMLElement).closest('button')) return;
    dragControls.start(event);
  };

  const onDragEnd = (_event: unknown, info: PanInfo) => {
    if (info.offset.y > DISMISS_OFFSET || info.velocity.y > DISMISS_VELOCITY) onClose();
  };

  const motionProps = compact
    ? {
        initial: { y: '100%' },
        animate: { y: 0 },
        exit: { y: '100%' },
        transition: { duration: 0.42, ease: EASE_IOS },
        drag: 'y' as const,
        dragControls,
        dragListener: false,
        dragConstraints: { top: 0, bottom: 0 },
        dragElastic: { top: 0, bottom: 0.7 },
        onDragEnd,
      }
    : {
        initial: { opacity: 0, scale: 0.96, y: 10 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.97, y: 6, transition: { duration: 0.16 } },
        transition: SPRING_SOFT,
      };

  return createPortal(
    <AnimatePresence>
      {open && (
        <Fragment key="sheet-layer">
          <Scrim key="scrim" onClick={onClose} />
          <div
            key="sheet"
            className="pointer-events-none fixed inset-0 z-[131] flex items-end justify-center sm:items-center sm:p-6"
          >
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={description ? descriptionId : undefined}
              tabIndex={-1}
              className={cn(
                'pointer-events-auto flex w-full flex-col bg-sys-elevated text-sys-label shadow-sys-pop outline-none',
                'max-h-[92dvh] rounded-t-[22px] sm:max-h-[min(86dvh,52rem)] sm:rounded-[22px]',
                WIDTHS[size],
              )}
              {...motionProps}
            >
              <header
                onPointerDown={startDrag}
                className={cn('shrink-0 px-5 pb-3 pt-2 sm:pt-4', compact && 'touch-none')}
              >
                <div
                  className="mx-auto mb-2 h-[5px] w-9 rounded-full bg-sys-fill sm:hidden"
                  aria-hidden="true"
                />
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 space-y-0.5">
                    <h2 id={titleId} className="text-[17px] font-semibold tracking-[-0.015em]">
                      {title}
                    </h2>
                    {description && (
                      <p id={descriptionId} className="text-[13px] leading-5 text-sys-secondary">
                        {description}
                      </p>
                    )}
                  </div>
                  <IconButton
                    label="Close"
                    icon={X}
                    onClick={onClose}
                    className="-mr-1 h-7 w-7 bg-sys-fill-3 text-sys-secondary hover:bg-sys-fill-2"
                    iconClassName="h-3.5 w-3.5"
                  />
                </div>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5 pt-1">
                {children}
              </div>

              {footer && (
                <footer className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-sys-separator px-5 py-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] sm:pb-3.5">
                  {footer}
                </footer>
              )}
            </motion.div>
          </div>
        </Fragment>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/** iOS-style alert for destructive confirmations. */
export function ConfirmDialog({
  open,
  title,
  description = 'This can’t be undone.',
  confirmLabel = 'Delete',
  loading,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useLockBodyScroll(open);
  useFocusTrap(panelRef, open, { onEscape: onCancel, initialFocus: cancelRef });

  return createPortal(
    <AnimatePresence>
      {open && (
        <Fragment key="alert-layer">
          <Scrim key="scrim" onClick={onCancel} />
          <div
            key="alert"
            className="pointer-events-none fixed inset-0 z-[131] flex items-center justify-center p-4"
          >
            <motion.div
              ref={panelRef}
              role="alertdialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={descriptionId}
              className="pointer-events-auto w-full max-w-[19rem] rounded-[20px] bg-sys-elevated p-5 pt-6 text-center text-sys-label shadow-sys-pop"
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.14 } }}
              transition={SPRING_SNAPPY}
            >
              <h2 id={titleId} className="text-[17px] font-semibold tracking-[-0.015em]">
                {title}
              </h2>
              <p id={descriptionId} className="mt-1.5 text-[13px] leading-5 text-sys-secondary">
                {description}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <Button
                  ref={cancelRef}
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={onCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  fullWidth
                  onClick={onConfirm}
                  loading={loading}
                >
                  {confirmLabel}
                </Button>
              </div>
            </motion.div>
          </div>
        </Fragment>
      )}
    </AnimatePresence>,
    document.body,
  );
}
