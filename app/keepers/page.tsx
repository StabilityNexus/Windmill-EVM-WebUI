'use client';

import { useEffect, useState } from 'react';
import WalletModal from '@/components/wallet/WalletModal';

const initialKeepers = [
  { id: '0x7a3...e92f', region: 'Frankfurt, DE', uptime: '99.99%', matches: 2841, latency: 42, status: 'Online' },
  { id: '0x1bd...4c81', region: 'Mumbai, IN', uptime: '99.97%', matches: 2568, latency: 64, status: 'Online' },
  { id: '0xc4e...10a2', region: 'Virginia, US', uptime: '99.95%', matches: 2397, latency: 51, status: 'Online' },
  { id: '0x8f9...b763', region: 'Singapore, SG', uptime: '99.91%', matches: 2134, latency: 72, status: 'Online' },
  { id: '0xd21...9a0e', region: 'London, UK', uptime: '98.84%', matches: 1876, latency: 89, status: 'Syncing' },
];

export default function KeepersPage() {
  const [keepers, setKeepers] = useState(initialKeepers);
  const [sortBy, setSortBy] = useState<'matches' | 'latency'>('matches');

  useEffect(() => {
    const timer = window.setInterval(() => setKeepers((current) => current.map((keeper) => keeper.status === 'Online' ? { ...keeper, matches: keeper.matches + Math.floor(Math.random() * 3) } : keeper)), 4000);
    return () => window.clearInterval(timer);
  }, []);

  const sortedKeepers = [...keepers].sort((a, b) => sortBy === 'matches' ? b.matches - a.matches : a.latency - b.latency);

  return (
    <main className="min-h-screen bg-white pt-24 text-black">
      <WalletModal />
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12">
        <header className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><span className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400">Network node monitor</span><h1 className="mt-1 text-3xl font-extrabold tracking-tight">Keeper Network</h1><p className="mt-2 text-sm text-neutral-500">Independent keepers watch order curves and submit settlement transactions.</p></div><button className="rounded-full border border-neutral-200 px-4 py-2 text-xs font-bold transition-colors hover:border-black">How keepers work ↗</button></header>

        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Metric label="Active nodes" value="14" detail="of 15 registered" />
          <Metric label="Network uptime" value="99.98%" detail="last 30 days" />
          <Metric label="Matches today" value="18,429" detail="+8.1% vs yesterday" />
          <Metric label="Avg. latency" value="58 ms" detail="across all regions" />
        </section>

        <section className="grid gap-6 lg:grid-cols-3"><article className="rounded-3xl border border-neutral-100 bg-black p-6 text-white lg:col-span-1"><div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Network status</span><span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" /> Operational</span></div><p className="mt-6 text-4xl font-bold">14<span className="text-lg font-medium text-neutral-400">/15</span></p><p className="mt-1 text-sm text-neutral-300">Keepers actively monitoring curves</p><div className="mt-8 flex gap-1.5">{Array.from({ length: 15 }, (_, i) => <span key={i} className={`h-2 flex-1 rounded-full ${i === 14 ? 'bg-neutral-700' : 'bg-emerald-400'}`} />)}</div></article><article className="rounded-3xl border border-neutral-100 bg-white p-6 lg:col-span-2"><h2 className="text-lg font-bold">Global coverage</h2><p className="mt-1 text-xs text-neutral-400">Keeper locations maintain continuous coverage around the clock.</p><div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4"><Coverage city="Frankfurt" count="3 nodes" /><Coverage city="Virginia" count="4 nodes" /><Coverage city="Singapore" count="3 nodes" /><Coverage city="Mumbai" count="4 nodes" /></div></article></section>

        <section className="overflow-hidden rounded-3xl border border-neutral-100 bg-white shadow-sm"><div className="flex flex-col justify-between gap-3 border-b border-neutral-100 p-6 sm:flex-row sm:items-center"><div><h2 className="text-lg font-bold">Active keepers</h2><p className="mt-1 text-xs text-neutral-400">Realtime node performance and settlement activity</p></div><div className="flex rounded-full bg-neutral-100 p-1"><button onClick={() => setSortBy('matches')} className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${sortBy === 'matches' ? 'bg-white shadow-sm' : 'text-neutral-500'}`}>Most matches</button><button onClick={() => setSortBy('latency')} className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${sortBy === 'latency' ? 'bg-white shadow-sm' : 'text-neutral-500'}`}>Lowest latency</button></div></div><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-xs"><thead className="bg-neutral-50 text-[10px] uppercase tracking-wider text-neutral-400"><tr><th className="px-6 py-4 font-bold">Keeper</th><th className="px-4 py-4 font-bold">Region</th><th className="px-4 py-4 font-bold">Uptime</th><th className="px-4 py-4 text-right font-bold">Matches</th><th className="px-6 py-4 text-right font-bold">Latency</th></tr></thead><tbody className="divide-y divide-neutral-100">{sortedKeepers.map((keeper) => <tr key={keeper.id} className="transition-colors hover:bg-neutral-50"><td className="px-6 py-4"><div className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${keeper.status === 'Online' ? 'bg-emerald-500' : 'bg-amber-400'}`} /><span className="font-mono font-bold">{keeper.id}</span></div></td><td className="px-4 py-4 text-neutral-500">{keeper.region}</td><td className="px-4 py-4 font-semibold">{keeper.uptime}</td><td className="px-4 py-4 text-right font-mono">{keeper.matches.toLocaleString()}</td><td className="px-6 py-4 text-right font-semibold">{keeper.latency} ms</td></tr>)}</tbody></table></div></section>
      </div>
    </main>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) { return <article className="rounded-2xl border border-neutral-100 p-5 shadow-sm"><p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{label}</p><p className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{value}</p><p className="mt-2 text-[11px] text-neutral-400">{detail}</p></article>; }
function Coverage({ city, count }: { city: string; count: string }) { return <div className="rounded-2xl border border-neutral-100 bg-neutral-50/60 p-4"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs shadow-sm">◎</span><p className="mt-3 text-sm font-bold">{city}</p><p className="mt-1 text-[10px] text-neutral-400">{count}</p></div>; }
