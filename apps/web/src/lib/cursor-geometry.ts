/**
 * Geometry for the adaptive cursor.
 *
 * Kept separate from the component: it is pure measurement logic with no React
 * involvement, which makes it directly testable and keeps `CustomCursor.tsx`
 * exporting only components (so Fast Refresh keeps working).
 */

/** How much larger than the element the ring sits. */
export const CURSOR_PAD = 6;
/** Resting ring size, and the dot size. */
export const RING_SIZE = 30;
export const DOT_SIZE = 6;
/** Beyond this, hugging the element looks wrong — use the circle instead. */
export const MAX_SHAPE_WIDTH = 460;
export const MAX_SHAPE_HEIGHT = 120;

export const SHAPE_SELECTOR =
  'a, button, [role="button"], input, textarea, select, label, [data-cursor="shape"]';
export const OPT_OUT_SELECTOR = '[data-cursor="default"]';

export interface RingGeometry {
  cx: number;
  cy: number;
  width: number;
  height: number;
  radius: number;
}

/**
 * Measures an element and returns the ring geometry that would hug it,
 * or `null` when the circle fallback should be used instead.
 */
export function geometryFor(element: Element): RingGeometry | null {
  const rect = element.getBoundingClientRect();

  if (rect.width < 8 || rect.height < 8) return null;

  // Ignore anything scrolled out of view.
  if (
    rect.bottom < 0 ||
    rect.top > window.innerHeight ||
    rect.right < 0 ||
    rect.left > window.innerWidth
  ) {
    return null;
  }

  const isExplicit = element.matches('[data-cursor="shape"]');
  if (!isExplicit && (rect.width > MAX_SHAPE_WIDTH || rect.height > MAX_SHAPE_HEIGHT)) {
    return null;
  }

  const style = window.getComputedStyle(element);
  // Clamp pill radii (9999px) so the ring stays a true outline, then inflate.
  const declared = Number.parseFloat(style.borderTopLeftRadius) || 0;
  const radius = Math.min(declared, rect.height / 2) + CURSOR_PAD;

  return {
    cx: rect.left + rect.width / 2,
    cy: rect.top + rect.height / 2,
    width: rect.width + CURSOR_PAD * 2,
    height: rect.height + CURSOR_PAD * 2,
    radius,
  };
}
