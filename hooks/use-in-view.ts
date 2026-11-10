'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

interface UseInViewOptions {
  /** Percentage of the element visible before it counts as in view (0–1). */
  threshold?: number;
  /** IntersectionObserver rootMargin. */
  rootMargin?: string;
  /** Stop observing after the first intersection. */
  once?: boolean;
}

/**
 * Tracks whether an element is visible in the viewport.
 * Returns a ref to attach to the element and the current visibility state.
 */
export function useInView<T extends HTMLElement>({
  threshold = 0.15,
  rootMargin = '0px 0px -80px 0px',
  once = true,
}: UseInViewOptions = {}): { ref: RefObject<T | null>; inView: boolean } {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.unobserve(entry.target);
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, inView };
}
