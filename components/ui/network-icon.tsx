import React from 'react';

// ─── Simple original glyphs (not traced brand marks) that evoke each
// chain's familiar color/shape language for quick visual recognition. ──

function DiamondGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3">
      <path d="M12 2 4 12l8 3 8-3-8-10Z" fill="currentColor" fillOpacity="0.55" />
      <path d="M12 16.5 4 13l8 9 8-9-8 3.5Z" fill="currentColor" />
    </svg>
  );
}

function RingGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3">
      <circle cx="12" cy="12" r="9" fill="currentColor" />
    </svg>
  );
}

function HexGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5">
      <path d="M12 2 20.66 7v10L12 22 3.34 17V7L12 2Z" fill="currentColor" />
    </svg>
  );
}

function TerminalGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
}

interface NetworkStyle {
  bg: string;
  fg: string;
  Glyph: React.FC;
  /** Dashed ring to flag test networks, so they're never mistaken for their mainnet counterpart. */
  testnet?: boolean;
}

// Sepolia keeps Ethereum's diamond glyph (same chain family) but gets its own
// color + a dashed "testnet" ring so it's never visually confused with mainnet.
const NETWORK_STYLES: Record<string, NetworkStyle> = {
  localhost: { bg: 'bg-neutral-600', fg: 'text-white', Glyph: TerminalGlyph },
  sepolia: { bg: 'bg-neutral-900', fg: 'text-white', Glyph: DiamondGlyph, testnet: true },
  ethereum: { bg: 'bg-neutral-400 dark:bg-neutral-500', fg: 'text-white', Glyph: DiamondGlyph },
  base: { bg: 'bg-[#0052FF]', fg: 'text-white', Glyph: RingGlyph },
  polygon: { bg: 'bg-[#8247E5]', fg: 'text-white', Glyph: HexGlyph },
  bsc: { bg: 'bg-[#F0B90B]', fg: 'text-black', Glyph: DiamondGlyph },
  etc: { bg: 'bg-[#328332]', fg: 'text-white', Glyph: DiamondGlyph },
};

const FALLBACK_STYLE: NetworkStyle = { bg: 'bg-neutral-500', fg: 'text-white', Glyph: RingGlyph };

export function NetworkIcon({ name, className = 'h-9 w-9' }: { name: string; className?: string }) {
  const { bg, fg, Glyph, testnet } = NETWORK_STYLES[name.toLowerCase()] ?? FALLBACK_STYLE;

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full ${bg} ${fg} ${className} ${
        testnet ? 'border-2 border-dashed border-neutral-300 dark:border-neutral-300' : ''
      }`}
    >
      <Glyph />
    </span>
  );
}
