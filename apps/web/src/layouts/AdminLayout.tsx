import { Suspense, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, LogOut, Menu, X } from 'lucide-react';
import { ADMIN_NAV_LINKS } from '@/lib/constants';
import { cn, initials } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { usePageMeta } from '@/hooks/usePageMeta';
import { setAuthToken } from '@/api/client';
import { Icon } from '@/components/ui/Icon';
import { LoadingState } from '@/components/ui/States';
import { Logomark } from '@/components/layout/Logomark';

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-3 border-b border-white/[0.06] px-5">
        <Logomark size="sm" />
        <span className="rounded-full border border-accent-violet/30 bg-accent-violet/10 px-2 py-0.5 text-2xs uppercase tracking-[0.16em] text-accent-fuchsia">
          Admin
        </span>
      </div>

      <nav aria-label="Admin" className="flex-1 space-y-1 overflow-y-auto p-3">
        {ADMIN_NAV_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/admin'}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-200',
                isActive
                  ? 'border border-accent-violet/25 bg-accent-violet/12 text-white'
                  : 'border border-transparent text-haze-400 hover:bg-white/[0.04] hover:text-haze-100',
              )
            }
          >
            <Icon name={link.icon} size={16} />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-3 border-t border-white/[0.06] p-3">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-haze-400 transition-colors hover:bg-white/[0.04] hover:text-haze-100"
        >
          <ExternalLink className="h-4 w-4" />
          View site
        </Link>

        {user && (
          <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent-purple to-accent-pink text-xs font-semibold text-white">
              {initials(user.name)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs text-haze-100">{user.name}</span>
              <span className="block truncate text-2xs text-haze-400">{user.email}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminLayout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  usePageMeta({ title: 'Admin — Natsu', noindex: true });

  const onLogout = async () => {
    try {
      await logout.mutateAsync();
    } finally {
      setAuthToken(null);
      navigate('/admin/login', { replace: true });
    }
  };

  return (
    <div className="min-h-dvh bg-ink-950">
      <div className="mx-auto flex min-h-dvh max-w-[1600px]">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-white/[0.06] bg-ink-900/60 lg:block">
          <div className="sticky top-0 h-dvh">
            <SidebarContent />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Topbar */}
          <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-white/[0.06] bg-ink-900/80 px-4 backdrop-blur-xl sm:px-6">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open admin navigation"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-haze-300 lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>

            <p className="text-2xs uppercase tracking-[0.2em] text-haze-400">Content management</p>

            <button
              type="button"
              onClick={onLogout}
              className="ml-auto inline-flex items-center gap-2 rounded-full border border-white/10 px-3.5 py-2 text-xs text-haze-300 transition-colors hover:border-rose-400/40 hover:text-rose-200"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
            <Suspense fallback={<LoadingState label="Loading" />}>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink-950/80 backdrop-blur-sm lg:hidden"
            onClick={() => setOpen(false)}
          >
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(event) => event.stopPropagation()}
              className="h-full w-72 border-r border-white/[0.08] bg-ink-900"
            >
              <div className="flex justify-end p-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close navigation"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-haze-400"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <SidebarContent onNavigate={() => setOpen(false)} />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
