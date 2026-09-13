'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import WalletModal from '@/components/wallet/WalletModal';
import { useContract } from '@/hooks/useContract';
import { SUPPORTED_CHAINS } from '@/lib/contractConfig';
import { useScrollRevealChildren } from '@/hooks/useScrollReveal';
import { 
  BarChart2, 
  Link2, 
  Zap, 
  Building2, 
  Pause, 
  CheckCircle2, 
  Lock, 
  Binary, 
  Shield 
} from 'lucide-react';

interface StatCard {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  bgClass: string;
  textClass: string;
  change?: string;
}

export default function StatsPage() {
  const { readContract, isReadReady } = useContract();
  const containerRef = useScrollRevealChildren<HTMLDivElement>({ threshold: 0.1 });

  const [totalOrders, setTotalOrders] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [protocolFee, setProtocolFee] = useState<number | null>(null);

  // Fetch on-chain stats (works with connected wallet or public RPC fallback)
  useEffect(() => {
    if (!isReadReady) return;
    const fetchStats = async () => {
      const [totalResult, pausedResult, feeResult] = await Promise.all([
        readContract('totalOrders'),
        readContract('paused'),
        readContract('protocolFeeBps'),
      ]);
      if (totalResult.data !== null) setTotalOrders(Number(totalResult.data));
      if (pausedResult.data !== null) setIsPaused(Boolean(pausedResult.data));
      if (feeResult.data !== null) setProtocolFee(Number(feeResult.data));
    };
    fetchStats();
  }, [isReadReady, readContract]);

  const stats: StatCard[] = useMemo(
    () => [
      {
        label: 'Total Orders',
        value: totalOrders !== null ? totalOrders.toLocaleString() : '—',
        icon: BarChart2,
        bgClass: 'bg-[#EFF6FF]',
        textClass: 'text-[#2563EB]',
        change: totalOrders !== null ? 'Live from contract' : 'Connecting to RPC...',
      },
      {
        label: 'Supported Chains',
        value: Object.keys(SUPPORTED_CHAINS).length.toString(),
        icon: Link2,
        bgClass: 'bg-[#F0FDF4]',
        textClass: 'text-[#16A34A]',
      },
      {
        label: 'Keeper Fee',
        value: '0.1%',
        icon: Zap,
        bgClass: 'bg-[#FFFBEB]',
        textClass: 'text-[#D97706]',
        change: 'Flat rate per match',
      },
      {
        label: 'Protocol Fee',
        value: protocolFee !== null ? `${protocolFee / 100}%` : '—',
        icon: Building2,
        bgClass: 'bg-[#FAF5FF]',
        textClass: 'text-[#9333EA]',
        change: protocolFee !== null ? 'Configurable by owner' : 'Connecting to RPC...',
      },
      {
        label: 'Exchange Status',
        value: isPaused ? 'Paused' : 'Active',
        icon: isPaused ? Pause : CheckCircle2,
        bgClass: isPaused ? 'bg-red-50' : 'bg-emerald-50',
        textClass: isPaused ? 'text-red-600' : 'text-emerald-700',
      },
      {
        label: 'Settlement',
        value: '100%',
        icon: Lock,
        bgClass: 'bg-[#F0F9FF]',
        textClass: 'text-[#0369A1]',
        change: 'Fully on-chain, atomic',
      },
      {
        label: 'Matching Algorithm',
        value: 'O(N log N)',
        icon: Binary,
        bgClass: 'bg-neutral-50',
        textClass: 'text-neutral-700',
        change: 'Two-pointer sweep',
      },
      {
        label: 'Max Protocol Fee',
        value: '5%',
        icon: Shield,
        bgClass: 'bg-[#FFF7ED]',
        textClass: 'text-[#C2410C]',
        change: 'Hard-coded cap (500 bps)',
      },
    ],
    [totalOrders, isPaused, protocolFee]
  );

  const supportedChains = Object.values(SUPPORTED_CHAINS);

  return (
    <main className="w-full min-h-screen bg-background text-foreground pt-24 transition-colors duration-300">
      <WalletModal />

      <div ref={containerRef} className="max-w-4xl mx-auto px-6 py-16 flex flex-col gap-12">
        {/* Header */}
        <div className="text-center flex flex-col items-center">
          <span className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Protocol Analytics</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-black dark:text-white mt-2">
            Exchange Statistics
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-3 max-w-lg">
            Real-time metrics from the Windmill Exchange smart contract and supported network configurations.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => {
            const StatIcon = stat.icon;
            return (
              <div
                key={stat.label}
                data-reveal
                style={{ transitionDelay: `${idx * 80}ms` }}
                className="reveal-fade-up flex flex-col gap-2 p-5 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl shadow-xs hover:-translate-y-1 hover:shadow-md hover:border-neutral-200 dark:hover:border-neutral-700 transition-all duration-300"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.bgClass} dark:bg-opacity-20`}
                  >
                    <StatIcon className={`w-5 h-5 ${stat.textClass}`} />
                  </div>
                </div>
              <span className="text-xl sm:text-2xl font-extrabold text-black dark:text-white font-sans tracking-tight mt-1">
                {stat.value}
              </span>
              <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                {stat.label}
              </span>
              {stat.change && (
                <span className="text-[9px] text-neutral-400 dark:text-neutral-500 normal-case font-normal">{stat.change}</span>
              )}
            </div>
          )})}
        </div>

        {/* Supported Networks Table */}
        <div data-reveal className="reveal-fade-up">
          <h2 className="text-lg font-bold text-black dark:text-white mb-4">Supported Networks</h2>
          <div className="border border-neutral-100 dark:border-neutral-800 rounded-2xl overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-800/80 text-neutral-500 dark:text-neutral-400 uppercase tracking-wider font-bold text-[10px]">
                  <th className="text-left p-3">Network</th>
                  <th className="text-left p-3">Chain ID</th>
                  <th className="text-left p-3">Currency</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Explorer</th>
                </tr>
              </thead>
              <tbody>
                {supportedChains.map((chain) => (
                  <tr key={chain.chainId} className="border-t border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition-colors">
                    <td className="p-3 font-semibold text-black dark:text-white">{chain.name}</td>
                    <td className="p-3 font-mono text-neutral-500 dark:text-neutral-400">{chain.chainId}</td>
                    <td className="p-3 text-neutral-600 dark:text-neutral-300">{chain.nativeCurrency.symbol}</td>
                    <td className="p-3">
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                          chain.contractAddress
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                        }`}
                      >
                        {chain.contractAddress ? 'Deployed' : 'Pending'}
                      </span>
                    </td>
                    <td className="p-3">
                      <a
                        href={chain.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white underline transition-colors"
                      >
                        View →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA */}
        <div data-reveal className="reveal-fade-up text-center py-8">
          <Link
            href="/dashboard"
            className="btn-premium-dark inline-flex hover:scale-105 active:scale-[0.98] transition-all"
          >
            Launch Exchange Dashboard →
          </Link>
        </div>
      </div>
    </main>
  );
}
