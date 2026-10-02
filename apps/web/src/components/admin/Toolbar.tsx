import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Search } from 'lucide-react';
import { EASE_IOS } from '@/animations/variants';
import { useScrollInfo } from '@/hooks/useScroll';
import { cn, isApplePlatform } from '@/lib/utils';
import { AccountMenu } from './AccountMenu';
import { IconButton } from './IconButton';

/**
 * Top bar. Transparent at the top of the page, frosted once content scrolls
 * beneath it — and it picks up the page title when the large title leaves.
 */
export function Toolbar({
  title,
  onOpenMenu,
  onOpenSearch,
  onSignOut,
}: {
  title: string | null;
  onOpenMenu: () => void;
  onOpenSearch: () => void;
  onSignOut: () => void;
}) {
  const { scrolled } = useScrollInfo(4);
  const shortcut = isApplePlatform() ? '⌘K' : 'Ctrl K';

  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex h-[52px] items-center gap-2 px-3 transition-[background-color,box-shadow] duration-300 sm:px-5 lg:px-6',
        scrolled ? 'sys-material shadow-[0_1px_0_var(--sys-separator)]' : 'bg-transparent',
      )}
    >
      <IconButton
        label="Open navigation"
        icon={Menu}
        size="md"
        onClick={onOpenMenu}
        className="lg:hidden"
      />

      <div className="relative min-w-0 flex-1">
        <AnimatePresence mode="wait" initial={false}>
          {title && (
            <motion.p
              key={title}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.22, ease: EASE_IOS }}
              className="truncate text-[15px] font-semibold tracking-[-0.01em] text-sys-label"
              aria-hidden="true"
            >
              {title}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <button
        type="button"
        onClick={onOpenSearch}
        aria-keyshortcuts="Meta+K Control+K"
        className="hidden h-8 w-52 items-center gap-2 rounded-[9px] bg-sys-fill-3 px-2.5 text-[13px] text-sys-secondary transition-colors hover:bg-sys-fill-2 sm:flex lg:w-60"
      >
        <Search className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="flex-1 text-left">Search</span>
        <kbd className="font-system text-[11px] font-medium">{shortcut}</kbd>
      </button>
      <IconButton
        label="Search"
        icon={Search}
        size="md"
        onClick={onOpenSearch}
        className="sm:hidden"
      />

      <AccountMenu onSignOut={onSignOut} />
    </header>
  );
}
