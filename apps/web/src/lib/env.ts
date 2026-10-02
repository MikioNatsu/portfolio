/** Runtime configuration resolved from Vite env vars. */

function readString(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

export const env = {
  /**
   * Base URL of the NestJS API. Empty string means "same origin", which is the
   * preferred production setup (reverse proxy / Vercel rewrites).
   */
  apiUrl: readString(import.meta.env.VITE_API_URL, ''),
  siteUrl: readString(import.meta.env.VITE_SITE_URL, 'http://localhost:5173'),
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;

/** Absolute URL for canonical / Open Graph tags. */
export function siteUrl(path = '/'): string {
  const base = env.siteUrl.replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
