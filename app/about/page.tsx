import WalletModal from '@/components/wallet/WalletModal';

export default function AboutPage() {
  return (
    <main className="w-full min-h-screen bg-white text-black pt-24">
      {/* Wallet connection modal */}
      <WalletModal />

      <div className="max-w-3xl mx-auto px-6 py-16 flex flex-col gap-8 animate-float">
        <div>
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">About Us</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-black mt-2">
            Stability Nexus Protocol
          </h1>
        </div>
        <p className="text-neutral-500 leading-relaxed text-sm sm:text-base">
          Stability Nexus is a decentralized research and deployment collective dedicated to building mathematically proven, resilient, and non-custodial financial infrastructure.
        </p>
        <p className="text-neutral-500 leading-relaxed text-sm sm:text-base">
          Our core mission with the Windmill Exchange is to build a zero-maintenance matching pipeline that runs autonomously. Through sophisticated time-sloped order curves and robust O(N log N) sweep logic, we bridge the gap between traditional orderbooks and automated market makers (AMMs).
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
          <div className="rounded-2xl border border-neutral-100 bg-neutral-50/50 p-6">
            <h3 className="text-base font-bold text-black">Resilient Infrastructure</h3>
            <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
              We verify properties formally, ensuring smart contracts meet safety constraints before deploying them to production nets.
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-100 bg-neutral-50/50 p-6">
            <h3 className="text-base font-bold text-black">Keeper Ecosystem</h3>
            <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
              Our keeper node binaries can be operated by anyone, promoting true decentralization and open settlement operations.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
