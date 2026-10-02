import { afterEach, describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { STORAGE_KEYS } from '@/lib/constants';
import { readStoredAppearance, resolveAppearance, useApplyAppearance } from './useAppearance';

afterEach(() => window.localStorage.clear());

describe('resolveAppearance', () => {
  it('follows the OS for "system" and honours explicit choices', () => {
    expect(resolveAppearance('system', true)).toBe('dark');
    expect(resolveAppearance('system', false)).toBe('light');
    expect(resolveAppearance('light', true)).toBe('light');
    expect(resolveAppearance('dark', false)).toBe('dark');
  });
});

describe('readStoredAppearance', () => {
  it('defaults to system and ignores unknown values', () => {
    expect(readStoredAppearance()).toBe('system');
    window.localStorage.setItem(STORAGE_KEYS.adminAppearance, 'sepia');
    expect(readStoredAppearance()).toBe('system');
    window.localStorage.setItem(STORAGE_KEYS.adminAppearance, 'dark');
    expect(readStoredAppearance()).toBe('dark');
  });
});

describe('useApplyAppearance', () => {
  it('marks <html> while mounted and cleans up for the public site', () => {
    const { unmount, rerender } = renderHook(({ value }) => useApplyAppearance(value), {
      initialProps: { value: 'light' as 'light' | 'dark' },
    });
    expect(document.documentElement.dataset.adminAppearance).toBe('light');

    rerender({ value: 'dark' });
    expect(document.documentElement.dataset.adminAppearance).toBe('dark');

    unmount();
    expect(document.documentElement.dataset.adminAppearance).toBeUndefined();
  });
});
