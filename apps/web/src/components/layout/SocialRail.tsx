import { Icon } from '@/components/ui/Icon';
import { useProfile } from '@/hooks/useContent';
import { trackSocialClick } from '@/hooks/useAnalytics';
import { cn } from '@/lib/utils';

/**
 * Vertical social rail — desktop only (xl and up), where there is room beside
 * the content column. On smaller screens the same links live in the footer.
 */
export function SocialRail() {
  const { profile } = useProfile();
  const links = profile.socialLinks;

  if (links.length === 0) return null;

  return (
    <aside
      aria-label="Social links"
      className="pointer-events-none fixed left-6 top-1/2 z-30 hidden -translate-y-1/2 xl:block"
    >
      <div className="pointer-events-auto flex flex-col items-center gap-3">
        <span
          className="h-14 w-px bg-gradient-to-b from-transparent to-accent-violet/45"
          aria-hidden="true"
        />

        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={link.label}
            onClick={() => trackSocialClick(link.label, link.url)}
            className={cn(
              'group relative flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-haze-400 backdrop-blur-md transition-all duration-300',
              'hover:-translate-y-0.5 hover:border-accent-violet/50 hover:text-white hover:shadow-glow-sm',
            )}
          >
            <Icon name={link.icon} size={16} />
            <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-full border border-white/10 bg-ink-800/95 px-2.5 py-1 text-2xs uppercase tracking-[0.16em] text-haze-200 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 -translate-x-1">
              {link.label}
            </span>
          </a>
        ))}

        <span
          className="h-14 w-px bg-gradient-to-t from-transparent to-accent-violet/45"
          aria-hidden="true"
        />
      </div>
    </aside>
  );
}
