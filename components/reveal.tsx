'use client';

import { Children, type ReactNode } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { useInView } from '@/hooks/use-in-view';

type RevealDirection = 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right';

interface RevealProps {
  children: ReactNode;
  /** Direction the content travels from as it fades in. */
  direction?: RevealDirection;
  /** Delay before the animation starts, in seconds. */
  delay?: number;
  /** Animation duration, in seconds. */
  duration?: number;
  /** Stagger between direct children, in seconds. Set above 0 to enable. */
  stagger?: number;
  /** Keep the revealed state after the first intersection. */
  once?: boolean;
  className?: string;
}

const OFFSETS: Record<RevealDirection, { x: number; y: number }> = {
  'fade-up': { x: 0, y: 24 },
  'fade-down': { x: 0, y: -24 },
  'fade-left': { x: -24, y: 0 },
  'fade-right': { x: 24, y: 0 },
};

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * Reveals content when it enters the viewport.
 * Uses Intersection Observer for visibility and Framer Motion for the transition.
 */
export default function Reveal({
  children,
  direction = 'fade-up',
  delay = 0,
  duration = 0.7,
  stagger = 0,
  once = true,
  className,
}: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ once });
  const reduceMotion = useReducedMotion() ?? false;

  const safeDelay = reduceMotion ? 0 : Math.max(0, delay);
  const safeDuration = reduceMotion ? 0 : Math.max(0, duration);
  const safeStagger = reduceMotion ? 0 : Math.max(0, stagger);

  const itemVariants: Variants = {
    hidden: { opacity: 0, ...OFFSETS[direction] },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: safeDuration, ease: EASE },
    },
  };

  if (stagger > 0) {
    const containerVariants: Variants = {
      hidden: {},
      visible: {
        transition: {
          delayChildren: safeDelay,
          staggerChildren: safeStagger,
        },
      },
    };

    return (
      <motion.div
        ref={ref}
        className={className}
        variants={containerVariants}
        initial={reduceMotion ? false : 'hidden'}
        animate={inView ? 'visible' : 'hidden'}
      >
        {Children.map(children, (child, index) => (
          <motion.div key={index} variants={itemVariants}>
            {child}
          </motion.div>
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={itemVariants}
      initial={reduceMotion ? false : 'hidden'}
      animate={inView ? 'visible' : 'hidden'}
      transition={{ delay: safeDelay, duration: safeDuration, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
