import Link from 'next/link';
import WalletModal from '@/components/wallet/WalletModal';
// import StatsSection from '@/components/landing/StatsSection';

export default function StatsPage() {
  return (
    <main className="w-full min-h-screen bg-white text-black pt-24 flex flex-col items-center justify-center">
      <WalletModal />
      
      <div className="text-center px-6 py-20 flex flex-col items-center gap-4">
        <span className="text-5xl font-mono tracking-widest text-neutral-300">404</span>
        <h1 className="text-xl font-bold tracking-tight text-black">Stats Under Construction</h1>
        <p className="text-neutral-500 text-xs max-w-sm leading-relaxed">
          The stats analytics page is temporarily offline for keeper network database migration. Check back soon.
        </p>
        <Link
          href="/"
          className="mt-6 rounded-full bg-black px-6 py-2 text-xs font-bold text-white hover:bg-neutral-800 transition-colors shadow-sm"
        >
          Return Home
        </Link>
      </div>

      {/* Preserve code structure for later recovery:
      <div className="py-12 flex flex-col items-center">
        <div className="text-center max-w-2xl mx-auto px-6 mb-12">
          <h1 className="text-3xl font-extrabold tracking-tight text-black">Protocol Analytics</h1>
          <p className="text-neutral-500 text-sm mt-2">Real-time statistics collected across all active EVM keeper networks.</p>
        </div>
        <StatsSection />
      </div>
      */}
    </main>
  );
}
