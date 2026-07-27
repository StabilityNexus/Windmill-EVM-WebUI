'use client';

import { useEffect, useState } from 'react';
import WalletModal from '@/components/wallet/WalletModal';

type ProtocolStats = {
  updatedAt: string; network: string; currentBlock: number; paused: boolean; protocolFeeBps: string;
  totalOrders: number; activeOrders: number; activeOrdersArePartial: boolean; matchedOrders: number; totalNotional: string;
  recentMatches: { buyOrderId: string; sellOrderId: string; keeper: string; settlementPrice: string; executedQuantity: string; blockNumber: number; transactionHash: string }[];
};

export default function StatsPage() {
  const [stats, setStats] = useState<ProtocolStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch('/api/protocol/stats', { cache: 'no-store' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? 'Unable to load protocol statistics.');
        if (active) { setStats(data); setError(null); }
      } catch (err) { if (active) setError(err instanceof Error ? err.message : 'Unable to load protocol statistics.'); }
    };
    void load();
    const interval = window.setInterval(() => void load(), 15_000);
    return () => { active = false; window.clearInterval(interval); };
  }, []);

  return <main className="min-h-screen bg-white pt-24 text-black"><WalletModal /><div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12">
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><span className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400">Protocol analytics</span><h1 className="mt-1 text-3xl font-extrabold tracking-tight">Network Statistics</h1><p className="mt-2 text-sm text-neutral-500">Live on-chain activity from the Windmill Exchange.</p></div><LiveBadge updatedAt={stats?.updatedAt} /></header>
    {error ? <ConfigurationNotice message={error} /> : <><section className="grid grid-cols-2 gap-4 lg:grid-cols-4"><Metric label="Total orders" value={stats?.totalOrders.toLocaleString() ?? '—'} /><Metric label="Active orders" value={stats ? `${stats.activeOrders.toLocaleString()}${stats.activeOrdersArePartial ? '+' : ''}` : '—'} detail={stats?.activeOrdersArePartial ? 'recent order scan' : undefined} /><Metric label="Matches in window" value={stats?.matchedOrders.toLocaleString() ?? '—'} /><Metric label="Protocol fee" value={stats ? `${Number(stats.protocolFeeBps) / 100}%` : '—'} /></section>
    <section className="grid gap-6 lg:grid-cols-3"><article className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm lg:col-span-2"><h2 className="text-lg font-bold">Settlement activity</h2><p className="mt-1 text-xs text-neutral-400">The latest `OrderMatched` events indexed directly from the configured RPC.</p><p className="mt-8 text-3xl font-bold tracking-tight">{stats ? stats.totalNotional : '—'}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">Aggregate executed notional (raw token units)</p><p className="mt-6 text-xs text-neutral-500">Current block: <span className="font-mono text-black">{stats?.currentBlock ?? '—'}</span> · Chain ID: <span className="font-mono text-black">{stats?.network ?? '—'}</span></p></article><article className="rounded-3xl border border-neutral-100 bg-neutral-50/60 p-6"><h2 className="text-lg font-bold">Exchange status</h2><div className="mt-6 flex items-center gap-3"><span className={`h-3 w-3 rounded-full ${stats?.paused ? 'bg-amber-400' : 'bg-emerald-500'}`} /><div><p className="font-bold">{stats?.paused ? 'Paused' : 'Operational'}</p><p className="text-xs text-neutral-400">Reported by the contract</p></div></div></article></section>
    <section className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold">Recent matches</h2><p className="mt-1 text-xs text-neutral-400">On-chain settlements in the configured block window.</p><div className="mt-5 divide-y divide-neutral-100">{stats?.recentMatches.length ? stats.recentMatches.map((match) => <div key={match.transactionHash} className="flex flex-wrap items-center justify-between gap-3 py-4 text-xs"><div><p className="font-bold">Buy #{match.buyOrderId} · Sell #{match.sellOrderId}</p><p className="mt-1 font-mono text-[10px] text-neutral-400">Keeper {shortAddress(match.keeper)} · block {match.blockNumber}</p></div><div className="text-right"><p className="font-mono font-semibold">Qty {match.executedQuantity}</p><p className="mt-1 text-[10px] text-neutral-400">Price {match.settlementPrice}</p></div></div>) : <p className="py-10 text-center text-xs text-neutral-400">No match events found in the configured block window.</p>}</div></section></>}</div></main>;
}

function Metric({ label, value, detail }: { label: string; value: string; detail?: string }) { return <article className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm"><p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{label}</p><p className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{value}</p>{detail && <p className="mt-2 text-[10px] text-neutral-400">{detail}</p>}</article>; }
function LiveBadge({ updatedAt }: { updatedAt?: string }) { return <span className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-500"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />{updatedAt ? `Updated ${new Date(updatedAt).toLocaleTimeString()}` : 'Connecting…'}</span>; }
function ConfigurationNotice({ message }: { message: string }) { return <section className="rounded-3xl border border-dashed border-neutral-200 bg-neutral-50 p-8 text-center"><h2 className="text-lg font-bold">Live protocol data is unavailable</h2><p className="mx-auto mt-2 max-w-xl text-sm text-neutral-500">{message}</p><p className="mt-5 font-mono text-[11px] text-neutral-400">Set WINDMILL_RPC_URL, WINDMILL_CONTRACT_ADDRESS, and WINDMILL_DEPLOY_BLOCK in the UI environment.</p></section>; }
function shortAddress(address: string) { return `${address.slice(0, 6)}…${address.slice(-4)}`; }
