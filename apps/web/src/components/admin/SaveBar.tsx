import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { SPRING_SOFT } from '@/animations/variants';
import { Button } from '@/components/ui/Button';

/**
 * Floating capsule that appears while a form has unsaved edits.
 * ⌘S / Ctrl+S submits the form from anywhere on the page.
 */
export function SaveBar({
  formId,
  dirty,
  saving,
  onDiscard,
  saveLabel = 'Save',
  message = 'Unsaved changes',
}: {
  /** `id` of the `<form>` to submit — its own validation still runs. */
  formId: string;
  dirty: boolean;
  saving?: boolean;
  onDiscard?: () => void;
  saveLabel?: string;
  message?: string;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 's' || !(event.metaKey || event.ctrlKey)) return;
      event.preventDefault();
      const form = document.getElementById(formId);
      if (!saving && form instanceof HTMLFormElement) form.requestSubmit();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [formId, saving]);

  return createPortal(
    <AnimatePresence>
      {dirty && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[120] flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:pl-[calc(16rem+1rem)]">
          <motion.div
            role="region"
            aria-label="Unsaved changes"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.97, transition: { duration: 0.18 } }}
            transition={SPRING_SOFT}
            className="sys-material pointer-events-auto flex items-center gap-3 rounded-full py-2 pl-4 pr-2 shadow-sys-pop"
          >
            <span className="flex items-center gap-2 text-[13px] font-medium text-sys-label">
              <span className="h-2 w-2 rounded-full bg-sys-orange" aria-hidden="true" />
              {message}
            </span>
            <span className="flex items-center gap-1.5">
              {onDiscard && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onDiscard}
                  disabled={saving}
                >
                  Discard
                </Button>
              )}
              <Button
                type="submit"
                form={formId}
                size="sm"
                loading={saving}
                title="Save (⌘S / Ctrl+S)"
              >
                {saveLabel}
              </Button>
            </span>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
