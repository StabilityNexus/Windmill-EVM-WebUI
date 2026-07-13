'use client';

import React from 'react';
import Link from 'next/link';
import WalletModal from '@/components/wallet/WalletModal';

export default function KeepersPage() {
  return (
    <main className="w-full min-h-screen bg-white text-black pt-24 flex flex-col items-center justify-center">
      <WalletModal />

      <div className="text-center px-6 py-20 flex flex-col items-center gap-4">
        <span className="text-5xl font-mono tracking-widest text-neutral-300">404</span>
        <h1 className="text-xl font-bold tracking-tight text-black">Keepers Monitor Offline</h1>
        <p className="text-neutral-500 text-xs max-w-sm leading-relaxed">
          The node dashboard sweep logger is temporarily offline for maintenance updates. Keepers are still executing matches on-chain.
        </p>
        <Link
          href="/"
          className="mt-6 rounded-full bg-black px-6 py-2 text-xs font-bold text-white hover:bg-neutral-800 transition-colors shadow-sm"
        >
          Return Home
        </Link>
      </div>

      {/* Preserve code structure for later recovery:
      <div className="max-w-4xl mx-auto px-6 py-16 flex flex-col gap-8">
        <div>
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Network Node Monitor</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-black mt-2">
            Keeper Dashboard
          </h1>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="border border-neutral-100 bg-neutral-50/50 rounded-2xl p-4 text-center">
            <span className="text-2xl font-bold font-mono text-black">14</span>
            <p className="text-[10px] text-neutral-400 uppercase font-semibold mt-1">Active Nodes</p>
          </div>
          <div className="border border-neutral-100 bg-neutral-50/50 rounded-2xl p-4 text-center">
            <span className="text-2xl font-bold font-mono text-black">99.98%</span>
            <p className="text-[10px] text-neutral-400 uppercase font-semibold mt-1">Network Uptime</p>
          </div>
          ...
        </div>
      </div>
      */}
    </main>
  );
}
