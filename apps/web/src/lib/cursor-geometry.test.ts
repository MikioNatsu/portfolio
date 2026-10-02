import { afterEach, describe, expect, it, vi } from 'vitest';
import { CURSOR_PAD, geometryFor } from '@/lib/cursor-geometry';

/**
 * `geometryFor` is the whole brain of the adaptive cursor: it decides whether
 * the ring should hug an element, and with what geometry. jsdom reports zero
 * rects and no real styles, so both are stubbed per test.
 */

function makeElement(rect: Partial<DOMRect>, styles: { borderRadius?: string } = {}): Element {
  const element = document.createElement('button');
  document.body.appendChild(element);

  element.getBoundingClientRect = () =>
    ({
      x: rect.left ?? 0,
      y: rect.top ?? 0,
      left: rect.left ?? 0,
      top: rect.top ?? 0,
      right: rect.right ?? (rect.left ?? 0) + (rect.width ?? 0),
      bottom: rect.bottom ?? (rect.top ?? 0) + (rect.height ?? 0),
      width: rect.width ?? 0,
      height: rect.height ?? 0,
      toJSON: () => ({}),
    }) as DOMRect;

  vi.spyOn(window, 'getComputedStyle').mockReturnValue({
    borderTopLeftRadius: styles.borderRadius ?? '0px',
  } as CSSStyleDeclaration);

  return element;
}

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('geometryFor', () => {
  it('hugs a small control, inflated by the padding', () => {
    const element = makeElement(
      { left: 100, top: 200, width: 120, height: 40 },
      { borderRadius: '9999px' },
    );

    const geometry = geometryFor(element);

    expect(geometry).not.toBeNull();
    expect(geometry?.width).toBe(120 + CURSOR_PAD * 2);
    expect(geometry?.height).toBe(40 + CURSOR_PAD * 2);
    // Centred on the element, not on the pointer.
    expect(geometry?.cx).toBe(160);
    expect(geometry?.cy).toBe(220);
  });

  it('clamps a pill radius so the ring stays a true outline', () => {
    const element = makeElement({ width: 120, height: 40 }, { borderRadius: '9999px' });

    // height / 2 + padding — never the raw 9999px.
    expect(geometryFor(element)?.radius).toBe(40 / 2 + CURSOR_PAD);
  });

  it('adds padding to a modest corner radius', () => {
    const element = makeElement({ width: 120, height: 60 }, { borderRadius: '16px' });

    expect(geometryFor(element)?.radius).toBe(16 + CURSOR_PAD);
  });

  it('refuses elements too large to outline', () => {
    const wide = makeElement({ width: 700, height: 40 });
    const tall = makeElement({ width: 200, height: 300 });

    expect(geometryFor(wide)).toBeNull();
    expect(geometryFor(tall)).toBeNull();
  });

  it('still hugs an oversized element when explicitly asked to', () => {
    const element = makeElement({ width: 700, height: 40 });
    element.setAttribute('data-cursor', 'shape');

    expect(geometryFor(element)).not.toBeNull();
  });

  it('ignores elements with no visible box', () => {
    const zero = makeElement({ width: 0, height: 0 });
    const sliver = makeElement({ width: 120, height: 2 });

    expect(geometryFor(zero)).toBeNull();
    expect(geometryFor(sliver)).toBeNull();
  });

  it('ignores elements scrolled out of view', () => {
    const above = makeElement({ top: -200, height: 40, width: 120 });
    const below = makeElement({ top: window.innerHeight + 100, height: 40, width: 120 });

    expect(geometryFor(above)).toBeNull();
    expect(geometryFor(below)).toBeNull();
  });

  it('handles a missing border radius without producing NaN', () => {
    const element = makeElement({ width: 120, height: 40 }, { borderRadius: '' });

    expect(geometryFor(element)?.radius).toBe(CURSOR_PAD);
  });
});
