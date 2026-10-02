import { describe, expect, it } from 'vitest';
import {
  cleanText,
  flattenTechnologies,
  hashIp,
  slugify,
  technologyCreate,
  technologyReplace,
  technologySeed,
} from './content.util';

describe('slugify', () => {
  it('produces URL-safe slugs', () => {
    expect(slugify('Tensei.uz — Anime Platform')).toBe('tenseiuz-anime-platform');
    expect(slugify('Yuuki Assistant')).toBe('yuuki-assistant');
    expect(slugify('Café Déjà Vu')).toBe('cafe-deja-vu');
  });

  it('never returns separators at the edges', () => {
    expect(slugify('  hello  ')).toBe('hello');
    expect(slugify('---weird---')).toBe('weird');
  });

  it('caps very long input', () => {
    expect(slugify('a'.repeat(300)).length).toBeLessThanOrEqual(96);
  });
});

describe('cleanText', () => {
  it('strips control characters that could break rendering', () => {
    expect(cleanText('hello\u0000world')).toBe('helloworld');
    expect(cleanText('line\u0007break')).toBe('linebreak');
  });

  it('normalises CRLF and trims', () => {
    expect(cleanText('  a\r\nb  ')).toBe('a\nb');
  });
});

describe('hashIp', () => {
  it('is deterministic and never stores the raw address', () => {
    const first = hashIp('203.0.113.7', 'salt');
    const second = hashIp('203.0.113.7', 'salt');
    expect(first).toBe(second);
    expect(first).not.toContain('203.0.113.7');
    expect(first).toHaveLength(32);
  });

  it('varies with the salt', () => {
    expect(hashIp('203.0.113.7', 'a')).not.toBe(hashIp('203.0.113.7', 'b'));
  });

  it('returns null without an address', () => {
    expect(hashIp(undefined, 'salt')).toBeNull();
  });
});

describe('technologySeed', () => {
  it('derives a stable colour from the name', () => {
    expect(technologySeed('React').slug).toBe('react');
    expect(technologySeed('React')).toEqual(technologySeed('React'));
  });

  it('truncates over-long names', () => {
    expect(technologySeed('x'.repeat(120)).name.length).toBeLessThanOrEqual(40);
  });
});

describe('technologyCreate', () => {
  it('returns undefined when there is nothing to attach', () => {
    expect(technologyCreate([])).toBeUndefined();
    expect(technologyCreate(undefined)).toBeUndefined();
  });

  it('deduplicates and caps the list', () => {
    const result = technologyCreate(['React', 'React', 'TypeScript']);
    expect(result?.create).toHaveLength(2);
  });

  it('caps at 24 entries', () => {
    const many = Array.from({ length: 60 }, (_, index) => `Tech ${index}`);
    expect(technologyCreate(many)?.create.length).toBeLessThanOrEqual(24);
  });
});

describe('technologyReplace', () => {
  it('returns undefined when the field was not submitted', () => {
    expect(technologyReplace(undefined)).toBeUndefined();
  });

  it('clears the existing set even when empty', () => {
    const result = technologyReplace([]);
    expect(result?.deleteMany).toEqual({});
    expect(result?.create).toHaveLength(0);
  });
});

describe('flattenTechnologies', () => {
  it('unwraps join rows and tolerates undefined', () => {
    expect(flattenTechnologies([{ technology: { id: '1' } }])).toEqual([{ id: '1' }]);
    expect(flattenTechnologies(undefined)).toEqual([]);
  });
});
