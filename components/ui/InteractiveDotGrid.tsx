'use client';

import React, { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

interface InteractiveDotGridProps {
  dotSpacing?: number;
  baseDotRadius?: number;
  className?: string;
}

export default function InteractiveDotGrid({
  dotSpacing = 32,
  baseDotRadius = 1.25,
  className = '',
}: InteractiveDotGridProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { resolvedTheme } = useTheme();

  // Read from a ref inside the render loop so the animation effect below
  // doesn't need to restart (and reset dot positions/listeners) on theme change.
  const themeRef = useRef(resolvedTheme);
  useEffect(() => {
    themeRef.current = resolvedTheme;
  }, [resolvedTheme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    // Mouse coordinates relative to canvas
    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      isHovering: false,
    };

    interface Dot {
      x: number; // original resting X
      y: number; // original resting Y
      currentX: number;
      currentY: number;
      vx: number;
      vy: number;
    }

    let dots: Dot[] = [];

    const initDots = () => {
      dots = [];
      const cols = Math.ceil(width / dotSpacing) + 1;
      const rows = Math.ceil(height / dotSpacing) + 1;

      // Center the grid
      const offsetX = (width - (cols - 1) * dotSpacing) / 2;
      const offsetY = (height - (rows - 1) * dotSpacing) / 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = offsetX + c * dotSpacing;
          const y = offsetY + r * dotSpacing;
          dots.push({
            x,
            y,
            currentX: x,
            currentY: y,
            vx: 0,
            vy: 0,
          });
        }
      }
    };

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = rect.width;
      height = rect.height;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      initDots();
    };

    handleResize();
    const resizeObserver = new ResizeObserver(handleResize);
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Mouse & Touch events on window / hero container
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      mouse.isHovering =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
    };

    const handleMouseLeave = () => {
      mouse.isHovering = false;
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    };

    // Respect prefers-reduced-motion: skip cursor-driven deflection so dots
    // stay at rest instead of following the pointer.
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      document.addEventListener('mouseleave', handleMouseLeave);
    }

    // Spring physics configuration
    const spring = 0.08;
    const friction = 0.82;
    const maxDeflection = 14;

    const render = () => {
      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.15;
      mouse.y += (mouse.targetY - mouse.y) * 0.15;

      ctx.clearRect(0, 0, width, height);

      // Spherical radius: approx 1/4 of screen width (clamped between 140px and 260px)
      const radius = Math.min(Math.max(width * 0.22, 140), 260);
      const radiusSq = radius * radius;

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];

        // Interaction calculation if mouse is near
        const dx = mouse.x - dot.x;
        const dy = mouse.y - dot.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < radiusSq && mouse.isHovering) {
          const dist = Math.sqrt(distSq);
          // Spherical falloff: smooth cosine curve
          const power = Math.cos((dist / radius) * (Math.PI / 2)); // 1 at center -> 0 at boundary
          const force = -power * maxDeflection;
          const angle = Math.atan2(dy, dx);

          const targetX = dot.x + Math.cos(angle) * force;
          const targetY = dot.y + Math.sin(angle) * force;

          dot.vx += (targetX - dot.currentX) * spring;
          dot.vy += (targetY - dot.currentY) * spring;
        } else {
          // Return to origin resting point
          dot.vx += (dot.x - dot.currentX) * spring;
          dot.vy += (dot.y - dot.currentY) * spring;
        }

        dot.vx *= friction;
        dot.vy *= friction;
        dot.currentX += dot.vx;
        dot.currentY += dot.vy;

        // Visual properties based on distance
        let currentDotRadius = baseDotRadius;
        let alpha = 0.22; // subtle default gray

        if (distSq < radiusSq && mouse.isHovering) {
          const dist = Math.sqrt(distSq);
          const ratio = 1 - dist / radius; // 1 at center, 0 at edge
          // Subtle size and opacity boost within the sphere
          currentDotRadius = baseDotRadius + ratio * 1.1;
          alpha = 0.22 + ratio * 0.45; // Darker/more prominent when hovered
        }

        // Light-on-dark in dark mode, dark-on-light in light mode, so the
        // grid keeps comparable contrast against the theme background.
        const isDark = themeRef.current === 'dark';
        ctx.beginPath();
        ctx.arc(dot.currentX, dot.currentY, currentDotRadius, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? `rgba(255, 255, 255, ${alpha})`
          : `rgba(15, 15, 15, ${alpha})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [dotSpacing, baseDotRadius]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
}
