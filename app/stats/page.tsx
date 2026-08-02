import WalletModal from '@/components/wallet/WalletModal';

const metrics = [
  { label: 'Total volume', value: '$2.84M', detail: 'last 24 hours' },
  { label: 'Orders matched', value: '18,429', detail: 'last 24 hours' },
  { label: 'Active curves', value: '1,248', detail: 'across all pairs' },
  { label: 'Protocol fees', value: '$14,238', detail: 'last 24 hours' },
];

const matches = [
  { pair: 'WETH / USDC', amount: '2.40 WETH', value: '$7,632.00', time: '2 min ago' },
  { pair: 'WBTC / USDC', amount: '0.18 WBTC', value: '$17,109.00', time: '7 min ago' },
  { pair: 'USDC / WETH', amount: '4,500 USDC', value: '$4,500.00', time: '14 min ago' },
];

export default function StatsPage() {
  return <main className="min-h-screen bg-white pt-24 text-black"><WalletModal /><div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12">
    <header><span className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400">Protocol analytics</span><h1 className="mt-1 text-3xl font-extrabold tracking-tight">Network Statistics</h1><p className="mt-2 text-sm text-neutral-500">An overview of activity across the Windmill matching network.</p></header>
    <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">{metrics.map((metric) => <Metric key={metric.label} {...metric} />)}</section>
    <section className="grid gap-6 lg:grid-cols-3"><article className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm lg:col-span-2"><h2 className="text-lg font-bold">Matched volume</h2><p className="mt-1 text-xs text-neutral-400">Settlement activity over the current reporting period.</p><div className="mt-8 flex h-52 items-end gap-2 border-b border-neutral-100 pb-1">{[42, 58, 39, 68, 54, 78, 62, 86, 72, 94, 76, 88].map((height, index) => <div key={index} style={{ height: `${height}%` }} className="flex-1 rounded-t-md bg-neutral-200" />)}</div><div className="mt-3 flex justify-between text-[10px] font-medium text-neutral-400"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>Now</span></div></article><article className="rounded-3xl border border-neutral-100 bg-neutral-50/60 p-6"><h2 className="text-lg font-bold">Network health</h2><div className="mt-6 space-y-5"><Health label="Keeper uptime" value="99.98%" progress={99} /><Health label="Match success rate" value="98.72%" progress={98} /><Health label="Average settlement" value="4.2 sec" progress={84} /></div></article></section>
    <section className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold">Recent matches</h2><p className="mt-1 text-xs text-neutral-400">Latest curve orders settled by the network.</p><div className="mt-5 divide-y divide-neutral-100">{matches.map((match) => <div key={match.pair} className="flex items-center justify-between gap-3 py-4 text-xs"><div><p className="font-bold">{match.pair}</p><p className="mt-1 text-[10px] text-neutral-400">Matched · {match.time}</p></div><div className="text-right"><p className="font-semibold">{match.amount}</p><p className="mt-1 font-mono text-[10px] text-neutral-500">{match.value}</p></div></div>)}</div></section>
  </div></main>;
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) { return <article className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm"><p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{label}</p><p className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{value}</p><p className="mt-2 text-[11px] text-neutral-400">{detail}</p></article>; }
function Health({ label, value, progress }: { label: string; value: string; progress: number }) { return <div><div className="flex justify-between text-xs"><span className="text-neutral-500">{label}</span><span className="font-bold">{value}</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-200"><div className="h-full rounded-full bg-black" style={{ width: `${progress}%` }} /></div></div>; }
