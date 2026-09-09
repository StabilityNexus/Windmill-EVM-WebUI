'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, ArrowUpRight, Menu, X } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import FloatingCard from '@/components/ui/FloatingCard';
import HeroCollage from '@/components/landing/hero/HeroCollage';
import HeroDecor from '@/components/landing/hero/HeroDecor';

/* ── Motion ────────────────────────────────────────────────────── */

const ease = [0.16, 1, 0.3, 1] as const;

/* ── In-card navigation ────────────────────────────────────────── */

const NAV_LEFT = [
  { label: 'Home', href: '/' },
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'How It Works', href: '/how-it-works' },
];
const NAV_RIGHT = [
  { label: 'Stats', href: '/stats' },
  { label: 'Keepers', href: '/keepers' },
  { label: 'Support', href: '/support' },
  { label: 'Docs', href: '/docs' },
];
const NAV_ALL = [...NAV_LEFT, ...NAV_RIGHT];

const navLinkClass =
  'text-[11px] font-semibold text-neutral-500 transition-colors hover:text-foreground dark:text-neutral-400';

function HeroNavigation() {
  const { setWalletModalOpen } = useWallet();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative z-40 px-5 pt-11 sm:px-8 sm:pt-6">
      <div className="flex items-center justify-between">
        {/* LEFT — brand + primary links */}
        <div className="flex items-center gap-9">
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/windmill-logo.svg" alt="Windmill" width={26} height={26} />
            <span className="text-sm font-black tracking-tight text-foreground">WINDMILL</span>
          </Link>
          <nav className="hidden items-center gap-4 md:flex">
            {NAV_LEFT.map((l) => (
              <Link key={l.href} href={l.href} className={navLinkClass}>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* RIGHT — secondary links + utilities */}
        <div className="flex items-center gap-3">
          <nav className="hidden items-center gap-4 md:flex">
            {NAV_RIGHT.map((l) => (
              <Link key={l.href} href={l.href} className={navLinkClass}>
                {l.label}
              </Link>
            ))}
          </nav>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setWalletModalOpen(true)}
            className="hidden rounded-full bg-neutral-950 px-4 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 sm:inline-flex"
          >
            Connect Wallet
          </button>
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-foreground md:hidden dark:border-white/15"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="absolute inset-x-3 top-full z-40 mt-2 rounded-2xl border border-black/10 bg-canvas-raised p-3 shadow-float-md md:hidden dark:border-white/10">
          <nav className="flex flex-col">
            {NAV_ALL.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <button
            type="button"
            onClick={() => {
              setWalletModalOpen(true);
              setMenuOpen(false);
            }}
            className="mt-2 w-full rounded-full bg-neutral-950 px-4 py-2.5 text-sm font-bold text-white dark:bg-white dark:text-neutral-950"
          >
            Connect Wallet
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Top-center notch (visual signature detail) ────────────────── */

function HeroNotch() {
  return (
    <>
      {/* Clip path for the shallow downward notch — rounded convex
          shoulders where it leaves the top edge, near-straight sides,
          rounded bottom corners. Same shape at every width. */}
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          <clipPath id="hero-notch-clip" clipPathUnits="objectBoundingBox">
            <path d="M0,0 L1,0 L1,0.05 C0.93,0.08 0.90,0.45 0.855,0.78 C0.842,0.93 0.815,1 0.77,1 L0.23,1 C0.185,1 0.158,0.93 0.145,0.78 C0.10,0.45 0.07,0.08 0,0.05 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* Inward notch — a page-yellow shape that cuts the card's top edge
          DOWNWARD around the toggle. Wide enough for the pill to sit
          inside the flat lower section. */}
      <div
        aria-hidden
        className="absolute left-1/2 top-0 z-30 h-10 w-[300px] -translate-x-1/2 bg-canvas sm:h-14 sm:w-[440px]"
        style={{ clipPath: 'url(#hero-notch-clip)' }}
      />

      {/* Trade / Keeper selector sitting in the downward notch */}
      <div className="absolute left-1/2 top-0 z-50 -translate-x-1/2 -translate-y-[32%]">
        <div className="flex items-center gap-1 rounded-full border border-white bg-canvas p-1 shadow-[0_6px_18px_rgba(20,16,6,0.12)] dark:border-white/15 sm:p-2">
          <button
            type="button"
            className="rounded-full bg-neutral-950 px-4 py-1.5 text-xs font-bold text-white sm:px-6 sm:py-2.5 sm:text-sm"
          >
            Trade
          </button>
          <button
            type="button"
            className="rounded-full px-4 py-1.5 text-xs font-bold text-neutral-800 dark:text-neutral-200 sm:px-6 sm:py-2.5 sm:text-sm"
          >
            Keeper
          </button>
        </div>
      </div>
    </>
  );
}

/* ── Product phone ─────────────────────────────────────────────── */

function MatchRow({
  pair,
  price,
  delta,
  up,
}: {
  pair: string;
  price: string;
  delta: string;
  up: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-black/[0.03] px-2.5 py-2 dark:bg-white/[0.04]">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-neutral-200 to-neutral-400 text-[8px] font-bold text-neutral-700 dark:from-neutral-700 dark:to-neutral-900 dark:text-neutral-200">
        {pair.slice(0, 1)}
      </span>
      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate text-[10px] font-bold text-foreground">{pair}</p>
        <p className="font-mono text-[8px] text-neutral-400">{price}</p>
      </div>
      <svg viewBox="0 0 40 16" className={`h-4 w-10 ${up ? 'text-emerald-500' : 'text-blue-500'}`}>
        <path
          d={up ? 'M2 14 C 12 12, 20 4, 38 2' : 'M2 2 C 12 4, 20 12, 38 14'}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
      <span className={`shrink-0 text-[9px] font-bold ${up ? 'text-emerald-500' : 'text-blue-500'}`}>
        {delta}
      </span>
    </div>
  );
}

function ProductPhone() {
  return (
    <FloatingCard
      depth={8}
      rotateX={2}
      rotateY={-3}
      rotate={0}
      float="none"
      elevation="none"
      ariaHidden={false}
      className="w-[288px] sm:w-[336px] lg:w-[372px]"
    >
      <div className="relative">
        <span className="absolute -left-[3px] top-[20%] h-8 w-[3px] rounded-l bg-neutral-700" />
        <span className="absolute -left-[3px] top-[32%] h-12 w-[3px] rounded-l bg-neutral-700" />
        <span className="absolute -right-[3px] top-[26%] h-16 w-[3px] rounded-r bg-neutral-700" />

        <div className="rounded-[2.6rem] bg-gradient-to-b from-neutral-500 via-neutral-900 to-neutral-700 p-[3px] shadow-float-lg">
          <div className="rounded-[2.45rem] bg-neutral-950 p-2">
            <div className="relative aspect-[9/17] overflow-hidden rounded-[2rem] bg-canvas-raised">
              <div className="absolute left-1/2 top-3 z-30 h-6 w-20 -translate-x-1/2 rounded-full bg-neutral-950" />
              <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-br from-white/10 via-transparent to-transparent" />

              <div className="relative z-10 flex h-full flex-col">
                <div className="flex items-center justify-between px-5 pt-3.5 text-[9px] font-bold text-foreground">
                  <span>9:41</span>
                  <span className="tracking-[0.15em] text-neutral-400">••••• 5G</span>
                </div>

                <div className="flex items-center justify-between px-4 pt-4 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-green-light to-brand-green text-[11px] font-black text-white">
                      W
                    </span>
                    <div className="leading-tight">
                      <p className="text-[11px] font-bold text-foreground">Windmill</p>
                      <p className="font-mono text-[8px] text-neutral-400">solver-node · Base</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-500/12 px-2 py-0.5 text-[8px] font-bold text-emerald-500">
                    LIVE
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-1.5 px-3">
                  <p className="px-1 text-[8px] font-bold uppercase tracking-wider text-neutral-400">
                    Order feed
                  </p>
                  <MatchRow pair="ETH / USDC" price="P₀ 1,840.00" delta="+2.1%" up />
                  <MatchRow pair="wBTC / USDC" price="P₀ 61,204" delta="-0.6%" up={false} />
                  <div className="my-0.5 flex items-center gap-2 rounded-xl bg-brand/15 px-2.5 py-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background">
                      <Zap className="h-3 w-3 fill-current" />
                    </span>
                    <div className="flex-1 leading-tight">
                      <p className="text-[10px] font-bold text-foreground">Sweep executed</p>
                      <p className="text-[8px] text-neutral-500 dark:text-neutral-400">
                        2 orders matched at 1,847.20
                      </p>
                    </div>
                  </div>
                  <MatchRow pair="ARB / USDC" price="P₀ 0.9820" delta="+4.8%" up />
                </div>

                <div className="px-3 pb-2 pt-1">
                  <div className="flex items-center justify-center gap-1.5 rounded-full bg-foreground py-2 text-[10px] font-bold text-background">
                    Place order <ArrowUpRight className="h-3 w-3" />
                  </div>
                </div>
                <div className="flex items-center justify-around border-t border-black/5 px-4 py-2.5 dark:border-white/10">
                  {['●', '◐', '◇', '☰'].map((g, i) => (
                    <span
                      key={i}
                      className={`text-[11px] ${i === 0 ? 'text-foreground' : 'text-neutral-300 dark:text-neutral-600'}`}
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FloatingCard>
  );
}

/* ── Hero ──────────────────────────────────────────────────────── */

export default function HeroSection() {
  return (
    <section
      id="home"
      className="relative flex items-start justify-center overflow-x-clip bg-canvas px-3 pt-12 pb-8 text-foreground transition-colors duration-300 sm:px-6 sm:pt-16 lg:min-h-screen lg:pb-12"
    >
      {/* Positioning frame — cards + decor are siblings of the panel so
          they can overflow it. The panel is NOT clipped, so the top
          notch stays fully visible and the phone extends past the
          bottom edge onto the yellow field. */}
      <div className="relative w-full max-w-[84rem]">
        {/* The large cream panel */}
        <div className="relative rounded-[2.5rem] bg-canvas-raised pb-4 shadow-float-lg ring-1 ring-black/[0.05] dark:ring-white/[0.06] sm:pb-5 lg:pb-6">
          <HeroNotch />
          <HeroNavigation />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.1 }}
            className="relative z-20 mx-auto mt-8 max-w-3xl px-6 text-center sm:mt-12"
          >
            <h1 className="font-sans text-3xl font-black uppercase leading-[0.98] tracking-[-0.02em] text-foreground sm:text-4xl lg:text-5xl">
              The Decentralized
              <br />
              Matchmaking{' '}
              <span className="relative inline-block">
                <span className="relative z-10">Protocol</span>
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-1 z-0 h-[0.26em] -skew-x-6 bg-brand/60"
                />
              </span>
              <br />
              for EVM.
            </h1>
            <p className="mx-auto mt-5 max-w-md text-xs font-medium leading-relaxed text-neutral-500 dark:text-neutral-400 sm:text-sm">
              A dynamic on-chain orderbook. Set price slopes; autonomous keepers settle the matches.
            </p>
          </motion.div>

          {/* Phone — its upper portion shows, emerging from the panel;
              the base is clipped by this wrapper, whose bottom sits at
              the panel's bottom edge. */}
          <div className="relative z-30 mx-auto mt-10 h-[256px] max-w-[460px] overflow-hidden rounded-b-[2.5rem] sm:mt-12 sm:h-[310px] lg:mt-14 lg:h-[348px]">
            <div className="absolute left-1/2 top-5 -translate-x-1/2">
              <ProductPhone />
            </div>
          </div>
        </div>

        {/* Floating cards + decor — overflow the panel freely (lg only) */}
        <HeroCollage />
        <HeroDecor />
      </div>
    </section>
  );
}
