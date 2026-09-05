'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

/* ═══════════════════════════════════════════════════════════════
   WINDMILL — Protocol Order Matching & Settlement Showcase
   Full-width expansive canvas layout utilizing the entire screen.
   ═══════════════════════════════════════════════════════════════ */

const ORDER_JSON_LINES = [
  `{`,
  `  "orderId":    "142",`,
  `  "pair":       "WETH / USDC",`,
  `  "amountIn":   "1.50 WETH",`,
  `  "startPrice": "3124.50 RAY",`,
  `  "slope":      "-0.20 RAY/s",`,
  `  "status":     "ACTIVE"`,
  `}`,
];

const SCRAMBLE_CHARS = '0123456789ABCDEF!#$&';

/* ── SVG Technical Grid ───────────────────────────────────────── */
function GridBackground() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="spade-style-grid-full" width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#EAEAEA" strokeWidth="0.8" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#spade-style-grid-full)" />
    </svg>
  );
}

/* ── Live Scramble Line (tied to reveal progress 0..1) ────────── */
function ScrollScrambleLine({ text, progress }: { text: string; progress: number }) {
  const [scrambled, setScrambled] = useState(text);

  useEffect(() => {
    if (progress <= 0) {
      setScrambled('');
      return;
    }
    if (progress >= 1) {
      setScrambled(text);
      return;
    }

    const total = text.length;
    const resolvedCount = Math.floor(progress * total);
    let result = '';
    for (let i = 0; i < total; i++) {
      if (i < resolvedCount) {
        result += text[i];
      } else if (text[i] === ' ') {
        result += ' ';
      } else {
        result += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }
    }
    setScrambled(result);
  }, [progress, text]);

  return (
    <div className="text-xs sm:text-[13px] leading-5 font-mono text-neutral-800 dark:text-neutral-200 whitespace-pre font-medium">
      {scrambled}
    </div>
  );
}

/* ── Subcomponent: Top-Left JSON Terminal ─────────────────────── */
function JsonTerminal({ lineCount }: { lineCount: number }) {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden w-full select-none">
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-800/50">
        <div className="flex gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
          <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
          <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10.5px] font-mono font-bold bg-neutral-200/80 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 px-2.5 py-0.5 rounded-md">
            getOrder(142)
          </span>
          <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
      <div className="p-4 sm:p-5 font-mono text-xs sm:text-[13px] leading-6 text-neutral-800 dark:text-neutral-200 min-h-[195px]">
        {ORDER_JSON_LINES.slice(0, Math.max(1, lineCount)).map((line, i) => (
          <div key={i} className="whitespace-pre">{line}</div>
        ))}
        {lineCount < ORDER_JSON_LINES.length && lineCount > 0 && (
          <span className="inline-block w-2 h-4 bg-black dark:bg-white animate-pulse ml-0.5 align-middle" />
        )}
      </div>
    </div>
  );
}

/* ── Subcomponent: Bottom-Left Contract & Latency ────────────── */
function ContractKeyBar({ charCount, latencyVal }: { charCount: number; latencyVal: number }) {
  const FULL_ADDR = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9';
  const displayedKey = FULL_ADDR.slice(0, charCount);
  const heights = [3, 5, 7, 6, 8, 7, 5, 4, 6, 7];

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden w-full select-none">
      <div className="px-4 py-3">
        <div className="text-[9.5px] uppercase tracking-widest text-neutral-400 font-bold mb-1.5">
          [ SETTLEMENT CONTRACT ]
        </div>
        <div className="font-mono text-xs sm:text-[13px] text-neutral-800 dark:text-neutral-200 tracking-tight font-medium truncate min-h-[20px]">
          {displayedKey}
          {charCount < FULL_ADDR.length && charCount > 0 && (
            <span className="inline-block w-1.5 h-3.5 bg-black dark:bg-white animate-pulse ml-0.5 align-middle" />
          )}
        </div>
      </div>
      <div className="h-px bg-neutral-100 dark:bg-neutral-800 mx-4" />
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold shrink-0">BLOCK LATENCY</span>
        <div className="flex items-end gap-1.5 h-4 flex-1">
          {heights.map((h, i) => (
            <span
              key={i}
              className="flex-1 rounded-xs bg-emerald-500 transition-all duration-150"
              style={{
                height: latencyVal > 0 ? `${Math.min(16, (h * latencyVal) / 20)}px` : '3px',
              }}
            />
          ))}
        </div>
        <span className="font-mono text-xs sm:text-[13px] font-bold text-neutral-800 dark:text-neutral-200 shrink-0 w-12 text-right">
          {Math.round(latencyVal)}MS
        </span>
      </div>
    </div>
  );
}

