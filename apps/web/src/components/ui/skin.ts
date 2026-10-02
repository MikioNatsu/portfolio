import { createContext, useContext } from 'react';

/**
 * Visual language for the shared UI primitives.
 *
 * - `cinematic` — the public site: neon glass, editorial type (default).
 * - `system`    — the admin panel: calm, Apple-inspired system UI that follows
 *                 the admin's light / dark appearance tokens.
 *
 * Primitives keep a single implementation (behaviour, accessibility, props)
 * and only swap class maps based on the active skin.
 */
export type Skin = 'cinematic' | 'system';

export const SkinContext = createContext<Skin>('cinematic');

export function useSkin(): Skin {
  return useContext(SkinContext);
}
