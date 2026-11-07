'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Zap, TrendingDown, TrendingUp, Info } from 'lucide-react';

export default function InteractiveCurveSimulator() {
  // ── Simulator Parameters ───────────────────────────────────────────
  const [buyStart, setBuyStart] = useState<number>(3300);
  const [buySlope, setBuySlope] = useState<number>(-0.8);
  const [sellStart, setSellStart] = useState<number>(2700);
  const [sellSlope, setSellSlope] = useState<number>(0.6);
  const [time, setTime] = useState<number>(0); // 0 to 600 seconds
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(5); // 1x, 5x, 10x

  const maxTime = 600; // 10 minutes max window

  // ── Animation Loop ────────────────────────────────────────────────
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      lastTimeRef.current = null;
      return;
    }

    const animate = (now: number) => {
      if (lastTimeRef.current !== null) {
        const deltaSec = (now - lastTimeRef.current) / 1000;
        setTime((prev) => {
          const next = prev + deltaSec * playbackSpeed;
          if (next >= maxTime) {
            return 0; // loop around smoothly
          }
          return next;
        });
      }
      lastTimeRef.current = now;
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, playbackSpeed]);

  // ── Price Computations ─────────────────────────────────────────────
  const currentBuyPrice = Math.max(100, Math.round((buyStart + buySlope * time) * 100) / 100);
  const currentSellPrice = Math.max(100, Math.round((sellStart + sellSlope * time) * 100) / 100);

  // Cross check: Buy price >= Sell price
  const isMatchable = currentBuyPrice <= currentSellPrice ? false : true;
  const settlementPrice = Math.round(((currentBuyPrice + currentSellPrice) / 2) * 100) / 100;
  const keeperFee = Math.round((settlementPrice * 0.001) * 1000) / 1000;

  // Find exact crossing time
  const crossingTime = useMemo(() => {
    const diff = buyStart - sellStart;
    const slopeDiff = sellSlope - buySlope;
    if (slopeDiff <= 0) return null;
    const t = diff / slopeDiff;
    return t > 0 && t <= maxTime ? Math.round(t) : null;
  }, [buyStart, buySlope, sellStart, sellSlope]);

  // ── SVG Coordinate Mapping ─────────────────────────────────────────
  const svgWidth = 600;
  const svgHeight = 240;
  const padding = { top: 20, right: 30, bottom: 30, left: 55 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  const minPriceBound = 2200;
  const maxPriceBound = 3800;

  const getX = useCallback((t: number) => padding.left + (t / maxTime) * graphWidth, [graphWidth, maxTime, padding.left]);
  const getY = useCallback((p: number) => {
    const clamped = Math.max(minPriceBound, Math.min(maxPriceBound, p));
    return padding.top + (1 - (clamped - minPriceBound) / (maxPriceBound - minPriceBound)) * graphHeight;
  }, [graphHeight, padding.top]);

  // Generate SVG paths
  const buyPath = useMemo(() => {
    const points: string[] = [];
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * maxTime;
      const p = Math.max(100, buyStart + buySlope * t);
      points.push(`${getX(t).toFixed(1)},${getY(p).toFixed(1)}`);
    }
    return `M ${points.join(' L ')}`;
  }, [buyStart, buySlope, getX, getY]);

  const sellPath = useMemo(() => {
    const points: string[] = [];
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * maxTime;
      const p = Math.max(100, sellStart + sellSlope * t);
      points.push(`${getX(t).toFixed(1)},${getY(p).toFixed(1)}`);
    }
    return `M ${points.join(' L ')}`;
  }, [sellStart, sellSlope, getX, getY]);

  return (
    <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 my-16">
      <div className="rounded-3xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl overflow-hidden transition-all">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/5 dark:border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Live Mathematical Engine
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-black dark:text-white tracking-tight mt-1">
              Dynamic Pricing Curve Simulator
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xl">
              Experience the on-chain formula <code className="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded font-mono text-[11px]">P(t) = P₀ + s · t</code> defined in <code className="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded font-mono text-[11px]">PriceCurve.sol</code>.
            </p>
          </div>

          {/* Convergence Status Pill */}
          <div className="flex items-center gap-2">
            {isMatchable ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold text-xs animate-curve-pulse shadow-sm">
                <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 fill-current" />
                <span>Keeper Match Condition Met!</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 font-semibold text-xs">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span>Price Discovery in Progress</span>
              </div>
            )}
          </div>
        </div>

        {/* Visualizer & Graph Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">
          {/* Main SVG Graph */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="relative w-full aspect-[2.4/1] bg-neutral-50/50 dark:bg-neutral-950/60 rounded-2xl border border-black/5 dark:border-white/10 p-2 overflow-hidden select-none">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full">
                {/* Horizontal price grid lines */}
                {[2400, 2800, 3200, 3600].map((price) => {
                  const y = getY(price);
                  return (
                    <g key={price}>
                      <line
                        x1={padding.left}
                        y1={y}
                        x2={svgWidth - padding.right}
                        y2={y}
                        stroke="currentColor"
                        strokeDasharray="4 4"
                        className="text-neutral-200 dark:text-neutral-800"
                        strokeWidth="1"
                      />
                      <text
                        x={padding.left - 8}
                        y={y + 3}
                        textAnchor="end"
                        className="fill-neutral-400 dark:fill-neutral-500 text-[9px] font-mono"
                      >
                        ${price}
                      </text>
                    </g>
                  );
                })}

                {/* Time Axis Markers */}
                {[0, 150, 300, 450, 600].map((t) => {
                  const x = getX(t);
                  return (
                    <g key={t}>
                      <line
                        x1={x}
                        y1={padding.top}
                        x2={x}
                        y2={svgHeight - padding.bottom}
                        stroke="currentColor"
                        strokeDasharray="4 4"
                        className="text-neutral-200 dark:text-neutral-800"
                        strokeWidth="0.8"
                      />
                      <text
                        x={x}
                        y={svgHeight - padding.bottom + 16}
                        textAnchor="middle"
                        className="fill-neutral-400 dark:fill-neutral-500 text-[9px] font-mono"
                      >
                        {t}s
                      </text>
                    </g>
                  );
                })}

                {/* Crossing Point Indicator Line (if reachable) */}
                {crossingTime !== null && (
                  <g>
                    <line
                      x1={getX(crossingTime)}
                      y1={padding.top}
                      x2={getX(crossingTime)}
                      y2={svgHeight - padding.bottom}
                      stroke="#FFC517"
                      strokeWidth="1.2"
                      strokeDasharray="3 3"
                    />
                    <circle
                      cx={getX(crossingTime)}
                      cy={getY(buyStart + buySlope * crossingTime)}
                      r="4.5"
                      fill="#FFC517"
                      className="animate-pulse"
                    />
                  </g>
                )}

                {/* Buy Curve Path (Emerald) */}
                <path
                  d={buyPath}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Sell Curve Path (Blue) */}
                <path
                  d={sellPath}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Current Time Cursor Vertical Bar */}
                <line
                  x1={getX(time)}
                  y1={padding.top}
                  x2={getX(time)}
                  y2={svgHeight - padding.bottom}
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="text-neutral-900 dark:text-white"
                />

                {/* Current Buy Price Dot */}
                <circle
                  cx={getX(time)}
                  cy={getY(currentBuyPrice)}
                  r="5"
                  className="fill-emerald-500 stroke-white dark:stroke-neutral-900"
                  strokeWidth="2"
                />

                {/* Current Sell Price Dot */}
                <circle
                  cx={getX(time)}
                  cy={getY(currentSellPrice)}
                  r="5"
                  className="fill-blue-500 stroke-white dark:stroke-neutral-900"
                  strokeWidth="2"
                />
              </svg>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-2xl border border-black/5 dark:border-white/10">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="h-9 w-9 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center hover:opacity-85 transition-opacity cursor-pointer shadow-xs"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => setTime(0)}
                  className="h-9 w-9 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 flex items-center justify-center hover:border-black dark:hover:border-white transition-colors cursor-pointer"
                  title="Reset Time"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-center gap-1 ml-2">
                  {[1, 5, 10].map((speed) => (
                    <button
                      key={speed}
                      type="button"
                      onClick={() => setPlaybackSpeed(speed)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                        playbackSpeed === speed
                          ? 'bg-black text-white dark:bg-white dark:text-black'
                          : 'text-neutral-500 hover:text-black dark:hover:text-white'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slider */}
              <div className="flex items-center gap-3 flex-1 max-w-xs min-w-[180px]">
                <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 font-bold shrink-0">
                  t = {Math.round(time)}s
                </span>
                <input
                  type="range"
                  min="0"
                  max={maxTime}
                  step="1"
                  value={Math.round(time)}
                  onChange={(e) => setTime(Number(e.target.value))}
                  className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
                />
              </div>
            </div>
          </div>

          {/* Interactive Parameters Panel */}
          <div className="flex flex-col gap-4">
            {/* Live Metrics Box */}
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800 flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                  <TrendingDown className="w-3.5 h-3.5" /> Buy Bid Price:
                </span>
                <span className="font-mono font-bold text-black dark:text-white text-sm">
                  ${currentBuyPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400">
                  <TrendingUp className="w-3.5 h-3.5" /> Sell Ask Price:
                </span>
                <span className="font-mono font-bold text-black dark:text-white text-sm">
                  ${currentSellPrice.toFixed(2)}
                </span>
              </div>
              <div className="border-t border-neutral-200 dark:border-neutral-700 pt-3 flex justify-between items-center text-xs">
                <span className="text-neutral-500 dark:text-neutral-400">Midpoint Settlement:</span>
                <span className="font-mono font-bold text-black dark:text-white">
                  ${settlementPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-neutral-400 dark:text-neutral-500">
                <span>Keeper Fee (0.1%):</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  +${keeperFee.toFixed(3)}
                </span>
              </div>
            </div>

            {/* Slider Adjusters */}
            <div className="flex flex-col gap-4 p-4 rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-neutral-900">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                <Info className="w-3.5 h-3.5" /> Curve Configuration
              </h4>

              {/* Buy Start Price Slider */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-neutral-600 dark:text-neutral-400">Buy Start P₀:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">${buyStart}</span>
                </div>
                <input
                  type="range"
                  min="3000"
                  max="3600"
                  step="50"
                  value={buyStart}
                  onChange={(e) => setBuyStart(Number(e.target.value))}
                  className="w-full h-1 bg-neutral-200 dark:bg-neutral-700 rounded appearance-none accent-emerald-500"
                />
              </div>

              {/* Buy Slope Slider */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-neutral-600 dark:text-neutral-400">Buy Slope (s &lt; 0):</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{buySlope} /s</span>
                </div>
                <input
                  type="range"
                  min="-2"
                  max="-0.1"
                  step="0.1"
                  value={buySlope}
                  onChange={(e) => setBuySlope(Number(e.target.value))}
                  className="w-full h-1 bg-neutral-200 dark:bg-neutral-700 rounded appearance-none accent-emerald-500"
                />
              </div>

              {/* Sell Start Price Slider */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-neutral-600 dark:text-neutral-400">Sell Start P₀:</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">${sellStart}</span>
                </div>
                <input
                  type="range"
                  min="2400"
                  max="3000"
                  step="50"
                  value={sellStart}
                  onChange={(e) => setSellStart(Number(e.target.value))}
                  className="w-full h-1 bg-neutral-200 dark:bg-neutral-700 rounded appearance-none accent-blue-500"
                />
              </div>

              {/* Sell Slope Slider */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-neutral-600 dark:text-neutral-400">Sell Slope (s &gt; 0):</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">+{sellSlope} /s</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="2"
                  step="0.1"
                  value={sellSlope}
                  onChange={(e) => setSellSlope(Number(e.target.value))}
                  className="w-full h-1 bg-neutral-200 dark:bg-neutral-700 rounded appearance-none accent-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
