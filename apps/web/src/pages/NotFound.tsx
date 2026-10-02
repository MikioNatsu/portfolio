import { Compass } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/ui/Reveal';
import { usePageMeta } from '@/hooks/usePageMeta';

export default function NotFound() {
  usePageMeta({
    title: '404 — Page not found',
    description: 'This page drifted off into another world.',
    noindex: true,
  });

  return (
    <Section className="flex min-h-[70vh] items-center pt-6">
      <div className="shell">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-6 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-accent-violet/30 bg-accent-violet/10 text-accent-fuchsia">
            <Compass className="h-6 w-6" />
          </span>
          <p className="font-display text-[clamp(4rem,16vw,9rem)] font-bold leading-none text-sheen">
            404
          </p>
          <div className="space-y-2">
            <h1 className="font-display text-2xl text-haze-100">
              This page slipped into another world
            </h1>
            <p className="text-sm text-haze-400">
              The link may be outdated, or the page was moved somewhere quieter.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button to="/">Back home</Button>
            <Button to="/projects" variant="secondary">
              Browse projects
            </Button>
          </div>
          <p className="jp text-2xs text-haze-400/70">ページが見つかりません</p>
        </div>
      </div>
    </Section>
  );
}
