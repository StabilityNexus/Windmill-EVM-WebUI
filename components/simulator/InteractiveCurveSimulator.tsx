'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  TrendingDown,
  TrendingUp,
  Info,
  Sparkles,
} from 'lucide-react';

// ── SVG Coordinate Mapping Constants & Helpers ─────────────────────
const SVG_WIDTH = 600;
const SVG_HEIGHT = 240;
const PADDING = { top: 20, right: 30, bottom: 30, left: 55 };
const GRAPH_WIDTH = SVG_WIDTH - PADDING.left - PADDING.right;
const GRAPH_HEIGHT = SVG_HEIGHT - PADDING.top - PADDING.bottom;
const MIN_PRICE_BOUND = 2200;
const MAX_PRICE_BOUND = 3800;
const MAX_TIME = 600; // 10 minutes max window

function getSvgX(t: number): number {
  return PADDING.left + (Math.max(0, Math.min(MAX_TIME, t)) / MAX_TIME) * GRAPH_WIDTH;
}

function getSvgY(p: number): number {
  const clamped = Math.max(MIN_PRICE_BOUND, Math.min(MAX_PRICE_BOUND, p));
  return PADDING.top + (1 - (clamped - MIN_PRICE_BOUND) / (MAX_PRICE_BOUND - MIN_PRICE_BOUND)) * GRAPH_HEIGHT;
}

