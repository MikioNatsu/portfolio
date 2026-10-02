import { describe, expect, it } from 'vitest';
import {
  formatDateRange,
  formatYear,
  initials,
  isEmail,
  isExternalUrl,
  slugify,
  truncate,
} from '@/lib/utils';

describe('utils', () => {
  it('slugifies titles into URL-safe segments', () => {
    expect(slugify('Tensei.uz — Anime Platform')).toBe('tenseiuz-anime-platform');
    expect(slugify('  Yuuki   Assistant  ')).toBe('yuuki-assistant');
    expect(slugify('Café Déjà Vu')).toBe('cafe-deja-vu');
  });

  it('validates email addresses', () => {
    expect(isEmail('hello@example.com')).toBe(true);
    expect(isEmail('not-an-email')).toBe(false);
    expect(isEmail('missing@tld')).toBe(false);
  });

  it('detects absolute URLs', () => {
    expect(isExternalUrl('https://tensei.uz')).toBe(true);
    expect(isExternalUrl('/uploads/cover.png')).toBe(false);
    expect(isExternalUrl(null)).toBe(false);
  });

  it('formats year and date ranges', () => {
    expect(formatYear('2024-04-01T00:00:00.000Z')).toBe('2024');
    expect(formatYear(null)).toBe('');
    expect(formatDateRange('2024-01-01T00:00:00.000Z', null, true)).toBe('2024 — Present');
    expect(formatDateRange('2021-01-01T00:00:00.000Z', '2022-01-01T00:00:00.000Z')).toBe(
      '2021 — 2022',
    );
  });

  it('derives initials with a safe fallback', () => {
    expect(initials('Natsu')).toBe('N');
    expect(initials('Natsu Studio')).toBe('NS');
    expect(initials(null)).toBe('N');
  });

  it('truncates long text without cutting mid-word', () => {
    const long = 'a'.repeat(50);
    expect(truncate(long, 20)).toHaveLength(20);
    expect(truncate('short', 20)).toBe('short');
  });
});
