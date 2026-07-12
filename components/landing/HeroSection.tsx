'use client';

import React from 'react';
import Link from 'next/link';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import StatsPanel from '@/components/landing/StatsPanel';

export default function HeroSection() {
  const containerRef = useScrollReveal<HTMLDivElement>({ threshold: 0.05 });

  return (
    <section
      id="home"
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background text-foreground pt-32 pb-16 bg-light-mesh"
    >
      {/* Ambient soft glow spots (light version) */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[60vw] h-[60vw] glow-spot-light-1 rounded-full opacity-[0.4] blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-[50vw] h-[50vw] glow-spot-light-2 rounded-full opacity-[0.3] blur-3xl pointer-events-none animate-pulse-slow" />

      {/* Floating 3D Geometric Accents */}
      <div className="absolute left-[8%] top-[25%] hidden lg:block animate-float pointer-events-none">
        <div className="w-14 h-14 border border-black/10 dark:border-white/10 rounded-xl transform rotate-12 rotate-x-45 rotate-y-12 transition-transform duration-500 hover:border-black/30 dark:hover:border-white/30" />
      </div>
      <div className="absolute right-[10%] bottom-[20%] hidden lg:block animate-float-delayed pointer-events-none">
        <div className="w-16 h-16 border border-black/10 dark:border-white/10 rounded-full border-dashed transform -rotate-12 transition-transform duration-500 hover:scale-110" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 md:px-8 text-center flex flex-col items-center justify-center">
        {/* Heading (Reduced size, animated B&W gradient text) */}
        <h1 className="text-reveal-2 font-sans text-3xl sm:text-5xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground max-w-3xl leading-[1.15] mb-6">
          The Decentralized{' '}
          <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#ffc517] via-[#e5b015] to-[#228b22]">
            Matchmaking
          </span>{' '}
          Protocol for EVM.
        </h1>

        {/* Description */}
        <p className="text-reveal-3 font-sans text-sm sm:text-base text-neutral-500 dark:text-neutral-400 max-w-xl leading-relaxed mb-10">
          A high-efficiency dynamic orderbook matching engine running entirely on-chain. Configure price slopes; let solvers settle automatically.
        </p>

        {/* CTAs */}
        <div className="text-reveal-4 flex flex-col sm:flex-row gap-4 items-center justify-center mb-10 w-full sm:w-auto">
          <Link
            href="/dashboard"
            className="btn-premium-dark w-full sm:w-auto hover:scale-105 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
          >
            Launch Exchange
          </Link>
          <Link
            href="/docs"
            className="btn-premium-light w-full sm:w-auto cursor-pointer"
          >
            Docs / API Reference
          </Link>
        </div>

        {/* 3D stats panel exactly as depicted */}
        <div className="w-full text-reveal-4 mb-16">
          <StatsPanel />
        </div>

        {/* 3D Visual Mock Interface Panel */}
        <div className="text-reveal-4 relative w-full max-w-3xl rounded-2xl border border-black/5 dark:border-white/5 bg-neutral-50/50 dark:bg-neutral-900/50 p-2 shadow-xl backdrop-blur-md pointer-events-auto transform rotate-x-6 rotate-y-[-3deg] transition-all duration-700 hover:rotate-x-0 hover:rotate-y-0 hover:scale-[1.01]">
          <div className="rounded-xl border border-black/10 dark:border-white/10 bg-card overflow-hidden shadow-inner aspect-[16/9] flex flex-col">
            {/* mock header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-black/5 dark:border-white/5 bg-neutral-50 dark:bg-neutral-900">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-black/10 dark:bg-white/10" />
                <span className="w-2.5 h-2.5 rounded-full bg-black/10 dark:bg-white/10" />
                <span className="w-2.5 h-2.5 rounded-full bg-black/10 dark:bg-white/10" />
              </div>
              <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 tracking-wider">solver-match-node</span>
              <div className="w-4" />
            </div>

            {/* Mock Pricing Curves */}
            <div className="flex-1 p-6 flex flex-col sm:flex-row gap-6 items-center justify-center bg-card">
              {/* Buy Curve */}
              <div className="flex-1 w-full flex flex-col gap-3 p-4 bg-neutral-50/50 dark:bg-neutral-900/50 rounded-xl border border-black/5 dark:border-white/5 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-neutral-800 dark:text-neutral-200">BUY ORDER #2884</span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-semibold">Active</span>
                </div>
                <div className="h-20 flex items-end justify-between gap-1 pt-6 border-b border-dashed border-black/5 dark:border-white/5 relative">
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-5">
                    <div className="border-b border-black/5 dark:border-white/5 w-full" />
                    <div className="border-b border-black/5 dark:border-white/5 w-full" />
                  </div>
                  <div className="w-full h-16 bg-[#ffc517] rounded-t-sm opacity-100" />
                  <div className="w-full h-12 bg-[#ffc517] rounded-t-sm opacity-80" />
                  <div className="w-full h-9 bg-[#ffc517] rounded-t-sm opacity-60" />
                  <div className="w-full h-6 bg-[#ffc517] rounded-t-sm opacity-30" />
                </div>
                <div className="flex justify-between text-[9px] text-neutral-400 dark:text-neutral-500 font-mono mt-1">
                  <span>Start: $1.20</span>
                  <span>Slope: -0.01</span>
                </div>
              </div>

              {/* Connecting Match Action */}
              <div className="flex flex-col items-center justify-center gap-1 shrink-0">
                <div className="h-8 w-8 rounded-full bg-[#ffc517] text-black flex items-center justify-center shadow-lg font-mono font-bold text-xs ring-4 ring-[#ffc517]/20">
                  ⚡
                </div>
                <span className="text-[9px] font-bold tracking-widest text-neutral-800 dark:text-neutral-200 uppercase mt-1">MATCH</span>
              </div>

              {/* Sell Curve */}
              <div className="flex-1 w-full flex flex-col gap-3 p-4 bg-neutral-50/50 dark:bg-neutral-900/50 rounded-xl border border-black/5 dark:border-white/5 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-neutral-800 dark:text-neutral-200">SELL ORDER #1940</span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-semibold">Active</span>
                </div>
                <div className="h-20 flex items-end justify-between gap-1 pt-6 border-b border-dashed border-black/5 dark:border-white/5 relative">
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-5">
                    <div className="border-b border-black/5 dark:border-white/5 w-full" />
                    <div className="border-b border-black/5 dark:border-white/5 w-full" />
                  </div>
                  <div className="w-full h-6 bg-[#228b22] rounded-t-sm opacity-40" />
                  <div className="w-full h-9 bg-[#228b22] rounded-t-sm opacity-60" />
                  <div className="w-full h-12 bg-[#228b22] rounded-t-sm opacity-80" />
                  <div className="w-full h-16 bg-[#228b22] rounded-t-sm opacity-90" />
                </div>
                <div className="flex justify-between text-[9px] text-neutral-400 dark:text-neutral-500 font-mono mt-1">
                  <span>Start: $0.85</span>
                  <span>Slope: +0.015</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