export default function InteractiveCurveSimulator() {
  // ── Simulator Parameters ───────────────────────────────────────────
  // Protocol Rule: An order match occurs when BuyPrice(t) >= SellPrice(t)
  // Educational Price Discovery Sequence:
  // Buyer starts lower ($2,700) with positive slope (+0.8/s, bidding higher over time)
  // Seller starts higher ($3,300) with negative slope (-0.6/s, lowering ask over time)
  // They start apart with a spread, converge, and match when curves meet (Buy >= Sell)
  const [buyStart, setBuyStart] = useState(2700);
  const [buySlope, setBuySlope] = useState(0.8);
  const [sellStart, setSellStart] = useState(3300);
  const [sellSlope, setSellSlope] = useState(-0.6);

  const [time, setTime] = useState(0); // 0 to 600 seconds
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(5); // 1x, 5x, 10x

  const maxTime = MAX_TIME;

  // ── Animation Loop ────────────────────────────────────────────────
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Exact crossing time computation: P_buy(t) = P_sell(t)
  // buyStart + buySlope * t = sellStart + sellSlope * t
  // t = (sellStart - buyStart) / (buySlope - sellSlope)
  const crossingTime = useMemo(() => {
    const priceDiff = sellStart - buyStart;
    const slopeDiff = buySlope - sellSlope;
    if (Math.abs(slopeDiff) < 0.0001) return null;
    const t = priceDiff / slopeDiff;
    return t > 0 && t <= maxTime ? Math.round(t * 100) / 100 : null;
  }, [buyStart, buySlope, sellStart, sellSlope, maxTime]);

  // Crossing price at t*
  const crossingPrice = useMemo(() => {
    if (crossingTime === null) return null;
    return Math.round((buyStart + buySlope * crossingTime) * 100) / 100;
  }, [buyStart, buySlope, crossingTime]);

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

          // After match, curves stop moving further:
          // Halt animation right at the crossing point when match condition is achieved
          if (crossingTime !== null && prev < crossingTime && next >= crossingTime) {
            setIsPlaying(false);
            return crossingTime;
          }

          if (next >= maxTime) {
            setIsPlaying(false);
            return maxTime;
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
  }, [isPlaying, playbackSpeed, maxTime, crossingTime]);

  // ── Price Computations ─────────────────────────────────────────────
  const currentBuyPrice = Math.max(100, Math.round((buyStart + buySlope * time) * 100) / 100);
  const currentSellPrice = Math.max(100, Math.round((sellStart + sellSlope * time) * 100) / 100);

  // Protocol Match Condition: BuyPrice(t) >= SellPrice(t)
  // When buyer's bid meets or exceeds seller's asking price, keepers can match.
  const isMatchable = currentBuyPrice >= currentSellPrice;

  const settlementPrice = crossingPrice ?? Math.round(((currentBuyPrice + currentSellPrice) / 2) * 100) / 100;
  const keeperFee = Math.round((settlementPrice * 0.001) * 1000) / 1000;
  const currentSpread = Math.max(0, Math.round((currentSellPrice - currentBuyPrice) * 100) / 100);

  // Generate SVG paths with smooth resolution
  const buyPath = useMemo(() => {
    const points: string[] = [];
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * MAX_TIME;
      const p = Math.max(100, buyStart + buySlope * t);
      points.push(`${getSvgX(t).toFixed(1)},${getSvgY(p).toFixed(1)}`);
    }
    return `M ${points.join(' L ')}`;
  }, [buyStart, buySlope]);

  const sellPath = useMemo(() => {
    const points: string[] = [];
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * MAX_TIME;
      const p = Math.max(100, sellStart + sellSlope * t);
      points.push(`${getSvgX(t).toFixed(1)},${getSvgY(p).toFixed(1)}`);
    }
    return `M ${points.join(' L ')}`;
  }, [sellStart, sellSlope]);

  // Toggle play/pause (restarts from 0 if already settled at match point)
  const togglePlay = () => {
    if (!isPlaying) {
      if (crossingTime !== null && time >= crossingTime) {
        setTime(0);
      }
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  // Preset scenarios demonstrating various slope configurations
  const applyPreset = (preset: 'standard' | 'fast' | 'both-negative' | 'both-positive') => {
    setTime(0);
    if (preset === 'standard') {
      setBuyStart(2700);
      setBuySlope(0.8);
      setSellStart(3300);
      setSellSlope(-0.6);
    } else if (preset === 'fast') {
      setBuyStart(2800);
      setBuySlope(1.5);
      setSellStart(3200);
      setSellSlope(-1.2);
    } else if (preset === 'both-negative') {
      // Demonstrates Buy having a -ve slope while still converging and matching
      setBuyStart(3100);
      setBuySlope(-0.5);
      setSellStart(3400);
      setSellSlope(-1.5);
    } else if (preset === 'both-positive') {
      // Demonstrates Sell having a +ve slope while still converging and matching
      setBuyStart(2600);
      setBuySlope(1.8);
      setSellStart(2900);
      setSellSlope(0.8);
    }
    setIsPlaying(true);
  };

  return (
    <div className="w-full rounded-3xl border border-black/10 bg-white p-6 sm:p-8 md:p-10 shadow-xl transition-all select-none">
      {/* ── Top Header Bar ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-black/5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-emerald-600">
              Live Mathematical Engine
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Dynamic Pricing Curve Simulator
          </h3>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Experience the on-chain formula{' '}
            <code className="px-1.5 py-0.5 rounded bg-neutral-100 font-mono text-[11px] text-neutral-800">
              P(t) = P₀ + s · t
            </code>{' '}
            defined in <span className="font-semibold text-neutral-700">PriceCurve.sol</span>. Matches when{' '}
            <code className="px-1.5 py-0.5 rounded bg-neutral-100 font-mono text-[11px] text-neutral-800">
              BuyPrice(t) ≥ SellPrice(t)
            </code>.
          </p>
        </div>

        {/* Convergence / Match Status Pill */}
        <div className="flex items-center gap-2 shrink-0">
          {isMatchable ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 font-bold text-xs shadow-sm transition-all animate-curve-pulse">
              <Zap className="w-4 h-4 text-emerald-600 fill-current" />
              <span>⚡ Keeper Match Condition Met!</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-600 font-semibold text-xs">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span>Price Discovery in Progress</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Visualizer & Controls Grid ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">
        {/* Main SVG Graph Column (2 Columns wide) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="relative w-full aspect-[2.4/1] bg-neutral-50/70 rounded-2xl border border-black/5 p-2 overflow-hidden shadow-inner select-none">
            <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="w-full h-full">
              {/* Horizontal price grid lines */}
              {[2400, 2800, 3200, 3600].map((price) => {
                const y = getSvgY(price);
                return (
                  <g key={price}>
                    <line
                      x1={PADDING.left}
                      y1={y}
                      x2={SVG_WIDTH - PADDING.right}
                      y2={y}
                      stroke="currentColor"
                      strokeDasharray="4 4"
                      className="text-neutral-200"
                      strokeWidth="1"
                    />
                    <text
                      x={PADDING.left - 8}
                      y={y + 3}
                      textAnchor="end"
                      className="fill-neutral-400 text-[9px] font-mono"
                    >
                      ${price}
                    </text>
                  </g>
                );
              })}

              {/* Time Axis Markers */}
              {[0, 150, 300, 450, 600].map((t) => {
                const x = getSvgX(t);
                return (
                  <g key={t}>
                    <line
                      x1={x}
                      y1={PADDING.top}
                      x2={x}
                      y2={SVG_HEIGHT - PADDING.bottom}
                      stroke="currentColor"
                      strokeDasharray="4 4"
                      className="text-neutral-200"
                      strokeWidth="0.8"
                    />
                    <text
                      x={x}
                      y={SVG_HEIGHT - PADDING.bottom + 16}
                      textAnchor="middle"
                      className="fill-neutral-400 text-[9px] font-mono"
                    >
                      {t}s
                    </text>
                  </g>
                );
              })}

              {/* Crossing Point Indicator (Intersection Beacon) */}
              {crossingTime !== null && (
                <g>
                  {/* Vertical dashed line at crossing point */}
                  <line
                    x1={getSvgX(crossingTime)}
                    y1={PADDING.top}
                    x2={getSvgX(crossingTime)}
                    y2={SVG_HEIGHT - PADDING.bottom}
                    stroke="#FFC517"
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                    className="opacity-80"
                  />
                  {/* Outer pulse circle */}
                  <circle
                    cx={getSvgX(crossingTime)}
                    cy={getSvgY(crossingPrice ?? 3000)}
                    r="8"
                    fill="#FFC517"
                    className="opacity-25 animate-ping"
                  />
                  {/* Center intersection dot */}
                  <circle
                    cx={getSvgX(crossingTime)}
                    cy={getSvgY(crossingPrice ?? 3000)}
                    r="4.5"
                    fill="#FFC517"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                </g>
              )}

              {/* Buy Curve Path (Emerald) */}
              <path d={buyPath} fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />

              {/* Sell Curve Path (Blue) */}
              <path d={sellPath} fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />

              {/* Current Time Cursor Vertical Bar */}
              <line
                x1={getSvgX(time)}
                y1={PADDING.top}
                x2={getSvgX(time)}
                y2={SVG_HEIGHT - PADDING.bottom}
                stroke="currentColor"
                strokeWidth="1.8"
                className="text-neutral-900 transition-all"
              />

              {/* Current Buy Price Dot on cursor */}
              <circle
                cx={getSvgX(time)}
                cy={getSvgY(currentBuyPrice)}
                r="5"
                className="fill-emerald-500 stroke-white"
                strokeWidth="2"
              />

              {/* Current Sell Price Dot on cursor */}
              <circle
                cx={getSvgX(time)}
                cy={getSvgY(currentSellPrice)}
                r="5"
                className="fill-blue-500 stroke-white"
                strokeWidth="2"
              />
            </svg>
          </div>

          {/* Controls Bar (Play/Pause, Reset, Speed multipliers, Time Slider) */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 bg-neutral-50 rounded-2xl border border-black/5">
            <div className="flex items-center gap-2">
              {/* Play / Pause Toggle */}
              <button
                type="button"
                onClick={togglePlay}
                className="h-9 w-9 rounded-full bg-black text-white flex items-center justify-center hover:opacity-85 transition-opacity cursor-pointer shadow-xs"
                title={isPlaying ? 'Pause Simulator' : 'Play Simulator'}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 ml-0.5 fill-current" />}
              </button>

              {/* Reset to 0s */}
              <button
                type="button"
                onClick={() => setTime(0)}
                className="h-9 w-9 rounded-full border border-neutral-200 bg-white text-neutral-600 flex items-center justify-center hover:border-black transition-colors cursor-pointer"
                title="Reset Time to 0s"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Speed Multipliers */}
              <div className="flex items-center gap-1 ml-2 bg-neutral-200/60 p-1 rounded-full">
                {[1, 5, 10].map((speed) => (
                  <button
                    key={speed}
                    type="button"
                    onClick={() => setPlaybackSpeed(speed)}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                      playbackSpeed === speed
                        ? 'bg-white text-black shadow-xs'
                        : 'text-neutral-500 hover:text-black'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            {/* Time Scrub Slider */}
            <div className="flex items-center gap-3 flex-1 max-w-xs min-w-[200px]">
              <span className="text-[10.5px] font-mono text-neutral-500 font-bold shrink-0">
                t = {Math.round(time)}s
              </span>
              <input
                type="range"
                min="0"
                max={maxTime}
                step="1"
                value={Math.round(time)}
                onChange={(e) => setTime(Number(e.target.value))}
                className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-black"
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar Column: Metrics & Sliders (1 Column wide) */}
        <div className="flex flex-col gap-4">
          {/* Live Metrics Box */}
          <div className="p-4.5 rounded-2xl bg-neutral-50 border border-black/5 flex flex-col gap-3">
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center gap-1.5 font-bold text-emerald-600">
                <TrendingDown className="w-3.5 h-3.5" /> Buy Bid Price:
              </span>
              <span className="font-mono font-bold text-black text-sm">
                ${currentBuyPrice.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center gap-1.5 font-bold text-blue-600">
                <TrendingUp className="w-3.5 h-3.5" /> Sell Ask Price:
              </span>
              <span className="font-mono font-bold text-black text-sm">
                ${currentSellPrice.toFixed(2)}
              </span>
            </div>

            <div className="border-t border-neutral-200 pt-2.5 flex justify-between items-center text-xs">
              <span className="text-neutral-500 font-medium">
                {isMatchable ? 'Execution Settlement:' : 'Current Spread:'}
              </span>
              <span className="font-mono font-bold text-black">
                {isMatchable ? `$${settlementPrice.toFixed(2)}` : `$${currentSpread.toFixed(2)}`}
              </span>
            </div>

            <div className="flex justify-between items-center text-[11px] text-neutral-500">
              <span>Keeper Fee (0.1%):</span>
              <span className="font-mono text-emerald-600 font-semibold">
                +${keeperFee.toFixed(3)}
              </span>
            </div>
          </div>

          {/* Curve Configuration Box (Sliders) */}
          <div className="flex flex-col gap-3.5 p-4.5 rounded-2xl border border-black/5 bg-white">
            <div className="flex items-center justify-between pb-1 border-b border-black/5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" /> Curve Configuration
              </h4>
              <span className="text-[10px] font-mono text-neutral-400">P(t) = P₀ + s·t</span>
            </div>

            {/* Buy Start Price Slider */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-neutral-600 font-medium">Buy Start P₀ (Bid):</span>
                <span className="font-mono font-bold text-emerald-600">${buyStart}</span>
              </div>
              <input
                type="range"
                min="2200"
                max="3800"
                step="50"
                value={buyStart}
                onChange={(e) => setBuyStart(Number(e.target.value))}
                className="w-full h-1 bg-neutral-200 rounded appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Buy Slope Slider: supports both +ve and -ve slopes */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-neutral-600 font-medium">Buy Slope (s):</span>
                <span className="font-mono font-bold text-emerald-600">
                  {buySlope > 0 ? `+${buySlope}` : buySlope} /s
                </span>
              </div>
              <input
                type="range"
                min="-3.0"
                max="3.0"
                step="0.1"
                value={buySlope}
                onChange={(e) => setBuySlope(Number(e.target.value))}
                className="w-full h-1 bg-neutral-200 rounded appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Sell Start Price Slider */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-neutral-600 font-medium">Sell Start P₀ (Ask):</span>
                <span className="font-mono font-bold text-blue-600">${sellStart}</span>
              </div>
              <input
                type="range"
                min="2200"
                max="3800"
                step="50"
                value={sellStart}
                onChange={(e) => setSellStart(Number(e.target.value))}
                className="w-full h-1 bg-neutral-200 rounded appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Sell Slope Slider: supports both +ve and -ve slopes */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-neutral-600 font-medium">Sell Slope (s):</span>
                <span className="font-mono font-bold text-blue-600">
                  {sellSlope > 0 ? `+${sellSlope}` : sellSlope} /s
                </span>
              </div>
              <input
                type="range"
                min="-3.0"
                max="3.0"
                step="0.1"
                value={sellSlope}
                onChange={(e) => setSellSlope(Number(e.target.value))}
                className="w-full h-1 bg-neutral-200 rounded appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Scenario Presets */}
            <div className="pt-2 flex flex-col gap-1.5 border-t border-black/5">
              <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Presets:</span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => applyPreset('standard')}
                  className="px-2 py-1 rounded text-[9.5px] font-bold bg-neutral-100 text-neutral-700 hover:bg-neutral-200 cursor-pointer text-center"
                >
                  Standard
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('fast')}
                  className="px-2 py-1 rounded text-[9.5px] font-bold bg-neutral-100 text-neutral-700 hover:bg-neutral-200 cursor-pointer text-center"
                >
                  Fast Match
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('both-negative')}
                  className="px-2 py-1 rounded text-[9.5px] font-bold bg-neutral-100 text-neutral-700 hover:bg-neutral-200 cursor-pointer text-center"
                  title="Both slopes negative: Buy -0.5/s, Sell -1.5/s"
                >
                  Both -ve Slopes
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('both-positive')}
                  className="px-2 py-1 rounded text-[9.5px] font-bold bg-neutral-100 text-neutral-700 hover:bg-neutral-200 cursor-pointer text-center"
                  title="Both slopes positive: Buy +1.8/s, Sell +0.8/s"
                >
                  Both +ve Slopes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Real-World Example Walkthrough: Alice & Bob (ETH/USDC) ── */}
      <div className="mt-8 pt-6 border-t border-black/5">
        <div className="rounded-2xl bg-neutral-50/70 border border-black/5 p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[#FFC517]" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-black">
              Example Walkthrough: Alice & Bob (ETH / USDC Pair)
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Alice Card */}
            <div className="p-4 rounded-xl bg-white border border-emerald-500/20 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-emerald-600">Alice (Buyer)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-700 font-bold">
                  Buy 1.0 ETH
                </span>
              </div>
              <p className="text-neutral-600 leading-relaxed">
                Alice wants to buy ETH. She can set a positive or negative slope. Here, her bid starts at{' '}
                <strong>${buyStart}</strong> with slope{' '}
                <strong>{buySlope > 0 ? `+${buySlope}` : buySlope}/s</strong>.
              </p>
            </div>

            {/* Bob Card */}
            <div className="p-4 rounded-xl bg-white border border-blue-500/20 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-blue-600">Bob (Seller)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-700 font-bold">
                  Sell 1.0 ETH
                </span>
              </div>
              <p className="text-neutral-600 leading-relaxed">
                Bob wants to sell ETH. He can also configure a positive or negative slope. Here, his ask starts at{' '}
                <strong>${sellStart}</strong> with slope{' '}
                <strong>{sellSlope > 0 ? `+${sellSlope}` : sellSlope}/s</strong>.
              </p>
            </div>

            {/* Keeper Settlement Card */}
            <div className="p-4 rounded-xl bg-white border border-amber-500/20 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-amber-600">Autonomous Keeper</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-700 font-bold">
                  0.1% Reward
                </span>
              </div>
              <p className="text-neutral-600 leading-relaxed">
                Keepers scan for <code>BuyPrice(t) ≥ SellPrice(t)</code>. At{' '}
                <strong>t = {crossingTime !== null ? `${crossingTime}s` : 'N/A'}</strong>, prices cross at{' '}
                <strong>${crossingPrice?.toFixed(2) ?? '3,000.00'}</strong>. The keeper executes the atomic swap on-chain
                (+${keeperFee.toFixed(3)} bounty) and <strong>the curves stop moving once settled</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
