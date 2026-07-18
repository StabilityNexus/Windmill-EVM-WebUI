'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useWallet } from '@/context/WalletContext';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';

// ─── Types ──────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
}

// ─── Constants ──────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  { label: t.nav.dex, href: '/dashboard' },
  { label: t.nav.swap, href: '/swap' },
  { label: t.nav.pools, href: '/pools' },
  { label: t.nav.keepers, href: '/keepers' },
  { label: t.nav.docs, href: '/docs' },
];

const NETWORKS = [
  t.networks.ethereum,
  t.networks.base,
  t.networks.polygon,
  t.networks.arbitrum,
];

const SCROLL_THRESHOLD = 60;

// ─── Helper: format wallet address safely ───────────────────────

function formatAddress(address: string | null | undefined): string {
  if (!address || address.length < 8) return t.nav.connected;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

// ─── Component ──────────────────────────────────────────────────

export default function Navbar() {
  const {
    isConnected,
    address,
    network,
    setWalletModalOpen,
    disconnectWallet,
    switchNetwork,
  } = useWallet();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [networkOpen, setNetworkOpen] = useState(false);
  const networkRef = useRef<HTMLDivElement>(null);

  // ── Scroll listener ─────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Close network dropdown on outside click ─────────────────
  useEffect(() => {
    if (!networkOpen) return;
    const onClick = (e: MouseEvent) => {
      if (networkRef.current && !networkRef.current.contains(e.target as Node)) {
        setNetworkOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [networkOpen]);

  // ── Close mobile menu on Escape ─────────────────────────────
  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  const handleConnect = useCallback(() => {
    setWalletModalOpen(true);
    setMobileOpen(false);
  }, [setWalletModalOpen]);

  const handleDisconnect = useCallback(() => {
    disconnectWallet();
    setMobileOpen(false);
  }, [disconnectWallet]);

  const handleNetworkSwitch = useCallback(
    (net: string) => {
      switchNetwork(net);
      setNetworkOpen(false);
    },
    [switchNetwork],
  );

  return (
    <nav
      aria-label="Main navigation"
      className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4"
    >
      <div
        className={cn(
          'w-full max-w-5xl rounded-2xl px-4 py-2.5 transition-all duration-500 ease-out',
          'bg-white/70 backdrop-blur-[20px] border border-white/20',
          scrolled && 'shadow-lg shadow-black/5',
        )}
      >
        <div className="flex items-center justify-between">
          {/* ── Logo ──────────────────────────────────────────── */}
          <Link
            href="/"
            className="flex items-center gap-2 shrink-0 group"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white font-bold text-sm transition-transform group-hover:scale-105">
              W
            </div>
            <span className="font-sans text-sm font-bold tracking-tight text-neutral-900 hidden sm:inline">
              {t.brand.name}
            </span>
          </Link>

          {/* ── Desktop Links ─────────────────────────────────── */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-950 rounded-lg hover:bg-white/60 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* ── Desktop Actions ────────────────────────────────── */}
          <div className="hidden lg:flex items-center gap-2">
            {isConnected && (
              <div ref={networkRef} className="relative">
                <button
                  type="button"
                  onClick={() => setNetworkOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 rounded-lg border border-neutral-200/60 bg-white/50 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-white/80 transition-colors"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {network}
                  <svg
                    className={cn(
                      'w-3 h-3 text-neutral-400 transition-transform',
                      networkOpen && 'rotate-180',
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {networkOpen && (
                  <div className="absolute right-0 mt-2 w-36 rounded-xl border border-neutral-200/60 bg-white/90 backdrop-blur-xl p-1 shadow-xl z-50">
                    {NETWORKS.map((net) => (
                      <button
                        key={net}
                        type="button"
                        onClick={() => handleNetworkSwitch(net)}
                        className={cn(
                          'w-full text-left rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                          net === network
                            ? 'bg-neutral-100 text-neutral-900 font-semibold'
                            : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900',
                        )}
                      >
                        {net}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {isConnected ? (
              <button
                type="button"
                onClick={handleDisconnect}
                className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {formatAddress(address)}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConnect}
                className="rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors"
              >
                {t.nav.connectWallet}
              </button>
            )}
          </div>

          {/* ── Mobile Toggle ─────────────────────────────────── */}
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/50 transition-colors"
            aria-label={mobileOpen ? t.nav.mobileMenuClose : t.nav.mobileMenuOpen}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <svg className="w-5 h-5 text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            )}
          </button>
        </div>

        {/* ── Mobile Menu ──────────────────────────────────────── */}
        {mobileOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-neutral-200/30 pb-2 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 text-sm font-medium text-neutral-700 hover:text-neutral-950 rounded-lg hover:bg-white/60 transition-colors"
              >
                {item.label}
              </Link>
            ))}

            <div className="h-px bg-neutral-200/30 my-2" />

            {isConnected ? (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center px-3 py-2 text-xs font-semibold text-neutral-700 bg-white/40 rounded-lg">
                  <span>{t.nav.network}</span>
                  <span className="text-neutral-500">{network}</span>
                </div>
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="w-full text-center rounded-lg bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors"
                >
                  {t.nav.disconnect} · {formatAddress(address)}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleConnect}
                className="w-full text-center rounded-lg bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors"
              >
                {t.nav.connectWallet}
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
