'use client';

import React, { useEffect, useId, useRef, useCallback } from 'react';
import { useWallet } from '@/context/WalletContext';
import { Wallet, Shield, Sparkles, Link2, Key, ArrowRight, X } from 'lucide-react';
import Link from 'next/link';

// ─── Externalized Labels (ready for i18n adoption) ──────────────
const LABELS = {
  close: 'Close',
} as const;

export default function WalletModal() {
  const {
    walletModalOpen,
    setWalletModalOpen,
    isConnecting,
    connectingWallet,
    connectWallet,
  } = useWallet();

  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    if (!walletModalOpen) {
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
      return;
    }

    if (!previousFocusRef.current) {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
    }
    modalRef.current?.focus();

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isConnecting) setWalletModalOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [walletModalOpen, isConnecting, setWalletModalOpen]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== 'Tab') return;

      const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );

      if (!focusable || focusable.length === 0) {
        e.preventDefault();
        modalRef.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      // Guard: when focus is on the modal container itself (initial state)
      if (document.activeElement === modalRef.current) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
        return;
      }

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [],
  );

  if (!walletModalOpen) return null;

  const wallets = [
    { name: 'MetaMask', icon: Wallet, desc: 'Popular EVM browser extension' },
    { name: 'Coinbase Wallet', icon: Shield, desc: 'Secure self-custody wallet' },
    { name: 'Rainbow', icon: Sparkles, desc: 'Fun and easy Ethereum wallet' },
    { name: 'WalletConnect', icon: Link2, desc: 'Scan with mobile wallet' },
  ];

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => !isConnecting && setWalletModalOpen(false)}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 text-black dark:text-white shadow-2xl transition-all duration-300">
        {/* Modal Header */}
        <div className="mb-6 flex items-center justify-between">
          <h3 id={titleId} className="text-xl font-bold tracking-tight text-black dark:text-white">Connect a Wallet</h3>
          <button
            type="button"
            aria-label={LABELS.close}
            onClick={() => !isConnecting && setWalletModalOpen(false)}
            disabled={isConnecting}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-black dark:hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isConnecting ? (
          /* Connecting Screen */
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
              <span className="absolute inset-0 rounded-full border-4 border-neutral-100 dark:border-neutral-800" />
              <span className="absolute inset-0 rounded-full border-4 border-t-black dark:border-t-white border-r-transparent border-b-transparent border-l-transparent animate-spin" />
              <span className="text-black dark:text-white">
                {(() => {
                  const w = wallets.find((w) => w.name === connectingWallet);
                  const Icon = w ? w.icon : Key;
                  return <Icon className="w-8 h-8" />;
                })()}
              </span>
            </div>
            <h4 className="text-lg font-semibold text-black dark:text-white">Connecting to {connectingWallet}...</h4>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              Please approve the connection prompt in your wallet extension.
            </p>
          </div>
        ) : (
          /* Selection Screen */
          <div className="flex flex-col gap-3">
            {wallets.map((wallet) => {
              const WalletIcon = wallet.icon;
              return (
                <button
                  key={wallet.name}
                  type="button"
                  onClick={() => connectWallet(wallet.name)}
                  className="flex w-full items-center gap-4 rounded-2xl border border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-800/40 p-4 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200 group active:scale-[0.99] cursor-pointer"
                >
                  <span className="text-neutral-700 dark:text-neutral-300 transition-transform duration-300 group-hover:scale-110">
                    <WalletIcon className="w-8 h-8" />
                  </span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-black dark:text-white">{wallet.name}</h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{wallet.desc}</p>
                  </div>
                  <span className="text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-800 dark:group-hover:text-white transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </button>
              );
            })}
<div className="mt-4 text-center">
  <p className="text-xs text-neutral-400 dark:text-neutral-500">
    By connecting, you agree to our{' '}
    <Link
      href="/terms"
      className="underline underline-offset-2 hover:text-neutral-600 dark:hover:text-neutral-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-400"
    >
      Terms of Service
    </Link>
    {' '}&amp;{' '}
    <Link
      href="/privacy"
      className="underline underline-offset-2 hover:text-neutral-600 dark:hover:text-neutral-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-400"
    >
      Privacy Policy
    </Link>
    .
  </p>
</div>
                 </div>
        )}
      </div>
    </div>
  );
}