/* ── Subcomponent: Center Enriched Settlement Card ───────────── */
function EnrichedSettlementCard({ priceVal, fillRatio }: { priceVal: number; fillRatio: number }) {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl shadow-xl overflow-hidden w-[330px] sm:w-[350px] select-none">
      <div className="m-2.5 rounded-xl p-4 text-white shadow-inner" style={{ background: '#112217' }}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-base font-bold shadow-inner">
              ⚡
            </div>
            <div>
              <div className="text-[13px] font-extrabold text-white tracking-wide font-sans">Windmill Match Node</div>
              <div className="text-[9.5px] text-white/50 font-mono mt-0.5">Buy #142 ↔ Sell #148</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-extrabold text-white tracking-tight leading-none font-mono">
              ${priceVal.toFixed(2)}
            </div>
            <div className="text-[9px] text-emerald-400 font-bold mt-1 uppercase tracking-wider">Settled ↗</div>
          </div>
        </div>

        <div className="mt-3.5 pt-2 border-t border-white/10">
          <div className="h-1.5 bg-white/15 w-full rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-150"
              style={{ width: `${Math.min(100, fillRatio * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] text-white/40 font-mono mt-1.5 uppercase">
            <span>Executed: {Math.round(fillRatio * 100)}%</span>
            <span>1.5 WETH</span>
          </div>
        </div>
      </div>

      <div className="px-5 py-2.5 flex flex-col divide-y divide-neutral-100 dark:divide-neutral-800 text-[11px] sm:text-xs">
        <div className="flex justify-between py-2">
          <span className="text-neutral-400 font-medium">Matching Engine</span>
          <span className="text-neutral-800 dark:text-neutral-200 font-bold font-mono">Two-Pointer Sweep</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-neutral-400 font-medium">Keeper Fee</span>
          <span className="text-neutral-800 dark:text-neutral-200 font-bold font-mono">0.1% Flat</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-neutral-400 font-medium">Settlement Type</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">100% On-Chain Atomic</span>
        </div>
      </div>
    </div>
  );
}

/* ── Subcomponent: Right Matrix Decode Card ──────────────────── */
function RightDecodeCard({
  label,
  lines,
  progress,
}: {
  label: string;
  lines: string[];
  progress: number;
}) {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl shadow-sm p-4 w-full select-none">
      <div className="text-[9.5px] uppercase tracking-widest text-neutral-400 font-extrabold pb-2 mb-2 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-1.5">
        <span className="text-neutral-400">►</span> {label}
      </div>
      <div className="flex flex-col gap-1">
        {lines.map((line, i) => (
          <ScrollScrambleLine key={i} text={line} progress={progress} />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT: Scroll-Pinned Fullscreen Stage
   ═══════════════════════════════════════════════════════════════ */

export default function FloatingProtocolSection() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 22,
    restDelta: 0.001,
  });

  const [pVal, setPVal] = useState(0);

  useEffect(() => {
    const unsub = smoothProgress.on('change', (v) => {
      setPVal(v);
    });
    return () => unsub();
  }, [smoothProgress]);

  // Stage transforms
  const introOpacity = useTransform(smoothProgress, [0, 0.12, 0.20], [1, 0.6, 0]);
  const introBlur = useTransform(smoothProgress, [0, 0.12, 0.20], ['blur(0px)', 'blur(3px)', 'blur(8px)']);
  const introY = useTransform(smoothProgress, [0, 0.20], [0, -18]);

  const headlineOpacity = useTransform(smoothProgress, [0.15, 0.28, 0.95, 1.0], [0, 1, 1, 0.95]);
  const headlineY = useTransform(smoothProgress, [0.15, 0.28], [18, 0]);

  const leftColOpacity = useTransform(smoothProgress, [0.24, 0.38], [0, 1]);
  const leftColX = useTransform(smoothProgress, [0.24, 0.38], [-25, 0]);

  const centerCardOpacity = useTransform(smoothProgress, [0.36, 0.50], [0, 1]);
  const centerCardScale = useTransform(smoothProgress, [0.36, 0.50], [0.92, 1]);
  const centerCardY = useTransform(smoothProgress, [0.36, 0.50], [25, 0]);

  const card1Opacity = useTransform(smoothProgress, [0.46, 0.58], [0, 1]);
  const card1X = useTransform(smoothProgress, [0.46, 0.58], [25, 0]);

  const card2Opacity = useTransform(smoothProgress, [0.56, 0.68], [0, 1]);
  const card2X = useTransform(smoothProgress, [0.56, 0.68], [25, 0]);

  const card3Opacity = useTransform(smoothProgress, [0.66, 0.78], [0, 1]);
  const card3X = useTransform(smoothProgress, [0.66, 0.78], [25, 0]);

  // Procedural computations
  const jsonLineCount = useMemo(() => {
    if (pVal < 0.24) return 0;
    const norm = Math.min(1, Math.max(0, (pVal - 0.24) / 0.24));
    return Math.floor(norm * ORDER_JSON_LINES.length);
  }, [pVal]);

  const apiKeyChars = useMemo(() => {
    if (pVal < 0.28) return 0;
    const norm = Math.min(1, Math.max(0, (pVal - 0.28) / 0.20));
    return Math.floor(norm * 42);
  }, [pVal]);

  const latencyNumber = useMemo(() => {
    if (pVal < 0.28) return 0;
    const norm = Math.min(1, Math.max(0, (pVal - 0.28) / 0.20));
    return norm * 48;
  }, [pVal]);

  const receiptPrice = useMemo(() => {
    if (pVal < 0.36) return 0;
    const norm = Math.min(1, Math.max(0, (pVal - 0.36) / 0.28));
    return 3000.0 + norm * (3124.5 - 3000.0);
  }, [pVal]);

  const receiptFill = useMemo(() => {
    if (pVal < 0.36) return 0;
    return Math.min(1, Math.max(0, (pVal - 0.36) / 0.28)) * 0.82;
  }, [pVal]);

  const card1Progress = useMemo(() => {
    if (pVal < 0.46) return 0;
    return Math.min(1, Math.max(0, (pVal - 0.46) / 0.12));
  }, [pVal]);

  const card2Progress = useMemo(() => {
    if (pVal < 0.56) return 0;
    return Math.min(1, Math.max(0, (pVal - 0.56) / 0.12));
  }, [pVal]);

  const card3Progress = useMemo(() => {
    if (pVal < 0.66) return 0;
    return Math.min(1, Math.max(0, (pVal - 0.66) / 0.12));
  }, [pVal]);

  return (
    <div
      ref={containerRef}
      id="protocol-showcase"
      className="relative w-full bg-white dark:bg-[#0a0a0a] text-foreground transition-colors duration-300"
      style={{ height: '190vh' }}
    >
      {/* ── STICKY PINNED STAGE ── */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center pt-16 sm:pt-20 pb-4 px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        <GridBackground />

        {/* Soft edge masks */}
        <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-white dark:from-[#0a0a0a] to-transparent pointer-events-none z-10" />
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-white dark:from-[#0a0a0a] to-transparent pointer-events-none z-10" />

        {/* Expansive full-width layout container with generous breathing room */}
        <div className="relative w-full max-w-[1500px] mx-auto flex flex-col justify-between py-2 sm:py-4 z-20 pointer-events-none" style={{ maxHeight: 'calc(100vh - 6rem)' }}>
          
          {/* Top Row: Spaced out to screen edges */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-start w-full">
            {/* Top-Left: Raw API Order Stream */}
            <motion.div
              style={{ opacity: leftColOpacity, x: leftColX }}
              className="hidden lg:block lg:col-span-4 xl:col-span-3 pointer-events-auto"
            >
              <JsonTerminal lineCount={jsonLineCount} />
            </motion.div>

            {/* Top-Center: Text Headline Area with plenty of clearance */}
            <div className="lg:col-span-4 xl:col-span-6 flex flex-col items-center justify-center text-center px-4 relative min-h-[120px]">
              <motion.p
                style={{ opacity: introOpacity, filter: introBlur, y: introY }}
                className="absolute font-sans text-lg sm:text-xl font-medium text-neutral-500 max-w-lg leading-relaxed pointer-events-none"
              >
                On-chain orders cross at rapid block intervals, <span className="text-black dark:text-white font-bold">requiring automated solver resolution.</span>
              </motion.p>

              <motion.h2
                style={{ opacity: headlineOpacity, y: headlineY }}
                className="font-sans text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-extrabold tracking-tight text-black dark:text-white leading-[1.12] max-w-2xl"
              >
                Windmill settles orders on-chain in{' '}
                <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-black via-neutral-700 to-neutral-500 dark:from-white dark:via-neutral-200 dark:to-neutral-400">
                  real time
                </span>
                , adding structure, accuracy, and intelligence at every layer.
              </motion.h2>
            </div>

            {/* Top-Right: Matching Pair Card */}
            <motion.div
              style={{ opacity: card1Opacity, x: card1X }}
              className="hidden lg:block lg:col-span-4 xl:col-span-3 pointer-events-auto"
            >
              <RightDecodeCard
                label="PAIR RESOLVER"
                lines={['WETH ↔ USDC', 'POINTER: OPTIMAL BID']}
                progress={card1Progress}
              />
            </motion.div>
          </div>

          {/* Bottom Row: Separated and anchored */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-end w-full pt-8">
            {/* Bottom-Left: Contract Key & Latency */}
            <motion.div
              style={{ opacity: leftColOpacity, x: leftColX }}
              className="hidden lg:block lg:col-span-4 xl:col-span-3 pointer-events-auto"
            >
              <ContractKeyBar charCount={apiKeyChars} latencyVal={latencyNumber} />
            </motion.div>

            {/* Bottom-Center: Sleek Settlement Card */}
            <motion.div
              style={{ opacity: centerCardOpacity, scale: centerCardScale, y: centerCardY }}
              className="lg:col-span-4 xl:col-span-6 flex justify-center items-center w-full pointer-events-auto"
            >
              <EnrichedSettlementCard priceVal={receiptPrice} fillRatio={receiptFill} />
            </motion.div>

            {/* Bottom-Right: Curve Specs & Network */}
            <div className="hidden lg:flex lg:col-span-4 xl:col-span-3 flex-col gap-4 pointer-events-auto">
              <motion.div style={{ opacity: card2Opacity, x: card2X }}>
                <RightDecodeCard
                  label="PRICE SLOPE"
                  lines={['P(t) = P0 + s*t', '-0.20 RAY/SEC']}
                  progress={card2Progress}
                />
              </motion.div>

              <motion.div style={{ opacity: card3Opacity, x: card3X }}>
                <RightDecodeCard
                  label="SETTLEMENT VERIFICATION"
                  lines={['SEPOLIA / ANVIL', 'ATOMIC ZERO-SLIPPAGE']}
                  progress={card3Progress}
                />
              </motion.div>
            </div>
          </div>

          {/* Scroll cue indicator */}
          <div className="hidden lg:flex items-center justify-end gap-2 text-[9.5px] font-mono uppercase tracking-widest text-neutral-400 pt-2">
            <span>Scroll {pVal < 0.9 ? 'down' : 'up'} to animate</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>

        </div>
      </div>
    </div>
  );
}
