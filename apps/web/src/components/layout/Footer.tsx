import { Link } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import { NAV_LINKS, SITE_NAME } from '@/lib/constants';
import { Icon } from '@/components/ui/Icon';
import { Logomark, Sparkle } from './Logomark';
import { useProfile, useSettings } from '@/hooks/useContent';
import { trackSocialClick } from '@/hooks/useAnalytics';

export function Footer() {
  const { profile } = useProfile();
  const { settings } = useSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-10 overflow-hidden border-t border-white/[0.06]">
      <div
        className="pointer-events-none absolute -bottom-40 left-1/2 h-96 w-[52rem] -translate-x-1/2 rounded-full blur-[130px]"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.28), transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="shell relative py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div className="space-y-4">
            <Logomark size="lg" />
            <p className="max-w-xs text-sm leading-relaxed text-haze-400">{profile.bio}</p>
            <div className="flex flex-wrap gap-2">
              {profile.socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={link.label}
                  onClick={() => trackSocialClick(link.label, link.url)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-haze-400 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-violet/50 hover:text-white"
                >
                  <Icon name={link.icon} size={15} />
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Footer" className="space-y-3">
            <p className="label">Navigate</p>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-haze-300 transition-colors duration-300 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-3">
            <p className="label">Elsewhere</p>
            <ul className="space-y-2">
              {profile.socialLinks.slice(0, 4).map((link) => (
                <li key={link.id}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    onClick={() => trackSocialClick(link.label, link.url)}
                    className="inline-flex items-center gap-2 text-sm text-haze-300 transition-colors duration-300 hover:text-white"
                  >
                    <Icon name={link.icon} size={14} className="text-haze-400" />
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-2 text-sm text-haze-400 transition-colors duration-300 hover:text-haze-200"
                >
                  <Sparkle size={10} className="text-accent-fuchsia/70" />
                  Admin
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 divider-glow" aria-hidden="true" />

        <div className="mt-6 flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-haze-400">
            © {year} {SITE_NAME}. All rights reserved.
            {settings.footerNote ? ` · ${settings.footerNote}` : ''}
          </p>
          <div className="flex items-center gap-4">
            <span className="jp text-2xs text-accent-fuchsia/50">夢を形に</span>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.16em] text-haze-400 transition-colors duration-300 hover:text-white"
            >
              Back to top
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
