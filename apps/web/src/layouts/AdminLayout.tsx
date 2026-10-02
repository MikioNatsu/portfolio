import { Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { sysPageEnter } from '@/animations/variants';
import { useLogout } from '@/hooks/useAuth';
import { usePageMeta } from '@/hooks/usePageMeta';
import { ToolbarTitleContext } from '@/hooks/useToolbarTitle';
import { CommandPalette } from '@/components/admin/CommandPalette';
import { MobileDrawer } from '@/components/admin/MobileDrawer';
import { Sidebar } from '@/components/admin/Sidebar';
import { PageSkeleton } from '@/components/admin/Skeleton';
import { Toolbar } from '@/components/admin/Toolbar';

/** Authenticated admin chrome: sidebar, toolbar, command palette and routes. */
export function AdminLayout() {
  const location = useLocation();
  const signOut = useLogout();
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Each opening is a fresh session (new key → fresh state), so a previous
  // query can never flash or merge with what the user starts typing.
  const [palette, setPalette] = useState({ open: false, session: 0 });
  const openPalette = () =>
    setPalette((current) =>
      current.open ? current : { open: true, session: current.session + 1 },
    );
  const [compactTitle, setCompactTitle] = useState<string | null>(null);

  usePageMeta({ title: 'Admin — Natsu', noindex: true });

  // ⌘K / Ctrl+K toggles the command palette from anywhere.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPalette((current) =>
          current.open ? { ...current, open: false } : { open: true, session: current.session + 1 },
        );
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Each page starts at the top, and navigating closes the drawer.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setDrawerOpen(false);
  }, [location.pathname]);

  return (
    <ToolbarTitleContext.Provider value={setCompactTitle}>
      <div className="min-h-dvh bg-sys-canvas text-sys-label">
        <a
          href="#admin-main"
          className="sr-only z-[200] rounded-full bg-sys-accent-fill px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-3"
        >
          Skip to content
        </a>

        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-sys-separator bg-sys-surface/60 lg:block">
          <Sidebar layoutGroupId="sidebar-desktop" />
        </aside>

        <div className="lg:pl-64">
          <Toolbar
            title={compactTitle}
            onOpenMenu={() => setDrawerOpen(true)}
            onOpenSearch={openPalette}
            onSignOut={signOut}
          />

          <main
            id="admin-main"
            tabIndex={-1}
            className="mx-auto w-full max-w-[84rem] px-4 pb-28 pt-3 outline-none sm:px-6 lg:px-8 lg:pt-5"
          >
            <motion.div
              key={location.pathname}
              variants={sysPageEnter}
              initial="hidden"
              animate="visible"
            >
              <Suspense fallback={<PageSkeleton />}>
                <Outlet />
              </Suspense>
            </motion.div>
          </main>
        </div>

        <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Sidebar layoutGroupId="sidebar-drawer" onNavigate={() => setDrawerOpen(false)} />
        </MobileDrawer>

        <CommandPalette
          key={palette.session}
          open={palette.open}
          onClose={() => setPalette((current) => ({ ...current, open: false }))}
          onSignOut={signOut}
        />
      </div>
    </ToolbarTitleContext.Provider>
  );
}
