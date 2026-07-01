import React, { useEffect, useRef, useState } from 'react';

/**
 * Fire once when the element first scrolls into view, then stop observing.
 * Hand-rolled to avoid adding a dependency.
 *
 * If this ever proves troublesome (browser quirks, testing, etc.),
 * `react-cool-inview` — by the same author as the `react-cool-dimensions`
 * already used in this repo — is a drop-in replacement:
 *   const { observe, inView } = useInView({ unobserveOnEnter: true });
 */
export function useIntersectionObserver<T extends Element>(
  rootMargin: string = '200px'
): [React.RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (node == null || hasIntersected) return;

    // Fail open where IntersectionObserver is unavailable, so dependent
    // content still loads rather than never appearing.
    if (typeof IntersectionObserver === 'undefined') {
      setHasIntersected(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setHasIntersected(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasIntersected, rootMargin]);

  return [ref, hasIntersected];
}
