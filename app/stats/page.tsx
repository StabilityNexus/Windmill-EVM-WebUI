'use client';

import { useEffect, useState } from 'react';
import WalletModal from '@/components/wallet/WalletModal';

const activity = [
  { pair: 'WETH / USDC', type: 'Buy matched', amount: '2.40 WETH', value: '$7,632.00', time: '2 min ago' },
  { pair: 'WBTC / USDC', type: 'Sell matched', amount: '0.18 WBTC', value: '$17,109.00', time: '7 min ago' },
  { pair: 'USDC / WETH', type: 'Buy matched', amount: '4,500 USDC', value: '$4,500.00', time: '14 min ago' },
  { pair: 'WETH / DAI', type: 'Sell matched', amount: '1.25 WETH', value: '$3,968.75', time: '21 min ago' },
];

const volumeBars = [42, 58, 39, 68, 54, 78, 62, 86, 72, 94, 76, 88];

export default function StatsPage() {
  const [volume, setVolume] = useState(2847691);
  const [range, setRange] = useState('24H');

  useEffect(() => {
    const timer = window.setInterval(() => setVolume((current) => current + Math.floor(Math.random() * 1800) + 200), 5000);
    return () => window.clearInterval(timer);
  }, []);

  const statCards = [
    { label: 'Total volume', value: `$${volume.toLocaleString()}`, change: '+12.4%' },
    { label: 'Orders matched', value: '18,429', change: '+8.1%' },
    { label: 'Active curves', value: '1,248', change: '+4.6%' },
    { label: 'Protocol fees', value: '$14,238', change: '+9.3%' },
  ];

  return (
    <main className="min-h-screen bg-white pt-24 text-black">
      <WalletModal />
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12">
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400">Protocol analytics</span>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Network Statistics</h1>
            <p className="mt-2 text-sm text-neutral-500">A live overview of activity across the Windmill matching network.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 p-1">
            {['1H', '24H', '7D', '30D'].map((item) => (
              <button key={item} onClick={() => setRange(item)} className={`rounded-full px-3 py-1.5 text-[10px] font-bold transition-colors ${range === item ? 'bg-black text-white' : 'text-neutral-500 hover:text-black'}`}>
                {item}
              </button>
            ))}
          </div>
        </header>

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statCards.map((stat) => (
            <article key={stat.label} className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{stat.label}</p>
              <p className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{stat.value}</p>
              <p className="mt-2 text-[11px] font-semibold text-emerald-600">{stat.change} <span className="font-normal text-neutral-400">vs. prior {range}</span></p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <article className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex items-start justify-between">
              <div><h2 className="text-lg font-bold">Matched volume</h2><p className="mt-1 text-xs text-neutral-400">USD settled by keepers · {range}</p></div>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> Live</span>
            </div>
            <div className="mt-8 flex h-52 items-end gap-2 border-b border-neutral-100 pb-1">
              {volumeBars.map((height, index) => <div key={index} className="group flex h-full flex-1 items-end"><div title={`$${(height * 12300).toLocaleString()}`} style={{ height: `${height}%` }} className="w-full rounded-t-md bg-neutral-200 transition-colors duration-200 group-hover:bg-black" /></div>)}
            </div>
            <div className="mt-3 flex justify-between text-[10px] font-medium text-neutral-400"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>Now</span></div>
          </article>
          <article className="rounded-3xl border border-neutral-100 bg-neutral-50/60 p-6">
            <h2 className="text-lg font-bold">Network health</h2>
            <div className="mt-6 space-y-5">
              <HealthRow label="Keeper uptime" value="99.98%" progress={99} />
              <HealthRow label="Match success rate" value="98.72%" progress={98} />
              <HealthRow label="Average settlement" value="4.2 sec" progress={84} />
            </div>
            <div className="mt-7 rounded-2xl border border-neutral-200 bg-white p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Connected networks</p><p className="mt-1 text-2xl font-bold">4 <span className="text-sm font-medium text-neutral-400">active chains</span></p></div>
          </article>
        </section>

        <section className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between"><div><h2 className="text-lg font-bold">Recent matches</h2><p className="mt-1 text-xs text-neutral-400">Latest curve orders settled by the network</p></div><span className="hidden text-[10px] font-bold uppercase tracking-wider text-neutral-400 sm:block">Live activity</span></div>
          <div className="divide-y divide-neutral-100">
            {activity.map((item) => <div key={`${item.pair}-${item.time}`} className="flex flex-wrap items-center justify-between gap-3 py-4 text-xs"><div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 font-bold">↗</span><div><p className="font-bold">{item.pair}</p><p className="mt-0.5 text-[10px] text-neutral-400">{item.type} · {item.time}</p></div></div><div className="ml-auto flex gap-6 text-right"><p className="font-semibold">{item.amount}</p><p className="w-24 font-mono text-neutral-500">{item.value}</p></div></div>)}
          </div>
        </section>
      </div>
    </main>
  );
}

function HealthRow({ label, value, progress }: { label: string; value: string; progress: number }) {
  return <div><div className="flex justify-between text-xs"><span className="text-neutral-500">{label}</span><span className="font-bold">{value}</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-200"><div className="h-full rounded-full bg-black" style={{ width: `${progress}%` }} /></div></div>;
}
