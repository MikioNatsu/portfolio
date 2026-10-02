import { describe, expect, it } from 'vitest';
import { monotonePath, tickIndices } from '@/lib/chart';

/** Every number in an SVG path string, in order. */
const numbers = (path: string) => (path.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);

describe('monotonePath', () => {
  it('handles empty and single-point series', () => {
    expect(monotonePath([])).toBe('');
    expect(monotonePath([{ x: 4, y: 8 }])).toBe('M4,8');
  });

  it('emits one cubic segment per gap between points', () => {
    const path = monotonePath([
      { x: 0, y: 10 },
      { x: 10, y: 0 },
      { x: 20, y: 6 },
    ]);
    expect(path.startsWith('M0,10')).toBe(true);
    expect(path.match(/C/g)).toHaveLength(2);
    expect(path.endsWith('20,6')).toBe(true);
  });

  it('never overshoots the data range (no dips below zero views)', () => {
    const points = [0, 12, 0, 0, 30, 2, 2, 18].map((value, index) => ({
      x: index * 10,
      y: 100 - value,
    }));
    const ys = numbers(monotonePath(points)).filter((_, index) => index % 2 === 1);
    expect(Math.max(...ys)).toBeLessThanOrEqual(100);
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(70);
  });

  it('keeps flat runs perfectly flat', () => {
    const path = monotonePath([
      { x: 0, y: 5 },
      { x: 10, y: 5 },
      { x: 20, y: 5 },
    ]);
    const ys = numbers(path).filter((_, index) => index % 2 === 1);
    expect(new Set(ys)).toEqual(new Set([5]));
  });
});

describe('tickIndices', () => {
  it('returns every index for short series', () => {
    expect(tickIndices(3)).toEqual([0, 1, 2]);
    expect(tickIndices(0)).toEqual([]);
  });

  it('spreads ticks evenly and always includes both ends', () => {
    expect(tickIndices(30, 5)).toEqual([0, 7, 15, 22, 29]);
    expect(tickIndices(90, 3)).toEqual([0, 45, 89]);
  });
});
