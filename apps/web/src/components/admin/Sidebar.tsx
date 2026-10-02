import { NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LayoutGroup, motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { adminApi } from '@/api/client';
import { SPRING_SNAPPY } from '@/animations/variants';
import { Sparkle } from '@/components/layout/Logomark';
import { QUERY_KEYS, SITE_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { IconTile } from './IconTile';
import { ADMIN_NAV } from './navigation';

/**
 * Grouped, iPadOS-style sidebar. The selection pill glides between items;
 * `layoutGroupId` keeps the desktop sidebar and mobile drawer independent.
 */
export function Sidebar({
  layoutGroupId,
  onNavigate,
}: {
  layoutGroupId: string;
  onNavigate?: () => void;
}) {
  const overview = useQuery({
    queryKey: QUERY_KEYS.adminOverview,
    queryFn: () => adminApi.overview(),
    staleTime: 30_000,
  });
  const badges = { unreadMessages: overview.data?.messages.unread ?? 0 };

  return (
    <LayoutGroup id={layoutGroupId}>
      <div className="flex h-full flex-col">
        <div className="flex h-[52px] shrink-0 items-center gap-2.5 px-5">
          <span className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-gradient-to-br from-[#8E44EC] to-[#FF2D78] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
            <Sparkle size={12} />
          </span>
          <span className="leading-tight">
            <span className="block text-[15px] font-semibold tracking-[-0.01em] text-sys-label">
              {SITE_NAME}
            </span>
            <span className="block text-[11px] font-medium text-sys-secondary">Admin</span>
          </span>
        </div>

        <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 pb-4 pt-2">
          {ADMIN_NAV.map((section, sectionIndex) => (
            <div key={section.title ?? sectionIndex} className={cn(sectionIndex > 0 && 'mt-5')}>
              {section.title && (
                <p className="px-2.5 pb-1.5 text-[11px] font-semibold text-sys-secondary">
                  {section.title}
                </p>
              )}
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const count = item.badge ? badges[item.badge] : 0;
                  return (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        end={item.end}
                        onClick={onNavigate}
                        className="group relative flex h-9 items-center gap-2.5 rounded-[9px] px-2.5 text-sm text-sys-label outline-none transition-colors duration-150 hover:bg-sys-fill-4 focus-visible:ring-2 focus-visible:ring-sys-accent/50"
                      >
                        {({ isActive }) => (
                          <>
                            {isActive && (
                              <motion.span
                                layoutId="sidebar-selection"
                                className="absolute inset-0 rounded-[9px] bg-sys-fill-3"
                                transition={SPRING_SNAPPY}
                              />
                            )}
                            <IconTile
                              icon={item.icon}
                              tone={item.tone}
                              size="sm"
                              className="relative"
                            />
                            <span
                              className={cn(
                                'relative flex-1 truncate',
                                isActive && 'font-semibold',
                              )}
                            >
                              {item.label}
                            </span>
                            {count > 0 && (
                              <>
                                <span
                                  className="relative min-w-[1.25rem] rounded-full bg-sys-accent-fill px-1.5 text-center text-[11px] font-semibold leading-5 text-white"
                                  aria-hidden="true"
                                >
                                  {count > 99 ? '99+' : count}
                                </span>
                                <span className="sr-only">, {count} unread</span>
                              </>
                            )}
                          </>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-sys-separator p-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 items-center gap-2.5 rounded-[9px] px-2.5 text-sm text-sys-secondary transition-colors hover:bg-sys-fill-4 hover:text-sys-label"
          >
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            View site
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>
      </div>
    </LayoutGroup>
  );
}
