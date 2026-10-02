import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function focusableWithin(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (element) => !element.hasAttribute('inert') && element.getClientRects().length > 0,
  );
}

interface FocusTrapOptions {
  /** Called on Escape. */
  onEscape?: () => void;
  /** Element to focus on open; defaults to the first focusable child. */
  initialFocus?: RefObject<HTMLElement>;
}

/**
 * Keeps keyboard focus inside a dialog while it is open, closes it on Escape
 * and hands focus back to whatever opened it.
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement>,
  active: boolean,
  { onEscape, initialFocus }: FocusTrapOptions = {},
): void {
  // Always call the latest handler without re-running the trap on every render.
  const escapeRef = useRef(onEscape);
  escapeRef.current = onEscape;

  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const target = initialFocus?.current ?? focusableWithin(container)[0] ?? container;
    target.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        escapeRef.current?.();
        return;
      }
      if (event.key !== 'Tab') return;

      const items = focusableWithin(container);
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const first = items[0]!;
      const last = items[items.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    container.addEventListener('keydown', onKeyDown);
    return () => {
      container.removeEventListener('keydown', onKeyDown);
      if (previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [active, containerRef, initialFocus]);
}
