import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLockBodyScroll } from '@/hooks/useScroll';
import { Button } from '@/components/ui/Button';

/* -------------------------------------------------------------------------- */
/* Page chrome                                                                 */
/* -------------------------------------------------------------------------- */

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-white/[0.06] pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1.5">
        <h1 className="font-display text-2xl font-semibold text-haze-100 sm:text-3xl">{title}</h1>
        {description && <p className="max-w-2xl text-sm text-haze-400">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </header>
  );
}

export function Panel({
  title,
  description,
  actions,
  children,
  className,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-white/[0.07] bg-ink-800/50 backdrop-blur-xl',
        className,
      )}
    >
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-4">
          <div className="space-y-0.5">
            {title && <h2 className="text-sm font-semibold text-haze-100">{title}</h2>}
            {description && <p className="text-xs text-haze-400">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function StatTile({
  label,
  value,
  hint,
  icon,
  tone = 'default',
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  tone?: 'default' | 'accent' | 'warning' | 'success';
}) {
  const tones = {
    default: 'text-haze-100',
    accent: 'text-accent-fuchsia',
    warning: 'text-amber-200',
    success: 'text-emerald-200',
  } as const;

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-ink-800/50 p-5 backdrop-blur-xl transition-colors hover:border-white/[0.12]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-2xs uppercase tracking-[0.18em] text-haze-400">{label}</p>
        {icon && <span className="text-haze-400">{icon}</span>}
      </div>
      <p className={cn('mt-3 font-display text-3xl leading-none', tones[tone])}>{value}</p>
      {hint && <p className="mt-2 text-2xs text-haze-400">{hint}</p>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Table                                                                       */
/* -------------------------------------------------------------------------- */

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full min-w-[42rem] border-collapse text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={cn(
        'border-b border-white/[0.07] px-4 py-3 text-left text-2xs font-medium uppercase tracking-[0.16em] text-haze-400',
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <td
      className={cn('border-b border-white/[0.05] px-4 py-3 align-middle text-haze-200', className)}
    >
      {children}
    </td>
  );
}

/* -------------------------------------------------------------------------- */
/* Modal                                                                       */
/* -------------------------------------------------------------------------- */

export function AdminModal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}) {
  useLockBodyScroll(open);

  const widths = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl' } as const;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[130] flex items-start justify-center overflow-y-auto bg-ink-950/80 p-4 backdrop-blur-md sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'my-auto w-full rounded-3xl border border-white/[0.09] bg-ink-800/95 shadow-[0_60px_140px_-60px_rgba(0,0,0,1)]',
              widths[size],
            )}
          >
            <header className="flex items-start justify-between gap-4 border-b border-white/[0.07] px-6 py-4">
              <div className="space-y-0.5">
                <h2 className="font-display text-lg text-haze-100">{title}</h2>
                {description && <p className="text-xs text-haze-400">{description}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-haze-400 transition-colors hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</div>

            {footer && (
              <footer className="flex flex-wrap items-center justify-end gap-2.5 border-t border-white/[0.07] px-6 py-4">
                {footer}
              </footer>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ConfirmDialog({
  open,
  title,
  description,
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
  return (
    <AdminModal
      open={open}
      onClose={onCancel}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-haze-300">
        This action cannot be undone. Make sure you really want to remove it.
      </p>
    </AdminModal>
  );
}
