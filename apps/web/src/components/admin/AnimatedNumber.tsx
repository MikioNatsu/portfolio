import { useEffect, useLayoutEffect, useRef } from 'react';
import { animate, useReducedMotion } from 'framer-motion';
import { EASE_IOS } from '@/animations/variants';
import { cn } from '@/lib/utils';

const formatter = new Intl.NumberFormat('en-US');

/**
 * Counts up to `value` (and glides between later values). The digits are
 * written straight to the DOM so the count never re-renders React; assistive
 * tech gets the final number from a visually hidden copy.
 */
export function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const displayed = useRef(0);
  const reduceMotion = useReducedMotion();

  useLayoutEffect(() => {
    if (nodeRef.current) nodeRef.current.textContent = formatter.format(displayed.current);
  }, []);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    if (reduceMotion) {
      displayed.current = value;
      node.textContent = formatter.format(value);
      return;
    }

    const controls = animate(displayed.current, value, {
      duration: 0.9,
      ease: [...EASE_IOS],
      onUpdate: (latest) => {
        displayed.current = latest;
        node.textContent = formatter.format(Math.round(latest));
      },
    });
    return () => controls.stop();
  }, [value, reduceMotion]);

  return (
    <span className={cn('tabular-nums', className)}>
      <span className="sr-only">{formatter.format(value)}</span>
      <span ref={nodeRef} aria-hidden="true" />
    </span>
  );
}
