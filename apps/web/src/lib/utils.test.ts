import { describe, expect, it } from 'vitest';
import {
  formatDateRange,
  formatDay,
  formatYear,
  initials,
  isEmail,
  isExternalUrl,
  isHexColor,
  moveItem,
  parseLines,
  slugify,
  splitTokens,
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

describe('admin helpers', () => {
  it('parses one entry per line, dropping blanks and stray spaces', () => {
    expect(parseLines('Anime search \n\n  Watch progress\n')).toEqual([
      'Anime search',
      'Watch progress',
    ]);
  });

  it('splits comma-separated tokens', () => {
    expect(splitTokens('React, Vite ,  , TypeScript')).toEqual(['React', 'Vite', 'TypeScript']);
  });

  it('moves list items without mutating the input', () => {
    const list = ['a', 'b', 'c'];
    expect(moveItem(list, 0, 2)).toEqual(['b', 'c', 'a']);
    expect(moveItem(list, 2, 1)).toEqual(['a', 'c', 'b']);
    expect(moveItem(list, 0, 5)).toEqual(['a', 'b', 'c']);
    expect(list).toEqual(['a', 'b', 'c']);
  });

  it('validates six-digit hex colours', () => {
    expect(isHexColor('#A855F7')).toBe(true);
    expect(isHexColor('#a855f7')).toBe(true);
    expect(isHexColor('#FFF')).toBe(false);
    expect(isHexColor('A855F7')).toBe(false);
  });

  it('formats calendar days as UTC', () => {
    expect(formatDay('2026-03-12')).toBe('12 Mar');
    expect(formatDay('2026-01-01T23:30:00.000Z')).toBe('1 Jan');
    expect(formatDay('nope')).toBe('');
  });
});
