'use client';

import { Bookmark, BadgeCheck, Eye, Share2, RefreshCw, Plus, ChevronRight } from 'lucide-react';
import FloatingCard from '@/components/ui/FloatingCard';

// ─── HeroCollage ───────────────────────────────────────────────
//
// Windmill feature cards scattered around the central phone inside the
// art-directed hero card: two smaller cards toward the upper corners,
// two larger detailed cards lower down that cross the card's side
// edges. Controlled rotations, layered depth, some crop past the card
// boundary. Decorative only (aria-hidden), simplified below lg.

const STARFIELD =
  "radial-gradient(1px 1px at 18% 28%, rgba(255,255,255,0.9), transparent), radial-gradient(1px 1px at 62% 14%, rgba(255,255,255,0.7), transparent), radial-gradient(1.5px 1.5px at 82% 58%, rgba(255,255,255,0.85), transparent), radial-gradient(1px 1px at 38% 74%, rgba(255,255,255,0.6), transparent)";

interface CardProps {
  className: string;
  cardWidth?: string;
  depth: number;
  rotateX?: number;
  rotateY?: number;
  rotate?: number;
  float?: 'soft' | 'soft-delayed' | 'soft-lg' | 'drift' | 'none';
  avatar: { initials: string; from: string; to: string };
  handle: string;
  sub: string;
  scene: string;
  image?: string;
  imageSize?: string;
  views: string;
  shares: string;
  caption: string;
  stat: string;
  stats?: { label: string; value: string }[];
}

function IconBtn({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow-sm">
      {children}
    </span>
  );
}

