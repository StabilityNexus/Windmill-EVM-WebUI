'use client';

import React from 'react';
import FAQContent from '../support/FAQContent';
import SupportForm from '../support/SupportForm';

interface SubPageContainerProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function SubPageContainer({ activeTab, setActiveTab }: SubPageContainerProps) {
  if (activeTab === 'home' || activeTab === 'how-it-works' || activeTab === 'stats') {
    return null;
  }

  return (
    <section className="relative min-h-[70vh] py-32 px-6 bg-neutral-950 text-white flex flex-col justify-start border-t border-white/5">
      <div className="absolute inset-0 hero-grid-pattern opacity-[0.1] pointer-events-none" />
      <div className="mx-auto max-w-4xl w-full">
        {/* Navigation back button */}
        <button
          onClick={() => setActiveTab('home')}
          className="mb-8 inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white uppercase tracking-wider transition-colors cursor-pointer"
        >
          ← Back to Homepage
        </button>

        {/* ─── ABOUT US PAGE ──────────────────────────────────────── */}
        {activeTab === 'about' && (
          <div className="flex flex-col gap-8 animate-float">
            <div>
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">About Us</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-2">
                Stability Nexus Protocol
              </h2>
            </div>
            <p className="text-neutral-400 leading-relaxed text-sm sm:text-base">
              Stability Nexus is a decentralized research and deployment collective dedicated to building mathematically proven, resilient, and non-custodial financial infrastructure.
            </p>
            <p className="text-neutral-400 leading-relaxed text-sm sm:text-base">
              Our core mission with the Windmill Exchange is to build a zero-maintenance matching pipeline that runs autonomously. Through sophisticated time-sloped order curves and robust O(N log N) sweep logic, we bridge the gap between traditional orderbooks and automated market makers (AMMs).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
              <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-6">
                <h3 className="text-lg font-bold">Resilient Infrastructure</h3>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                  We verify properties formally, ensuring smart contracts meet safety constraints before deploying them to production nets.
                </p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-6">
                <h3 className="text-lg font-bold">Keeper Ecosystem</h3>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                  Our keeper node binaries can be operated by anyone, promoting true decentralization and open settlement operations.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ─── KEEPER DASHBOARD ───────────────────────────────────── */}
        {activeTab === 'keepers' && (
          <div className="flex flex-col gap-8">
            <div>
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Network Node Monitor</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-2">
                Keeper Dashboard
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="border border-white/5 bg-white/[0.01] rounded-2xl p-4 text-center">
                <span className="text-2xl font-bold font-mono">14</span>
                <p className="text-[10px] text-neutral-500 uppercase font-semibold mt-1">Active Nodes</p>
              </div>
              <div className="border border-white/5 bg-white/[0.01] rounded-2xl p-4 text-center">
                <span className="text-2xl font-bold font-mono text-emerald-400">99.98%</span>
                <p className="text-[10px] text-neutral-500 uppercase font-semibold mt-1">Network Uptime</p>
              </div>
              <div className="border border-white/5 bg-white/[0.01] rounded-2xl p-4 text-center">
                <span className="text-2xl font-bold font-mono">0.03s</span>
                <p className="text-[10px] text-neutral-500 uppercase font-semibold mt-1">Sweep Latency</p>
              </div>
              <div className="border border-white/5 bg-white/[0.01] rounded-2xl p-4 text-center">
                <span className="text-2xl font-bold font-mono">1,402</span>
                <p className="text-[10px] text-neutral-500 uppercase font-semibold mt-1">Matches Settled</p>
              </div>
            </div>

            {/* Simulated Live Match Log */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-6">
              <h3 className="text-lg font-bold mb-4">Recent Match Logs</h3>
              <div className="font-mono text-xs flex flex-col gap-2.5 max-h-48 overflow-y-auto">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-emerald-400">[MATCH SUCCESS]</span>
                  <span className="text-neutral-400">Buy #298 matched Sell #120 (0.12 ETH settled)</span>
                  <span className="text-neutral-500">2 mins ago</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-emerald-400">[MATCH SUCCESS]</span>
                  <span className="text-neutral-400">Buy #295 matched Sell #118 (54.00 USDC settled)</span>
                  <span className="text-neutral-500">5 mins ago</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-neutral-300">[SWEEP RUNNING]</span>
                  <span className="text-neutral-400">Two-pointer sweep complete. Matched 0 pairs.</span>
                  <span className="text-neutral-500">7 mins ago</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="text-emerald-400">[MATCH SUCCESS]</span>
                  <span className="text-neutral-400">Buy #284 matched Sell #102 (1,250 DAI settled)</span>
                  <span className="text-neutral-500">12 mins ago</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── HELP & SUPPORT ────────────────────────────────────── */}
        {activeTab === 'support' && (
          <div className="flex flex-col gap-8">
            <div>
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Customer Support Desk</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-2">
                Help & Support
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-start">
              <FAQContent theme="dark" />
              <SupportForm theme="dark" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
