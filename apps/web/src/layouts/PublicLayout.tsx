import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SocialRail } from '@/components/layout/SocialRail';
import { PageTransition } from '@/components/layout/PageTransition';
import { BackgroundLayers } from '@/components/effects/Background';
import { CustomCursor } from '@/components/effects/CustomCursor';
import { ScrollProgress } from '@/components/effects/ScrollProgress';

/** Shell for every public route: atmosphere, chrome and page transitions. */
export function PublicLayout() {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-ink-800 focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>

      <BackgroundLayers />
      <ScrollProgress />
      <CustomCursor />
      <Navbar />
      <SocialRail />

      <main id="main" className="relative flex-1 pt-24 sm:pt-28 lg:pt-32">
        <PageTransition />
      </main>

      <Footer />
    </div>
  );
}
