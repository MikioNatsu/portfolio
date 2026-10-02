import { createContext, useContext, useEffect, type RefObject } from 'react';

/** Setter for the compact title shown in the admin toolbar. */
export const ToolbarTitleContext = createContext<(title: string | null) => void>(() => {});

/**
 * iOS-style large title: once the page's big heading scrolls under the
 * toolbar, the toolbar takes over and shows a compact version of it.
 */
export function useToolbarTitle(title: string, headingRef: RefObject<HTMLElement>, offset = 52) {
  const setTitle = useContext(ToolbarTitleContext);

  useEffect(() => {
    const heading = headingRef.current;
    if (!heading || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => setTitle(entry && !entry.isIntersecting ? title : null),
      { rootMargin: `-${offset}px 0px 0px 0px`, threshold: 0 },
    );
    observer.observe(heading);

    return () => {
      observer.disconnect();
      setTitle(null);
    };
  }, [title, headingRef, offset, setTitle]);
}
