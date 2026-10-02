import { useCallback, useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Menu, Moon, Sun, X } from 'lucide-react';
import { NAV_LINKS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useLockBodyScroll, useScrollInfo } from '@/hooks/useScroll';
import { useTheme } from '@/hooks/useTheme';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { useProfile } from '@/hooks/useContent';
import { menuItem, menuOverlay } from '@/animations/variants';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { Sparkle } from './Logomark';
import { Logomark } from './Logomark';

/* -------------------------------------------------------------------------- */
/* Theme toggle                                                                */
/* -------------------------------------------------------------------------- */

function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isSakura = theme === 'sakura';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isSakura ? 'midnight' : 'sakura'} theme`}
      title={isSakura ? 'Sakura theme' : 'Midnight theme'}
      className={cn(
        'relative flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-haze-300 transition-all duration-300 hover:border-accent-violet/45 hover:text-white',
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ opacity: 0, rotate: -35, scale: 0.7 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 35, scale: 0.7 }}
          transition={{ duration: 0.25 }}
          className="absolute"
        >
          {isSakura ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Desktop navigation                                                          */
/* -------------------------------------------------------------------------- */

function DesktopNav() {
  const location = useLocation();
  const reduceMotion = usePrefersReducedMotion();

  return (
    <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
      {NAV_LINKS.map((link) => {
        const active =
          link.to === '/' ? location.pathname === '/' : location.pathname.startsWith(link.to);

        return (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={cn(
              'relative rounded-full px-3.5 py-2 text-sm transition-colors duration-300',
              active ? 'text-white' : 'text-haze-300 hover:text-haze-100',
            )}
          >
            <span className="relative z-10">{link.label}</span>
            {active && (
              <motion.span
                layoutId={reduceMotion ? undefined : 'nav-active'}
                className="absolute inset-0 -z-0 rounded-full border border-accent-violet/30 bg-white/[0.06]"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}

/* -------------------------------------------------------------------------- */
/* Mobile navigation                                                           */
/* -------------------------------------------------------------------------- */

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation();
  const { profile } = useProfile();
  useLockBodyScroll(open);

  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          variants={menuOverlay}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-40 flex flex-col bg-ink-950/95 backdrop-blur-2xl lg:hidden"
        >
          <div className="absolute inset-0 grid-bg opacity-25" aria-hidden="true" />
          <div
            className="absolute -right-24 top-10 h-80 w-80 rounded-full blur-[120px]"
            style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.4), transparent 70%)' }}
            aria-hidden="true"
          />

          <div className="relative flex flex-1 flex-col justify-center gap-2 px-6 pt-24 sm:px-10">
            {NAV_LINKS.map((link, index) => (
              <motion.div
                key={link.to}
                custom={index}
                variants={menuItem}
                initial="hidden"
                animate="visible"
              >
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-baseline justify-between border-b border-white/[0.06] py-4',
                      isActive ? 'text-white' : 'text-haze-200',
                    )
                  }
                >
                  <span className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                    {link.label}
                  </span>
                  <span className="text-2xs uppercase tracking-[0.24em] text-haze-400">
                    0{index + 1}
                  </span>
                </NavLink>
              </motion.div>
            ))}
          </div>

          <motion.div
            custom={NAV_LINKS.length + 1}
            variants={menuItem}
            initial="hidden"
            animate="visible"
            className="relative space-y-6 px-6 pb-10 sm:px-10"
          >
            <Button
              to="/contact"
              size="lg"
              fullWidth
              iconRight={<ArrowUpRight className="h-4 w-4" />}
            >
              Let&apos;s Talk
            </Button>

            <div className="flex flex-wrap items-center gap-3">
              {profile.socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={link.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-haze-300 transition-colors hover:border-accent-violet/50 hover:text-white"
                >
                  <Icon name={link.icon} size={17} />
                </a>
              ))}
              <ThemeToggle className="ml-auto" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* -------------------------------------------------------------------------- */
/* Navbar                                                                      */
/* -------------------------------------------------------------------------- */

export function Navbar() {
  const { scrolled } = useScrollInfo(24);
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="shell pt-3 sm:pt-4">
          <div
            className={cn(
              'flex items-center justify-between gap-4 rounded-full px-4 transition-all duration-500 ease-cinematic sm:px-5',
              scrolled
                ? 'glass-strong h-14 shadow-[0_18px_50px_-30px_rgba(0,0,0,1)]'
                : 'h-16 border border-transparent bg-transparent',
            )}
          >
            <Link to="/" aria-label="Natsu — home" className="shrink-0">
              <Logomark />
            </Link>

            <DesktopNav />

            <div className="flex items-center gap-2">
              <ThemeToggle className="hidden sm:flex" />
              <Button
                to="/contact"
                size="sm"
                className="hidden sm:inline-flex"
                iconRight={<ArrowUpRight className="h-3.5 w-3.5" />}
              >
                Let&apos;s Talk
              </Button>

              <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                aria-controls="mobile-menu"
                aria-label={open ? 'Close menu' : 'Open menu'}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-haze-200 transition-colors hover:text-white lg:hidden"
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Decorative hairline once the bar condenses */}
        <div
          className={cn(
            'mx-auto mt-2 h-px max-w-shell transition-opacity duration-500',
            scrolled ? 'opacity-100' : 'opacity-0',
          )}
          aria-hidden="true"
        >
          <div className="divider-glow mx-6" />
        </div>
      </header>

      <MobileMenu open={open} onClose={close} />
    </>
  );
}

export { Sparkle };
