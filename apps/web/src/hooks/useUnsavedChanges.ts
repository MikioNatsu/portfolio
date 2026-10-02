import { useCallback, useEffect, useMemo, useState } from 'react';

/**
 * Tracks whether form `values` differ from the last saved snapshot and warns
 * before the tab is closed with edits pending.
 *
 * Values are compared structurally (JSON), which suits plain form state.
 */
export function useUnsavedChanges<T>(values: T) {
  const [saved, setSaved] = useState<T>(values);

  const dirty = useMemo(() => JSON.stringify(values) !== JSON.stringify(saved), [values, saved]);

  /** Record `next` as the persisted state (after load or a successful save). */
  const markSaved = useCallback((next: T) => setSaved(next), []);

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Chrome still requires returnValue to be set for the prompt to show.
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  return { dirty, saved, markSaved };
}
