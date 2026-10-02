import {
  ChartNoAxesColumnIncreasing,
  FolderKanban,
  LayoutDashboard,
  Mail,
  Route,
  Settings,
  Sparkles,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import type { SysTone } from './tones';

export interface AdminNavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  tone: SysTone;
  /** Match the route exactly (the dashboard index). */
  end?: boolean;
  /** Extra search terms for the command palette. */
  keywords?: string[];
  /** Live count rendered as a badge. */
  badge?: 'unreadMessages';
}

export interface AdminNavSection {
  title?: string;
  items: AdminNavItem[];
}

/** Single source of truth for the sidebar, the drawer and the command palette. */
export const ADMIN_NAV: AdminNavSection[] = [
  {
    items: [
      {
        label: 'Overview',
        to: '/admin',
        icon: LayoutDashboard,
        tone: 'accent',
        end: true,
        keywords: ['dashboard', 'home'],
      },
      {
        label: 'Messages',
        to: '/admin/messages',
        icon: Mail,
        tone: 'blue',
        badge: 'unreadMessages',
        keywords: ['inbox', 'contact', 'mail'],
      },
      {
        label: 'Analytics',
        to: '/admin/analytics',
        icon: ChartNoAxesColumnIncreasing,
        tone: 'green',
        keywords: ['traffic', 'views', 'stats'],
      },
    ],
  },
  {
    title: 'Content',
    items: [
      {
        label: 'Projects',
        to: '/admin/projects',
        icon: FolderKanban,
        tone: 'orange',
        keywords: ['case studies', 'work'],
      },
      {
        label: 'Experience',
        to: '/admin/experience',
        icon: Route,
        tone: 'teal',
        keywords: ['timeline', 'jobs'],
      },
      {
        label: 'Skills',
        to: '/admin/skills',
        icon: Sparkles,
        tone: 'pink',
        keywords: ['technologies', 'stack'],
      },
      {
        label: 'Profile',
        to: '/admin/profile',
        icon: UserRound,
        tone: 'indigo',
        keywords: ['bio', 'social', 'about', 'hero'],
      },
    ],
  },
  {
    title: 'Site',
    items: [
      {
        label: 'Settings',
        to: '/admin/settings',
        icon: Settings,
        tone: 'gray',
        keywords: ['seo', 'preferences', 'footer'],
      },
    ],
  },
];

export const ADMIN_NAV_ITEMS: AdminNavItem[] = ADMIN_NAV.flatMap((section) => section.items);