function CollageCard({
  className,
  cardWidth = 'w-52 lg:w-60',
  depth,
  rotateX = 4,
  rotateY = 0,
  rotate = 0,
  float = 'soft',
  avatar,
  handle,
  sub,
  scene,
  image,
  imageSize = '72%',
  views,
  shares,
  caption,
  stat,
  stats,
}: CardProps) {
  return (
    <FloatingCard
      depth={depth}
      rotateX={rotateX}
      rotateY={rotateY}
      rotate={rotate}
      float={float}
      elevation="none"
      className={className}
    >
      <div className={`card-3d ${cardWidth} rounded-[1.75rem] p-3`}>
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1.5">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${avatar.from} ${avatar.to} text-[9px] font-bold text-white`}
            >
              {avatar.initials}
            </span>
            <div className="leading-tight">
              <p className="flex items-center gap-0.5 text-[10px] font-bold text-foreground">
                {handle}
                <BadgeCheck className="h-3 w-3 text-brand-green" />
              </p>
              <p className="font-mono text-[8px] text-neutral-400">{sub}</p>
            </div>
          </div>
          <Bookmark className="h-3.5 w-3.5 text-neutral-400" />
        </div>

        <div className={`relative mt-2.5 h-32 overflow-hidden rounded-[1.35rem] bg-gradient-to-br lg:h-36 ${scene}`}>
          <div className="absolute inset-0" style={{ backgroundImage: STARFIELD }} />
          {image && (
            <div
              className="absolute inset-0 bg-center bg-no-repeat drop-shadow-[0_12px_18px_rgba(20,16,6,0.35)]"
              style={{ backgroundImage: `url('${image}')`, backgroundSize: imageSize }}
            />
          )}
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-2 flex justify-center gap-2">
            <IconBtn>
              <RefreshCw className="h-3 w-3" />
            </IconBtn>
            <IconBtn>
              <Plus className="h-3 w-3" />
            </IconBtn>
            <IconBtn>
              <ChevronRight className="h-3 w-3" />
            </IconBtn>
          </div>
        </div>

        <div className="mt-2.5 px-0.5">
          <p className="text-[11px] font-bold leading-snug text-foreground">{caption}</p>

          {stats && (
            <div className="mt-2 grid grid-cols-3 gap-1.5">
              {stats.map((s) => (
                <div key={s.label} className="rounded-lg bg-black/[0.03] px-1.5 py-1 dark:bg-white/[0.05]">
                  <p className="text-[10px] font-black leading-none text-foreground">{s.value}</p>
                  <p className="mt-0.5 text-[7px] font-semibold uppercase tracking-wide text-neutral-400">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-2 flex items-center justify-between text-neutral-400">
            <span className="flex items-center gap-2.5 text-[9px] font-semibold">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {views}
              </span>
              <span className="flex items-center gap-1">
                <Share2 className="h-3 w-3" />
                {shares}
              </span>
            </span>
            <span className="rounded-full bg-foreground px-2.5 py-1 text-[10px] font-bold text-background">
              {stat}
            </span>
          </div>
        </div>
      </div>
    </FloatingCard>
  );
}

export default function HeroCollage() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden>
      {/* left outer — behind the phone, escapes the panel's left edge */}
      <CollageCard
        className="absolute left-[-1%] top-[30%] z-10"
        cardWidth="lg:w-64"
        depth={40}
        rotateY={10}
        rotate={-5}
        float="soft"
        avatar={{ initials: 'Ξ', from: 'from-sky-300', to: 'to-blue-500' }}
        handle="maker.eth"
        sub="ETH / USDC"
        scene="from-sky-400 to-blue-700"
        image="/hero/chart.png"
        views="1.2k"
        shares="84"
        caption="Set a buy curve — the price slides down each block until it fills."
        stat="Configure"
      />

      {/* left inner — larger, overlaps the phone's left side */}
      <CollageCard
        className="absolute left-[15%] top-[44%] z-40"
        cardWidth="lg:w-72"
        depth={24}
        rotateY={8}
        rotate={-9}
        float="soft-delayed"
        avatar={{ initials: '0x', from: 'from-amber-300', to: 'to-orange-500' }}
        handle="keeper-0x9f"
        sub="solver-node"
        scene="from-emerald-400 to-green-700"
        image="/hero/handshake.png"
        views="3.4k"
        shares="210"
        caption="Keepers sweep crossed orders automatically — no central book."
        stats={[
          { label: 'swept', value: '2' },
          { label: 'fill px', value: '1,847' },
          { label: 'latency', value: '2s' },
        ]}
        stat="+0.42 ETH"
      />

      {/* right outer — behind the phone, escapes the panel's right edge */}
      <CollageCard
        className="absolute right-[0%] top-[26%] z-10"
        cardWidth="lg:w-64"
        depth={48}
        rotateY={-10}
        rotate={5}
        float="soft"
        avatar={{ initials: '⚙', from: 'from-fuchsia-300', to: 'to-purple-600' }}
        handle="windmill.core"
        sub="settlement"
        scene="from-indigo-400 to-violet-700"
        image="/hero/rocket.png"
        views="5.1k"
        shares="318"
        caption="Every match settles atomically on-chain — verifiable in the explorer."
        stat="Settled"
      />

      {/* right inner — globe visual, sits behind the phone's lower-left */}
      <CollageCard
        className="absolute right-[12%] top-[50%] z-10"
        cardWidth="lg:w-72"
        depth={26}
        rotateY={-8}
        rotate={8}
        float="soft-delayed"
        avatar={{ initials: '◎', from: 'from-teal-300', to: 'to-cyan-600' }}
        handle="multichain"
        sub="6+ EVM networks"
        scene="from-cyan-400 to-teal-700"
        image="/hero/network.png"
        imageSize="96%"
        views="9.7k"
        shares="540"
        caption="Deploy on any EVM chain — Ethereum, Base, Polygon, BSC, Arbitrum."
        stats={[
          { label: 'chains', value: '6+' },
          { label: 'nodes', value: '12' },
          { label: 'uptime', value: '99.9%' },
        ]}
        stat="Any EVM"
      />
    </div>
  );
}
