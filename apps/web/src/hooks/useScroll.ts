import { useCallback, useEffect, useRef, useState } from 'react';

/** Scroll position + direction, throttled through rAF. */
export function useScrollInfo(threshold = 12) {
  const [scrolled, setScrolled] = useState(false);
  const [direction, setDirection] = useState<'up' | 'down'>('up');
  const lastY = useRef(0);

  useEffect(() => {
    let frame = 0;

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > threshold);
        if (Math.abs(y - lastY.current) > 6) {
          setDirection(y > lastY.current ? 'down' : 'up');
          lastY.current = y;
        }
        frame = 0;
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [threshold]);

  return { scrolled, direction };
}

/** Locks body scroll (mobile menu, image lightbox). */
export function useLockBodyScroll(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;
    const { overflow, paddingRight } = document.body.style;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [locked]);
}

/** Pointer spotlight for spotlight cards & the mouse-follow hero glow. */
export function useSpotlight<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);

  const onPointerMove = useCallback((event: React.PointerEvent<T>) => {
    const element = ref.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    element.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
    element.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
  }, []);

  return { ref, onPointerMove };
}

/** Tracks whether an element is in the viewport (used to pause animation). */
export function useInViewport<T extends HTMLElement = HTMLDivElement>(rootMargin = '200px') {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(Boolean(entry?.isIntersecting)),
      {
        rootMargin,
      },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, inView };
}
