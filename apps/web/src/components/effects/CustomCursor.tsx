import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useIsTouchDevice, usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';
import {
  DOT_SIZE,
  OPT_OUT_SELECTOR,
  RING_SIZE,
  SHAPE_SELECTOR,
  geometryFor,
  type RingGeometry,
} from '@/lib/cursor-geometry';

/**
 * Adaptive cursor.
 *
 * The dot always tracks the pointer precisely. The ring behaves differently
 * depending on what is underneath it:
 *
 *  - over an interactive element → it **morphs into that element's shape**
 *    (the same width, height and corner radius, inflated by a few pixels), so
 *    the control appears outlined rather than merely pointed at;
 *  - anywhere else → it settles back into a small circle that trails the
 *    pointer.
 *
 * Oversized targets (cards, image tiles, textareas) deliberately fall back to
 * the circle: outlining a whole card reads as a bug, not a flourish.
 * Opt out with `data-cursor="default"`, force with `data-cursor="shape"`.
 * The measurement logic lives in `@/lib/cursor-geometry`.
 */
export function CustomCursor() {
  const isTouch = useIsTouchDevice();
  const reduceMotion = usePrefersReducedMotion();

  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [shaped, setShaped] = useState(false);

  /** The element currently being hugged, if any. */
  const shapedElement = useRef<Element | null>(null);
  /** The last element we measured, so we only measure when it changes. */
  const evaluatedElement = useRef<Element | null>(null);

  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);

  const ringX = useMotionValue(-100);
  const ringY = useMotionValue(-100);
  const ringWidth = useMotionValue(RING_SIZE);
  const ringHeight = useMotionValue(RING_SIZE);
  const ringRadius = useMotionValue(RING_SIZE / 2);

  // Springs give the morph its weight — geometry glides instead of snapping.
  const smoothX = useSpring(ringX, { stiffness: 380, damping: 32, mass: 0.5 });
  const smoothY = useSpring(ringY, { stiffness: 380, damping: 32, mass: 0.5 });
  const smoothWidth = useSpring(ringWidth, { stiffness: 320, damping: 30, mass: 0.6 });
  const smoothHeight = useSpring(ringHeight, { stiffness: 320, damping: 30, mass: 0.6 });
  const smoothRadius = useSpring(ringRadius, { stiffness: 320, damping: 30, mass: 0.6 });
  const smoothScale = useSpring(1, { stiffness: 420, damping: 26 });

  const applyGeometry = useCallback(
    (geometry: RingGeometry) => {
      ringX.set(geometry.cx);
      ringY.set(geometry.cy);
      ringWidth.set(geometry.width);
      ringHeight.set(geometry.height);
      ringRadius.set(geometry.radius);
    },
    [ringX, ringY, ringWidth, ringHeight, ringRadius],
  );

  const resetRing = useCallback(() => {
    shapedElement.current = null;
    ringWidth.set(RING_SIZE);
    ringHeight.set(RING_SIZE);
    ringRadius.set(RING_SIZE / 2);
    setShaped(false);
  }, [ringWidth, ringHeight, ringRadius]);

  useEffect(() => {
    setEnabled(!isTouch && !reduceMotion && window.matchMedia('(min-width: 1024px)').matches);
  }, [isTouch, reduceMotion]);

  useEffect(() => {
    smoothScale.set(pressed ? 0.94 : 1);
  }, [pressed, smoothScale]);

  /* ------------------------------------------------------------------ */
  /* Pointer tracking + shape detection                                  */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (!enabled) return;

    document.body.dataset.customCursor = 'true';

    const onMove = (event: PointerEvent) => {
      dotX.set(event.clientX);
      dotY.set(event.clientY);
      setVisible(true);

      const target = (event.target as Element | null)?.closest?.(SHAPE_SELECTOR) ?? null;

      // Nothing interactive underneath, or it opted out: back to the circle.
      if (!target || target.closest(OPT_OUT_SELECTOR)) {
        if (shapedElement.current) resetRing();
        evaluatedElement.current = null;
        ringX.set(event.clientX);
        ringY.set(event.clientY);
        return;
      }

      // Only measure when the hovered control actually changes.
      if (evaluatedElement.current !== target) {
        evaluatedElement.current = target;

        const geometry = geometryFor(target);
        if (geometry) {
          shapedElement.current = target;
          applyGeometry(geometry);
          setShaped(true);
        } else if (shapedElement.current) {
          // Too large to hug — keep the circle, still anchored to the pointer.
          resetRing();
        }
      }

      if (shapedElement.current) return; // ring stays wrapped around the control

      ringX.set(event.clientX);
      ringY.set(event.clientY);
    };

    const onLeave = () => {
      setVisible(false);
      if (shapedElement.current) resetRing();
      evaluatedElement.current = null;
    };
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    document.addEventListener('mouseleave', onLeave);

    return () => {
      delete document.body.dataset.customCursor;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, [enabled, dotX, dotY, ringX, ringY, applyGeometry, resetRing]);

  /* ------------------------------------------------------------------ */
  /* Keep the ring glued to the control while the page moves             */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (!enabled || !shaped) return;

    const recompute = () => {
      const element = shapedElement.current;
      if (!element || !element.isConnected) {
        resetRing();
        return;
      }
      const geometry = geometryFor(element);
      if (!geometry) {
        resetRing();
        return;
      }
      applyGeometry(geometry);
    };

    window.addEventListener('scroll', recompute, { passive: true });
    window.addEventListener('resize', recompute);
    return () => {
      window.removeEventListener('scroll', recompute);
      window.removeEventListener('resize', recompute);
    };
  }, [enabled, shaped, applyGeometry, resetRing]);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[9999] hidden lg:block">
      {/* Precise dot — always at the true pointer position */}
      <motion.span
        className="absolute rounded-full bg-white mix-blend-difference"
        style={{
          x: dotX,
          y: dotY,
          width: DOT_SIZE,
          height: DOT_SIZE,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{ opacity: visible ? (shaped ? 0.35 : 1) : 0, scale: pressed ? 0.7 : 1 }}
        transition={{ duration: 0.18 }}
      />

      {/* Ring — morphs into the hovered control's own shape */}
      <motion.span
        className={cn(
          'absolute border transition-colors duration-300',
          shaped
            ? 'border-accent-violet/75 bg-accent-violet/[0.09]'
            : 'border-accent-violet/70 bg-transparent',
        )}
        style={{
          x: smoothX,
          y: smoothY,
          width: smoothWidth,
          height: smoothHeight,
          borderRadius: smoothRadius,
          scale: smoothScale,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          opacity: visible ? (shaped ? 1 : 0.6) : 0,
          boxShadow: shaped
            ? '0 0 26px -6px rgba(168,85,247,0.75)'
            : '0 0 14px -6px rgba(168,85,247,0.5)',
        }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}
