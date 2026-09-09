'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useMouseParallax } from '@/hooks/useMouseParallax';

// ─── FloatingCard ──────────────────────────────────────────────
//
// A single tile in the landing hero's 3D collage. Three transform
// layers, deliberately kept separate so they never fight:
//
//   outer  → pointer parallax (inline transform)
//   middle → ambient float keyframe (CSS animation transform)
//   inner  → resting 3D tilt + elevation shadow
//
// Decorative by default (`aria-hidden`).

type FloatVariant = 'none' | 'soft' | 'soft-delayed' | 'soft-lg' | 'drift';
type Elevation = 'none' | 'sm' | 'md' | 'lg';

interface FloatingCardProps {
  children: ReactNode;
  /** px of pointer-parallax travel; 0 pins the card */
  depth?: number;
  /** resting tilt, degrees */
  rotateX?: number;
  rotateY?: number;
  rotate?: number;
  /** ambient float keyframe */
  float?: FloatVariant;
  /** warm elevation shadow */
  elevation?: Elevation;
  className?: string;
  style?: CSSProperties;
  /** set false only when the card carries real content */
  ariaHidden?: boolean;
}

const FLOAT_CLASS: Record<FloatVariant, string> = {
  none: '',
  soft: 'animate-float-soft',
  'soft-delayed': 'animate-float-soft-delayed',
  'soft-lg': 'animate-float-soft-lg',
  drift: 'animate-drift-x',
};

export default function FloatingCard({
  children,
  depth = 24,
  rotateX = 0,
  rotateY = 0,
  rotate = 0,
  float = 'soft',
  elevation = 'md',
  className = '',
  style,
  ariaHidden = true,
}: FloatingCardProps) {
  const { x, y } = useMouseParallax(depth);

  return (
    <div
      aria-hidden={ariaHidden || undefined}
      className={`will-change-transform ${className}`}
      style={{
        transform: `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`,
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        ...style,
      }}
    >
      <div className={FLOAT_CLASS[float]}>
        <div
          className={elevation === 'none' ? undefined : `shadow-float-${elevation}`}
          style={{
            transform: `perspective(1400px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotate(${rotate}deg)`,
            transformStyle: 'preserve-3d',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
