'use client';

import React, { useState, useRef } from 'react';

export default function StatsPanel() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg)');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // x coordinate within the element
    const y = e.clientY - rect.top;  // y coordinate within the element

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation angles (max 6 degrees tilt)
    const rotateX = ((centerY - y) / centerY) * 6;
    const rotateY = ((x - centerX) / centerX) * 6;

    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`);
  };

  const handleMouseLeave = () => {
    // Smooth reset to default state
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  };

  return (
    <div className="w-full flex flex-col items-center gap-6 mt-16 px-4">
      {/* 3D Tilting Stats Card */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: transform,
          transition: 'transform 0.1s ease-out, box-shadow 0.2s ease',
        }}
        className="w-full max-w-4xl bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-4 select-none hover:shadow-2xl cursor-default"
      >
        {/* Stat Item 1 */}
        <div className="flex items-center gap-4 flex-1 justify-center sm:justify-start w-full px-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FAF5FF] dark:bg-[#FAF5FF]/10 text-[#9333EA] dark:text-[#a855f7]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
            </svg>
          </div>
          <div>
            <span className="text-xl font-extrabold text-foreground font-sans tracking-tight block">$24.7M+</span>
            <span className="text-xs font-semibold text-neutral-400">Total Volume</span>
          </div>
        </div>

        {/* Divider 1 */}
        <div className="hidden sm:block w-[1px] h-10 bg-border" />

        {/* Stat Item 2 */}
        <div className="flex items-center gap-4 flex-1 justify-center sm:justify-start w-full px-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] dark:bg-[#EFF6FF]/10 text-[#2563EB] dark:text-[#60a5fa]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <span className="text-xl font-extrabold text-foreground font-sans tracking-tight block">12,845+</span>
            <span className="text-xs font-semibold text-neutral-400">Total Trades</span>
          </div>
        </div>

        {/* Divider 2 */}
        <div className="hidden sm:block w-[1px] h-10 bg-border" />

        {/* Stat Item 3 */}
        <div className="flex items-center gap-4 flex-1 justify-center sm:justify-start w-full px-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F0FDF4] dark:bg-[#F0FDF4]/10 text-[#16A34A] dark:text-[#4ade80]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <span className="text-xl font-extrabold text-foreground font-sans tracking-tight block">3,120+</span>
            <span className="text-xs font-semibold text-neutral-400">Active Traders</span>
          </div>
        </div>

        {/* Divider 3 */}
        <div className="hidden sm:block w-[1px] h-10 bg-border" />

        {/* Stat Item 4 */}
        <div className="flex items-center gap-4 flex-1 justify-center sm:justify-start w-full px-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FFFBEB] dark:bg-[#FFFBEB]/10 text-[#D97706] dark:text-[#fbbf24]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <span className="text-xl font-extrabold text-foreground font-sans tracking-tight block">99.9%</span>
            <span className="text-xs font-semibold text-neutral-400">Uptime</span>
          </div>
        </div>
      </div>

      {/* WHY WINDMILL centered label */}
      <span className="text-[10px] font-extrabold tracking-[0.2em] text-neutral-400 dark:text-neutral-500 uppercase font-sans mt-4">
        WHY WINDMILL?
      </span>
    </div>
  );
}
