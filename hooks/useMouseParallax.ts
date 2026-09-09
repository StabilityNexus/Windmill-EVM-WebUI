'use client';

import { useEffect, useState } from 'react';

// ─── Shared pointer tracker ─────────────────────────────────────
//
// One `pointermove` listener feeds every consumer, so the hero collage
// can mount many parallax layers without stacking listeners. Values are
// normalised to roughly -1..1 (0,0 = viewport centre) and updated on a
// single rAF. Disabled entirely under `prefers-reduced-motion`.

interface Offset {
  x: number;
  y: number;
}

let current: Offset = { x: 0, y: 0 };
const listeners = new Set<(o: Offset) => void>();
let bound = false;
let frame = 0;

function ensureBound() {
  if (bound || typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const onMove = (e: PointerEvent) => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      };
      listeners.forEach((notify) => notify(current));
    });
  };

  window.addEventListener('pointermove', onMove, { passive: true });
  bound = true;
}

/**
 * Returns a pointer-driven offset scaled by `strength` (in px of travel).
 * Multiply a layer's depth into `strength`: nearer layers move more.
 */
export function useMouseParallax(strength = 1): Offset {
  const [offset, setOffset] = useState<Offset>(current);

  useEffect(() => {
    ensureBound();
    const notify = (o: Offset) => setOffset(o);
    listeners.add(notify);
    return () => {
      listeners.delete(notify);
    };
  }, []);

  return { x: offset.x * strength, y: offset.y * strength };
}
