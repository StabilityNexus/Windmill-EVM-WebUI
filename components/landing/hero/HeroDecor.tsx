'use client';

import FloatingCard from '@/components/ui/FloatingCard';

// ─── HeroDecor ─────────────────────────────────────────────────
//
// Foreground/background graphic elements for the hero stage:
//   • dashed frame + faint map disc behind the cards
//   • oversized "6+" metric, lower-left — reads as a graphic
//   • small spinning brand star + tiny geometric marks
//
// Decorative (aria-hidden), non-interactive, lg+ only.

function DashedFrame() {
  return (
    <span className="absolute left-[14%] top-[36%] hidden h-40 w-56 rounded-3xl border-2 border-dashed border-neutral-400/35 lg:block" />
  );
}

function MapDisc() {
  return (
    <span
      className="absolute right-[13%] top-[58%] hidden h-32 w-32 rounded-full opacity-70 lg:block"
      style={{
        backgroundColor: 'var(--canvas-sunken)',
        backgroundImage:
          'linear-gradient(rgba(20,16,6,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(20,16,6,0.08) 1px, transparent 1px)',
        backgroundSize: '14px 14px',
        maskImage: 'radial-gradient(circle, #000 60%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(circle, #000 60%, transparent 100%)',
      }}
    />
  );
}

function HeroMetric() {
  return (
    <FloatingCard
      depth={14}
      rotateY={12}
      rotate={-5}
      float="soft"
      elevation="none"
      className="absolute left-[2%] top-[68%] z-30 hidden lg:block"
    >
      <div className="flex flex-col items-start">
        <span
          className="select-none text-[8rem] font-black leading-[0.78] tracking-tight text-foreground"
          style={{ textShadow: '12px 14px 0 rgba(255,197,23,0.4)' }}
        >
          6+
        </span>
        <span className="mt-1.5 pl-1 text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
          Supported chains
        </span>
      </div>
    </FloatingCard>
  );
}

function BrandStar() {
  return (
    <FloatingCard
      depth={30}
      float="none"
      elevation="none"
      className="absolute left-[10%] top-[84%] z-30 hidden lg:block"
    >
      <svg
        width="44"
        height="44"
        viewBox="0 0 64 64"
        className="animate-spin-slow drop-shadow-[0_10px_16px_rgba(20,16,6,0.22)]"
      >
        <defs>
          <linearGradient id="heroStarGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffd85e" />
            <stop offset="1" stopColor="#f5b301" />
          </linearGradient>
        </defs>
        <path
          d="M32 4 L39 24 L60 24 L43 37 L49 58 L32 45 L15 58 L21 37 L4 24 L25 24 Z"
          fill="url(#heroStarGrad)"
          stroke="#cf9e12"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </FloatingCard>
  );
}

function Marks() {
  return (
    <>
      <span className="absolute right-[30%] top-[30%] hidden h-3 w-3 rotate-45 rounded-[3px] border-2 border-brand-green/50 lg:block" />
      <span className="absolute left-[38%] top-[90%] hidden h-2.5 w-2.5 rounded-full bg-brand/70 lg:block" />
      <span className="absolute right-[40%] top-[88%] hidden text-lg font-black text-neutral-300 dark:text-neutral-700 lg:block">
        +
      </span>
    </>
  );
}

export default function HeroDecor() {
  return (
    <>
      <DashedFrame />
      <MapDisc />
      <HeroMetric />
      <BrandStar />
      <Marks />
    </>
  );
}
