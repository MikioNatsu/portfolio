import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUpRight,
  CornerDownLeft,
  FolderKanban,
  LogOut,
  Monitor,
  Moon,
  Plus,
  Search,
  Sun,
  type LucideIcon,
} from 'lucide-react';
import { adminApi } from '@/api/client';
import { SPRING_SNAPPY } from '@/animations/variants';
import { useAppearance } from '@/hooks/useAppearance';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { QUERY_KEYS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { searchCommands } from './command-search';
import { IconTile } from './IconTile';
import { ADMIN_NAV_ITEMS } from './navigation';
import { Scrim } from './Sheet';
import type { SysTone } from './tones';

interface Command {
  id: string;
  label: string;
  group: 'Pages' | 'Actions' | 'Projects';
  hint?: string;
  keywords?: string[];
  icon: LucideIcon;
  tone: SysTone;
  run: () => void;
}

/**
 * ⌘K palette: jump to any page, run common actions or open a project by
 * name. Fully keyboard driven — ↑ ↓ to move, ↵ to run, esc to close.
 */
export function CommandPalette({
  open,
  onClose,
  onSignOut,
}: {
  open: boolean;
  onClose: () => void;
  onSignOut: () => void;
}) {
  const navigate = useNavigate();
  const { setPreference } = useAppearance();
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  useFocusTrap(panelRef, open, { onEscape: onClose, initialFocus: inputRef });

  const projects = useQuery({
    queryKey: QUERY_KEYS.adminProjects({ palette: true }),
    queryFn: () => adminApi.listProjects({ page: 1, pageSize: 100 }),
    enabled: open,
    staleTime: 30_000,
  });

  const commands = useMemo<Command[]>(() => {
    const go = (to: string, state?: unknown) => () => navigate(to, { state });

    const pages: Command[] = ADMIN_NAV_ITEMS.map((item) => ({
      id: `page:${item.to}`,
      label: item.label,
      group: 'Pages',
      keywords: item.keywords,
      icon: item.icon,
      tone: item.tone,
      run: go(item.to),
    }));

    const actions: Command[] = [
      {
        id: 'new-project',
        label: 'New project',
        group: 'Actions',
        keywords: ['create', 'add', 'case study'],
        icon: Plus,
        tone: 'orange',
        run: go('/admin/projects/new'),
      },
      {
        id: 'new-experience',
        label: 'New experience entry',
        group: 'Actions',
        keywords: ['create', 'add', 'timeline', 'job'],
        icon: Plus,
        tone: 'teal',
        run: go('/admin/experience', { create: true }),
      },
      {
        id: 'new-skill',
        label: 'New skill',
        group: 'Actions',
        keywords: ['create', 'add', 'technology'],
        icon: Plus,
        tone: 'pink',
        run: go('/admin/skills', { create: true }),
      },
      {
        id: 'appearance-light',
        label: 'Use light appearance',
        group: 'Actions',
        keywords: ['theme', 'mode', 'appearance', 'light'],
        icon: Sun,
        tone: 'orange',
        run: () => setPreference('light'),
      },
      {
        id: 'appearance-dark',
        label: 'Use dark appearance',
        group: 'Actions',
        keywords: ['theme', 'mode', 'appearance', 'dark', 'night'],
        icon: Moon,
        tone: 'indigo',
        run: () => setPreference('dark'),
      },
      {
        id: 'appearance-system',
        label: 'Match system appearance',
        group: 'Actions',
        keywords: ['theme', 'mode', 'appearance', 'auto', 'system'],
        icon: Monitor,
        tone: 'gray',
        run: () => setPreference('system'),
      },
      {
        id: 'view-site',
        label: 'View public site',
        group: 'Actions',
        keywords: ['open', 'preview', 'website'],
        icon: ArrowUpRight,
        tone: 'blue',
        run: () => window.open('/', '_blank', 'noopener,noreferrer'),
      },
      {
        id: 'sign-out',
        label: 'Sign out',
        group: 'Actions',
        keywords: ['log out', 'logout', 'exit'],
        icon: LogOut,
        tone: 'red',
        run: onSignOut,
      },
    ];

    const projectCommands: Command[] = (projects.data?.items ?? []).map((project) => ({
      id: `project:${project.id}`,
      label: project.title,
      group: 'Projects',
      hint: project.category,
      keywords: [project.slug, project.category],
      icon: FolderKanban,
      tone: 'orange',
      run: go(`/admin/projects/${project.id}/edit`),
    }));

    return [...pages, ...actions, ...projectCommands];
  }, [navigate, onSignOut, projects.data, setPreference]);

  const groups = useMemo(() => {
    // An empty query lists pages and actions; projects appear once you type.
    const pool = query.trim()
      ? commands
      : commands.filter((command) => command.group !== 'Projects');
    return searchCommands(pool, query);
  }, [commands, query]);

  const flat = useMemo(() => groups.flatMap((group) => group.items), [groups]);
  const active = flat[Math.min(activeIndex, flat.length - 1)];

  useEffect(() => setActiveIndex(0), [query]);

  useEffect(() => {
    if (!active) return;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-command-id="${active.id}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const run = (command: Command | undefined) => {
    if (!command) return;
    onClose();
    command.run();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (flat.length === 0) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((current) => (current + step + flat.length) % flat.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      run(active);
    }
  };

  const optionId = (command: Command) => `${listId}-${command.id}`;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div key="palette" className="fixed inset-0 z-[140]" exit={{ opacity: 1 }}>
          <Scrim onClick={onClose} className="z-[140]" />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            initial={{ opacity: 0, scale: 0.97, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -6, transition: { duration: 0.14 } }}
            transition={SPRING_SNAPPY}
            className="sys-material fixed inset-x-0 top-[10vh] z-[141] mx-auto w-[min(40rem,calc(100vw-1.5rem))] overflow-hidden rounded-[20px] text-sys-label shadow-sys-pop"
          >
            <div className="flex h-14 items-center gap-3 px-4">
              <Search className="h-5 w-5 shrink-0 text-sys-secondary" aria-hidden="true" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search pages, actions and projects"
                role="combobox"
                aria-expanded="true"
                aria-controls={listId}
                aria-activedescendant={active ? optionId(active) : undefined}
                aria-autocomplete="list"
                className="h-full min-w-0 flex-1 bg-transparent text-[17px] text-sys-label placeholder:text-sys-secondary focus:outline-none"
              />
              <kbd className="hidden rounded-md bg-sys-fill-3 px-1.5 py-0.5 text-[11px] font-medium text-sys-secondary sm:inline">
                esc
              </kbd>
            </div>

            <ul
              ref={listRef}
              id={listId}
              role="listbox"
              aria-label="Results"
              className="max-h-[min(60vh,26rem)] overflow-y-auto overscroll-contain border-t border-sys-separator p-2"
            >
              {flat.length === 0 && (
                <li
                  className="px-3 py-8 text-center text-sm text-sys-secondary"
                  role="presentation"
                >
                  No results for “{query.trim()}”
                </li>
              )}
              {groups.map((group) => (
                <li key={group.group} role="presentation">
                  <p className="px-2.5 pb-1 pt-2 text-[11px] font-semibold text-sys-secondary">
                    {group.group}
                  </p>
                  <ul role="presentation">
                    {group.items.map((command) => {
                      const selected = command.id === active?.id;
                      return (
                        <li
                          key={command.id}
                          id={optionId(command)}
                          data-command-id={command.id}
                          role="option"
                          aria-selected={selected}
                          onPointerMove={() => setActiveIndex(flat.indexOf(command))}
                          onClick={() => run(command)}
                          className={cn(
                            'flex cursor-pointer items-center gap-3 rounded-[10px] px-2.5 py-2 transition-colors duration-100',
                            selected ? 'bg-sys-accent-fill text-white' : 'text-sys-label',
                          )}
                        >
                          <IconTile icon={command.icon} tone={command.tone} size="sm" />
                          <span className="min-w-0 flex-1 truncate text-sm">{command.label}</span>
                          {command.hint && (
                            <span
                              className={cn(
                                'truncate text-[12px]',
                                selected ? 'text-white/75' : 'text-sys-secondary',
                              )}
                            >
                              {command.hint}
                            </span>
                          )}
                          {selected && (
                            <CornerDownLeft
                              className="h-3.5 w-3.5 shrink-0 text-white/80"
                              aria-hidden="true"
                            />
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>

            <div className="hidden items-center gap-4 border-t border-sys-separator px-4 py-2 text-[11px] text-sys-secondary sm:flex">
              <span>↑ ↓ to navigate</span>
              <span>↵ to open</span>
              <span>esc to close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
