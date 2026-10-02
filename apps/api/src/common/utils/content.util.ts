import { createHmac } from 'node:crypto';

/** Shared helpers used by several feature services. */

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);
}

/** Strips control characters and collapses runaway whitespace. */
export function cleanText(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\r\n/g, '\n')
    .trim();
}

/**
 * One-way hash of a client IP, used only to throttle abuse and spot spam
 * patterns. The raw address is never persisted.
 */
export function hashIp(ip: string | undefined, salt: string): string | null {
  if (!ip) return null;
  return createHmac('sha256', salt).update(ip).digest('hex').slice(0, 32);
}

const PALETTE = ['#A855F7', '#EC4899', '#60A5FA', '#F0ABFC', '#5EEAD4', '#F59E0B', '#34D399'];

/** "NestJS" → { name: 'NestJS', slug: 'nestjs', color: <stable accent> } */
export function technologySeed(name: string): { name: string; slug: string; color: string } {
  const trimmed = name.trim().slice(0, 40);
  const slug = slugify(trimmed) || `tech-${Date.now()}`;
  const hash = Array.from(slug).reduce((total, char) => total + char.charCodeAt(0), 0);
  return { name: trimmed, slug, color: PALETTE[hash % PALETTE.length] as string };
}

function normaliseNames(names: string[] | undefined): string[] {
  if (!names) return [];
  return Array.from(new Set(names.map((name) => name.trim()).filter(Boolean))).slice(0, 24);
}

/** Nested write for a create: attach technologies by name, creating as needed. */
export function technologyCreate(names: string[] | undefined) {
  const clean = normaliseNames(names);
  if (clean.length === 0) return undefined;
  return {
    create: clean.map((name) => {
      const seed = technologySeed(name);
      return {
        technology: {
          connectOrCreate: {
            where: { slug: seed.slug },
            create: { name: seed.name, slug: seed.slug, color: seed.color },
          },
        },
      };
    }),
  };
}

/** Nested write for an update: replace the set entirely. */
export function technologyReplace(names: string[] | undefined) {
  if (names === undefined) return undefined;
  const clean = normaliseNames(names);
  return {
    deleteMany: {},
    create: clean.map((name) => {
      const seed = technologySeed(name);
      return {
        technology: {
          connectOrCreate: {
            where: { slug: seed.slug },
            create: { name: seed.name, slug: seed.slug, color: seed.color },
          },
        },
      };
    }),
  };
}

/** Flattens Prisma's join rows into a plain technology array for the client. */
export function flattenTechnologies<T>(rows: Array<{ technology: T }> | undefined): T[] {
  return (rows ?? []).map((row) => row.technology);
}
