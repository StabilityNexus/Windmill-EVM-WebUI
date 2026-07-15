'use client';

import React, { useRef, useEffect } from 'react';
import { STATS } from '@/utils/constants';

function renderStatIcon(icon: string) {
  switch (icon) {
    case 'volume':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
        </svg>
      );
    case 'trades':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
    case 'traders':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    case 'uptime':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function StatsPanel() {
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((centerY - y) / centerY) * 6;
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
    });
  };

  const handleMouseLeave = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    const card = cardRef.current;
    if (card) {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    }
  };

  const illustrativeStats = STATS.filter((s) => s.illustrative);

  return (
    <div className="w-full flex flex-col items-center gap-6 mt-16 px-4">
      {/* 3D Tilting Stats Card */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
          transition: 'transform 0.1s ease-out, box-shadow 0.2s ease',
        }}
        className="w-full max-w-4xl bg-white border border-neutral-100 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-4 select-none hover:shadow-2xl cursor-default"
      >
        {illustrativeStats.map((stat, idx) => (
          <React.Fragment key={stat.label}>
            <div className="flex items-center gap-4 flex-1 justify-center sm:justify-start w-full px-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${stat.bgClass} ${stat.textClass}`}>
                {renderStatIcon(stat.icon || '')}
              </div>
              <div>
                <span className="text-xl font-extrabold text-neutral-900 font-sans tracking-tight block">
                  {stat.value}
                </span>
                <span className="text-xs font-semibold text-neutral-400">
                  {stat.label}
                </span>
              </div>
            </div>
            {idx < illustrativeStats.length - 1 && (
              <div className="hidden sm:block w-[1px] h-10 bg-neutral-100" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* WHY WINDMILL centered label */}
      <div className="flex flex-col items-center gap-1 mt-4">
        <span className="text-[9px] font-semibold text-neutral-400 uppercase tracking-wider text-center">
          *Stats are illustrative placeholders for protocol historical performance.
        </span>
        <span className="text-[10px] font-extrabold tracking-[0.2em] text-neutral-400 uppercase font-sans mt-2">
          WHY WINDMILL?
        </span>
      </div>
    </div>
  );
}
