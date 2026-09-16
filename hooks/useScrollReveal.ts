'use client';

import { useRef, useEffect, type RefObject } from 'react';

interface ScrollRevealOptions {
  /** Percentage of element visible before triggering (0–1) */
  threshold?: number;
  /** IntersectionObserver rootMargin */
  rootMargin?: string;
}

// ─── Single Element ─────────────────────────────────────────────

/**
 * Observes a single element and adds the `revealed` class
 * when it enters the viewport. Unobserves after first trigger.
 */
export function useScrollReveal<T extends HTMLElement>(
  options: ScrollRevealOptions = {},
): RefObject<T | null> {
  const ref = useRef<T>(null);
  const { threshold = 0.15, rootMargin = '0px 0px -80px 0px' } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('revealed');
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return ref;
}

// ─── Children of a Container ────────────────────────────────────

/**
 * Observes every child with `[data-reveal]` inside the container.
 * Each child independently gets the `revealed` class when visible.
 */
export function useScrollRevealChildren<T extends HTMLElement>(
  options: ScrollRevealOptions = {},
): RefObject<T | null> {
  const containerRef = useRef<T>(null);
  const { threshold = 0.15, rootMargin = '0px 0px -80px 0px' } = options;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin },
    );

    const scanForRevealTargets = (root: ParentNode) => {
      root.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el));
    };

    // Initial pass over whatever is already mounted
    scanForRevealTargets(container);

    const unobserveRevealTargets = (root: Element) => {
      if (root.matches('[data-reveal]')) observer.unobserve(root);
      root.querySelectorAll('[data-reveal]').forEach((el) => observer.unobserve(el));
    };

    // Re-scan whenever the container's subtree changes, so content mounted
    // later (e.g. switching tabs that unmount/remount their content) still
    // gets observed instead of staying invisible forever.
    const mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches('[data-reveal]')) observer.observe(node);
          scanForRevealTargets(node);
        });

        // Stop tracking elements that just left the DOM (e.g. the other tab's
        // content) so repeated switching doesn't pile up stale observations.
        mutation.removedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          unobserveRevealTargets(node);
        });
      }
    });
    mutationObserver.observe(container, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [threshold, rootMargin]);

  return containerRef;
}
