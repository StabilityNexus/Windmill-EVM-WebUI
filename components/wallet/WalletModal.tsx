'use client';

import React, { useEffect, useId, useRef, useCallback } from 'react';
import { useWallet } from '@/context/WalletContext';

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
    { name: 'MetaMask', icon: '🦊', desc: 'Popular EVM browser extension' },
    { name: 'Coinbase Wallet', icon: '🛡️', desc: 'Secure self-custody wallet' },
    { name: 'Rainbow', icon: '🌈', desc: 'Fun and easy Ethereum wallet' },
    { name: 'WalletConnect', icon: '🔌', desc: 'Scan with mobile wallet' },
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
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-neutral-200 bg-white p-6 text-black shadow-2xl transition-all duration-300">
        {/* Modal Header */}
        <div className="mb-6 flex items-center justify-between">
          <h3 id={titleId} className="text-xl font-bold tracking-tight">Connect a Wallet</h3>
          <button
            type="button"
            aria-label={LABELS.close}
            onClick={() => !isConnecting && setWalletModalOpen(false)}
            disabled={isConnecting}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-black transition-colors disabled:opacity-50"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        {isConnecting ? (
          /* Connecting Screen */
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
              <span className="absolute inset-0 rounded-full border-4 border-neutral-100" />
              <span className="absolute inset-0 rounded-full border-4 border-t-black border-r-transparent border-b-transparent border-l-transparent animate-spin" />
              <span className="text-3xl">
                {wallets.find((w) => w.name === connectingWallet)?.icon || '🔑'}
              </span>
            </div>
            <h4 className="text-lg font-semibold">Connecting to {connectingWallet}...</h4>
            <p className="mt-2 text-sm text-neutral-500">
              Please approve the connection prompt in your wallet extension.
            </p>
          </div>
        ) : (
          /* Selection Screen */
          <div className="flex flex-col gap-3">
            {wallets.map((wallet) => (
              <button
                key={wallet.name}
                type="button"
                onClick={() => connectWallet(wallet.name)}
                className="flex w-full items-center gap-4 rounded-2xl border border-neutral-100 bg-neutral-50/50 p-4 text-left hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-200 group active:scale-[0.99]"
              >
                <span className="text-3xl transition-transform duration-300 group-hover:scale-110">
                  {wallet.icon}
                </span>
                <div className="flex-1">
                  <h4 className="font-semibold text-black">{wallet.name}</h4>
                  <p className="text-xs text-neutral-500 mt-0.5">{wallet.desc}</p>
                </div>
                <span className="text-neutral-400 group-hover:text-neutral-800 transition-colors">
                  ➔
                </span>
              </button>
            ))}

            <div className="mt-4 text-center">
              <p className="text-xs text-neutral-400">
                By connecting, you agree to our Terms of Service & Privacy Policy.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

