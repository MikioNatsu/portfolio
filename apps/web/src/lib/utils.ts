import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge conditional class names with Tailwind conflict resolution. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** 2024-04-01T00:00:00.000Z → "2024" */
export function formatYear(value?: string | Date | null): string {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';
  return String(date.getUTCFullYear());
}

/** "2024 — Present" | "2023 — 2024" */
export function formatDateRange(
  start?: string | Date | null,
  end?: string | Date | null,
  current?: boolean,
): string {
  const from = formatYear(start);
  if (!from) return '';
  if (current || !end) return `${from} — Present`;
  const to = formatYear(end);
  return to ? `${from} — ${to}` : from;
}

/** ISO → "12 Mar 2025" */
export function formatDate(value?: string | Date | null): string {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/** ISO → "3h ago" / "2d ago" (falls back to an absolute date past a week). */
export function formatRelative(value?: string | Date | null): string {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';
  const diff = Date.now() - date.getTime();
  const minutes = Math.round(diff / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export function initials(name?: string | null): string {
  if (!name) return 'N';
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(value: string, max = 140): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trimEnd()}…`;
}

export function isExternalUrl(url?: string | null): boolean {
  if (!url) return false;
  return /^https?:\/\//i.test(url);
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** Stable per-tab identifier used by the lightweight analytics tracker. */
export function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  const key = 'natsu.session';
  try {
    const existing = window.sessionStorage.getItem(key);
    if (existing) return existing;
    const generated =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `s_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    window.sessionStorage.setItem(key, generated);
    return generated;
  } catch {
    return 'anonymous';
  }
}

export function getDeviceType(): 'desktop' | 'tablet' | 'mobile' {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return !window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

/** Domain-only referrer, keeps analytics free of full URLs. */
export function safeReferrer(): string | null {
  if (typeof document === 'undefined' || !document.referrer) return null;
  try {
    const url = new URL(document.referrer);
    if (url.host === window.location.host) return null;
    return url.host;
  } catch {
    return null;
  }
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function range(count: number): number[] {
  return Array.from({ length: count }, (_, index) => index);
}

/** Deterministic pseudo-random in [0,1) — keeps SSR/CSR decoration stable. */
export function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}
