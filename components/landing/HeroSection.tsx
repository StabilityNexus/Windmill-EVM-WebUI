'use client';

import React from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import StatsPanel from '@/components/landing/StatsPanel';
import { t } from '@/lib/i18n';

// ─── Animation Variants ─────────────────────────────────────────

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

// ─── Component ──────────────────────────────────────────────────

export default function HeroSection() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: "url('/hero-bg.png')",
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="relative z-10 mx-auto max-w-5xl px-6 md:px-8 pt-32 pb-24 flex flex-col items-center text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center"
        >
          {/* ── Pill ─────────────────────────────────────────── */}
          <motion.div variants={itemVariants} className="flex items-center gap-2 mb-8 text-sm font-semibold text-neutral-900 bg-white/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/40">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L12 22M2 12L22 12M5 5L19 19M5 19L19 5" />
            </svg>
            Your multi-chain trading terminal.
          </motion.div>

          {/* ── Heading ──────────────────────────────────────── */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-[80px] font-extrabold tracking-tight text-neutral-950 max-w-4xl leading-[1.05] mb-6 drop-shadow-md"
          >
            Dynamic cross-chain swaps. Powered by Keepers.
          </motion.h1>

          {/* ── Description ──────────────────────────────────── */}
          <motion.div
            variants={itemVariants}
            className="bg-white/50 backdrop-blur-md border border-white/40 px-6 py-4 rounded-2xl shadow-sm max-w-3xl mb-10"
          >
            <p className="text-lg sm:text-xl text-neutral-950 leading-relaxed font-bold">
              Windmill unifies liquidity across all EVM chains, matching orders with unparalleled speed and dynamic optimal pricing, all from one integrated terminal.
            </p>
          </motion.div>

          {/* ── CTAs ─────────────────────────────────────────── */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto mb-10"
          >
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-8 py-4 text-base font-semibold text-white hover:bg-neutral-800 transition-colors shadow-lg w-full sm:w-auto"
            >
              Access Terminal
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white/80 backdrop-blur-sm px-8 py-4 text-base font-semibold text-black hover:bg-white transition-colors shadow-lg w-full sm:w-auto border border-white/50"
            >
              Read Technical Docs
            </Link>
          </motion.div>

          {/* ── Footer Tags ──────────────────────────────────── */}
          <motion.div variants={itemVariants} className="flex items-center gap-3 text-sm font-semibold text-neutral-950 mb-16 bg-white/40 backdrop-blur-sm px-6 py-2 rounded-full border border-white/20">
            <span>Solver Network</span>
            <span className="text-neutral-600">/</span>
            <span>Zero Hidden Fees</span>
            <span className="text-neutral-600">/</span>
            <span>Dynamic Pricing</span>
            <span className="text-neutral-600">/</span>
            <span>Multi-Chain</span>
          </motion.div>
        </motion.div>

        {/* ── Glassmorphic Stats Dashboard ────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full"
        >
          <StatsPanel />
        </motion.div>
      </div>
    </section>
  );
}
