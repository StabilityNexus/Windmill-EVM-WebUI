'use client';

import React from 'react';
import { useWallet } from '@/context/WalletContext';

export default function WalletModal() {
  const {
    walletModalOpen,
    setWalletModalOpen,
    isConnecting,
    connectingWallet,
    connectWallet,
  } = useWallet();

  if (!walletModalOpen) return null;

  const wallets = [
    { name: 'MetaMask', icon: '🦊', desc: 'Popular EVM browser extension' },
    { name: 'Coinbase Wallet', icon: '🛡️', desc: 'Secure self-custody wallet' },
    { name: 'Rainbow', icon: '🌈', desc: 'Fun and easy Ethereum wallet' },
    { name: 'WalletConnect', icon: '🔌', desc: 'Scan with mobile wallet' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => !isConnecting && setWalletModalOpen(false)}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-card p-6 text-foreground shadow-2xl transition-all duration-300">
        {/* Modal Header */}
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight">Connect a Wallet</h3>
          <button
            onClick={() => !isConnecting && setWalletModalOpen(false)}
            disabled={isConnecting}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-foreground transition-colors disabled:opacity-50 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {isConnecting ? (
          /* Connecting Screen */
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
              <span className="absolute inset-0 rounded-full border-4 border-neutral-100 dark:border-neutral-850" />
              <span className="absolute inset-0 rounded-full border-4 border-t-foreground border-r-transparent border-b-transparent border-l-transparent animate-spin" />
              <span className="text-3xl">
                {wallets.find((w) => w.name === connectingWallet)?.icon || '🔑'}
              </span>
            </div>
            <h4 className="text-lg font-semibold">Connecting to {connectingWallet}...</h4>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              Please approve the connection prompt in your wallet extension.
            </p>
          </div>
        ) : (
          /* Selection Screen */
          <div className="flex flex-col gap-3">
            {wallets.map((wallet) => (
              <button
                key={wallet.name}
                onClick={() => connectWallet(wallet.name)}
                className="flex w-full items-center gap-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 p-4 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200 group active:scale-[0.99] cursor-pointer"
              >
                <span className="text-3xl transition-transform duration-300 group-hover:scale-110">
                  {wallet.icon}
                </span>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{wallet.name}</h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{wallet.desc}</p>
                </div>
                <span className="text-neutral-400 group-hover:text-neutral-800 dark:group-hover:text-neutral-200 transition-colors">
                  ➔
                </span>
              </button>
            ))}

            <div className="mt-4 text-center">
              <p className="text-xs text-neutral-400 dark:text-neutral-500">
                By connecting, you agree to our Terms of Service & Privacy Policy.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
