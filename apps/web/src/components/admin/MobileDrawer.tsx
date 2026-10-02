import { useRef, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { EASE_IOS } from '@/animations/variants';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useLockBodyScroll } from '@/hooks/useScroll';
import { IconButton } from './IconButton';
import { Scrim } from './Sheet';

/** Slide-over navigation for screens without the permanent sidebar. */
export function MobileDrawer({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  useLockBodyScroll(open);
  useFocusTrap(panelRef, open, { onEscape: onClose });

  return (
    <AnimatePresence>
      {open && (
        <motion.div key="drawer" className="lg:hidden" exit={{ opacity: 1 }}>
          <Scrim onClick={onClose} className="z-[90]" />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.4, ease: EASE_IOS }}
            className="fixed inset-y-0 left-0 z-[91] w-[min(18rem,86vw)] bg-sys-surface shadow-sys-pop"
          >
            <IconButton
              label="Close navigation"
              icon={X}
              onClick={onClose}
              className="absolute right-3 top-2.5 z-10 bg-sys-fill-3"
            />
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
