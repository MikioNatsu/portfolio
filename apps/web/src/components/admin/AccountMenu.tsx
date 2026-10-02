import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, LogOut, Monitor, Moon, Sun } from 'lucide-react';
import { sysPopover } from '@/animations/variants';
import { useAppearance, type AppearancePreference } from '@/hooks/useAppearance';
import { useAuth } from '@/hooks/useAuth';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { initials } from '@/lib/utils';
import { SegmentedControl, type SegmentOption } from './SegmentedControl';

const APPEARANCE_OPTIONS: ReadonlyArray<SegmentOption<AppearancePreference>> = [
  { value: 'system', label: 'Auto', icon: Monitor },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
];

const MENU_ITEM =
  'flex h-9 w-full items-center gap-2.5 rounded-[9px] px-2.5 text-left text-sm transition-colors duration-100';

function Avatar({ name, size = 'sm' }: { name?: string | null; size?: 'sm' | 'md' }) {
  return (
    <span
      className={
        size === 'md'
          ? 'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8E44EC] to-[#FF2D78] text-sm font-semibold text-white'
          : 'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8E44EC] to-[#FF2D78] text-[12px] font-semibold text-white'
      }
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}

/** Avatar button opening account details, appearance and sign-out. */
export function AccountMenu({ onSignOut }: { onSignOut: () => void }) {
  const { user } = useAuth();
  const { preference, setPreference } = useAppearance();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useFocusTrap(panelRef, open, { onEscape: () => setOpen(false) });

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Account and appearance"
        onClick={() => setOpen((value) => !value)}
        className="flex rounded-full transition-transform duration-200 active:scale-95"
      >
        <Avatar name={user?.name} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-label="Account"
            variants={sysPopover}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ originX: 1, originY: 0 }}
            className="sys-material absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(18rem,calc(100vw-2rem))] rounded-2xl p-1.5 text-sys-label shadow-sys-pop"
          >
            <div className="flex items-center gap-3 px-2.5 py-2.5">
              <Avatar name={user?.name} size="md" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">
                  {user?.name ?? 'Admin'}
                </span>
                <span className="block truncate text-[12px] text-sys-secondary">{user?.email}</span>
              </span>
            </div>

            <div className="mx-2.5 my-1 h-px bg-sys-separator" />

            <div className="px-2.5 pb-2.5 pt-1.5">
              <p className="mb-2 text-[12px] font-medium text-sys-secondary">Appearance</p>
              <SegmentedControl
                label="Appearance"
                options={APPEARANCE_OPTIONS}
                value={preference}
                onChange={setPreference}
                size="sm"
                fullWidth
              />
            </div>

            <div className="mx-2.5 my-1 h-px bg-sys-separator" />

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className={`${MENU_ITEM} hover:bg-sys-fill-4`}
            >
              <ArrowUpRight className="h-4 w-4 text-sys-secondary" aria-hidden="true" />
              View site
              <span className="sr-only">(opens in a new tab)</span>
            </a>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onSignOut();
              }}
              className={`${MENU_ITEM} text-sys-red-ink hover:bg-sys-red/10`}
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
