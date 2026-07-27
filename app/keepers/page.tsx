import WalletModal from '@/components/wallet/WalletModal';

const keepers = [
  { id: '0x7a3...e92f', region: 'Frankfurt, DE', uptime: '99.99%', matches: '2,841', latency: '42 ms', status: 'Online' },
  { id: '0x1bd...4c81', region: 'Mumbai, IN', uptime: '99.97%', matches: '2,568', latency: '64 ms', status: 'Online' },
  { id: '0xc4e...10a2', region: 'Virginia, US', uptime: '99.95%', matches: '2,397', latency: '51 ms', status: 'Online' },
  { id: '0x8f9...b763', region: 'Singapore, SG', uptime: '99.91%', matches: '2,134', latency: '72 ms', status: 'Online' },
];

export default function KeepersPage() {
  return <main className="min-h-screen bg-white pt-24 text-black">
    <WalletModal />
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12">
      <header><span className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400">Network node monitor</span><h1 className="mt-1 text-3xl font-extrabold tracking-tight">Keeper Network</h1><p className="mt-2 text-sm text-neutral-500">Independent keepers watch order curves and submit settlement transactions.</p></header>
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4"><Metric label="Active nodes" value="14" detail="of 15 registered" /><Metric label="Network uptime" value="99.98%" detail="last 30 days" /><Metric label="Matches today" value="18,429" detail="+8.1% vs yesterday" /><Metric label="Avg. latency" value="58 ms" detail="across all regions" /></section>
      <section className="grid gap-6 lg:grid-cols-3"><article className="rounded-3xl bg-black p-6 text-white lg:col-span-1"><span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Network status</span><p className="mt-6 text-4xl font-bold">14<span className="text-lg font-medium text-neutral-400">/15</span></p><p className="mt-1 text-sm text-neutral-300">Keepers actively monitoring curves</p></article><article className="rounded-3xl border border-neutral-100 bg-white p-6 lg:col-span-2"><h2 className="text-lg font-bold">Global coverage</h2><p className="mt-1 text-xs text-neutral-400">Keeper locations maintain continuous coverage around the clock.</p><div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4"><Coverage city="Frankfurt" count="3 nodes" /><Coverage city="Virginia" count="4 nodes" /><Coverage city="Singapore" count="3 nodes" /><Coverage city="Mumbai" count="4 nodes" /></div></article></section>
      <section className="overflow-hidden rounded-3xl border border-neutral-100 bg-white shadow-sm"><div className="border-b border-neutral-100 p-6"><h2 className="text-lg font-bold">Active keepers</h2><p className="mt-1 text-xs text-neutral-400">Node performance and settlement activity.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-xs"><thead className="bg-neutral-50 text-[10px] uppercase tracking-wider text-neutral-400"><tr><th className="px-6 py-4">Keeper</th><th className="px-4 py-4">Region</th><th className="px-4 py-4">Uptime</th><th className="px-4 py-4 text-right">Matches</th><th className="px-6 py-4 text-right">Latency</th></tr></thead><tbody className="divide-y divide-neutral-100">{keepers.map((keeper) => <tr key={keeper.id}><td className="px-6 py-4"><span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-500" /><span className="font-mono font-bold">{keeper.id}</span></td><td className="px-4 py-4 text-neutral-500">{keeper.region}</td><td className="px-4 py-4 font-semibold">{keeper.uptime}</td><td className="px-4 py-4 text-right font-mono">{keeper.matches}</td><td className="px-6 py-4 text-right font-semibold">{keeper.latency}</td></tr>)}</tbody></table></div></section>
    </div>
  </main>;
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) { return <article className="rounded-2xl border border-neutral-100 p-5 shadow-sm"><p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{label}</p><p className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{value}</p><p className="mt-2 text-[11px] text-neutral-400">{detail}</p></article>; }
function Coverage({ city, count }: { city: string; count: string }) { return <div className="rounded-2xl border border-neutral-100 bg-neutral-50/60 p-4"><p className="text-sm font-bold">{city}</p><p className="mt-1 text-[10px] text-neutral-400">{count}</p></div>; }
